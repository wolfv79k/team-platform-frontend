// Local, disposable contract fixture. It never connects to the deployed API or DB.
import { createServer } from "node:http"

const now = "2026-11-21T12:00:00.000Z"
const makeUser = (id, username, name) => ({
  id,
  username,
  name,
  email: `${username}@example.test`,
  bio: null,
  avatarUrl: null,
  role: "USER",
  createdAt: now,
  locationId: 1,
})
const users = [makeUser(1, "owner", "Автор"), makeUser(2, "applicant", "Кандидат")]
users.push({ ...makeUser(3, "moderator", "Администратор"), role: "ADMIN" })
const temporaryAdmin = { ...makeUser(4, "temporary_admin", "Временный администратор"), role: "ADMIN" }
users.push(temporaryAdmin)
const skills = [
  { id: 1, name: "React" },
  { id: 2, name: "TypeScript" },
]
const roles = [
  { id: 1, name: "Frontend" },
  { id: 2, name: "Backend" },
]
const userSkills = new Map()
const userSocialLinks = new Map()
const projects = []
const applications = []
const ideas = [
  {
    id: 1,
    name: "Идея проверки",
    description: "Идея из базы",
    authorId: 1,
    author: users[0],
    projectId: null,
    createdAt: now,
  },
]
const communities = [
  { id: 1, name: "Сообщество проверки", description: "Сообщество из базы", creatorId: 1, createdAt: now, members: new Set([1]) },
]
let nextIdeaId = 2
let nextCommunityId = 2
let nextProjectId = 1
let nextApplicationId = 1
function addProject(authorId, body) {
  const item = {
    id: nextProjectId++,
    name: body.name,
    description: body.description ?? null,
    slogan: body.slogan ?? null,
    status: "RECRUITMENT",
    authorId,
    author: users.find((user) => user.id === authorId),
    createdAt: now,
    projectUrl: body.projectUrl ?? null,
    logoUrl: null,
    videoUrl: body.videoUrl ?? null,
    coverImageUrls: [],
    partners: body.partners ?? [],
    projectMembers: [],
    projectSkills: [],
    projectOpenRoles: [],
  }
  item.projectMembers.push(member(item.id, authorId, body.roleId))
  projects.push(item)
  return item
}
function member(projectId, userId, roleId) {
  return {
    projectId,
    userId,
    roleId,
    contribution: null,
    user: users.find((user) => user.id === userId),
    role: roles.find((role) => role.id === roleId),
  }
}
addProject(1, { name: "Тестовый каталог", slogan: "Данные из тестового API", roleId: 1 })
projects[0].projectSkills.push({ projectId: 1, skillId: 1, skillLevel: "MIDDLE", skill: skills[0] })
projects[0].projectOpenRoles.push({ projectId: 1, roleId: 2, slots: 2, role: roles[1] })

const server = createServer(async (req, res) => {
  // Imitate a deployed API that only allows the production origin, not localhost.
  res.setHeader("Access-Control-Allow-Origin", "https://frontend.example.test")
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
  const send = (status, data) => {
    res.statusCode = status
    if (data === undefined) return res.end()
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(data))
  }
  const fail = (status, error) => send(status, { error })
  if (req.method === "OPTIONS") return send(204)
  const url = new URL(req.url, "http://localhost")
  const segments = url.pathname.split("/").filter(Boolean)
  const [, resource, id, sub, arg] = segments
  const auth = users.find((user) => req.headers.authorization === `Bearer mock-${user.id}`)
  const method = req.method
  if (url.pathname === "/fixture/revoke-temporary-admin" && method === "POST") {
    temporaryAdmin.role = "USER"
    return send(204)
  }
  if (url.pathname === "/media/test.png") {
    res.setHeader("Content-Type", "image/png")
    return res.end(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X9m8AAAAASUVORK5CYII=",
        "base64",
      ),
    )
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
  if (resource === "health") return send(200, { status: "ok" })
  if (resource === "skills") return send(200, skills)
  if (resource === "roles") return send(200, roles)
  if (resource === "locations") return send(200, [{ id: 1, name: "Санкт-Петербург" }])
  if (resource === "auth" && id === "login" && method === "POST") {
    const user = users.find((user) => user.email === body.email)
    if (!user || body.password !== "test-password") return fail(401, "Invalid credentials")
    return send(200, { user, token: `mock-${user.id}` })
  }
  if (resource === "auth" && id === "me") return auth ? send(200, auth) : fail(401, "Unauthorized")
  const filterApplications = (items) =>
    items.filter(
      (item) =>
        (!url.searchParams.has("status") || item.status === url.searchParams.get("status")) &&
        (!url.searchParams.has("type") || item.type === url.searchParams.get("type")),
    )
  const projectView = (project) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    logoUrl: project.logoUrl,
    authorId: project.authorId,
  })
  if (resource === "users" && id === "me" && sub === "applications")
    return auth
      ? send(200, filterApplications(applications.filter((item) => item.userId === auth.id)))
      : fail(401, "Unauthorized")
  if (resource === "users" && id === "me" && sub === "skills") {
    if (!auth) return fail(401, "Unauthorized")
    const skill = skills.find((item) => item.id === Number(arg))
    if (!skill) return fail(404, "Навык не найден")
    const key = `${auth.id}:${skill.id}`
    if (method === "PUT") {
      const item = { userId: auth.id, skillId: skill.id, skill, skillLevel: body.skillLevel ?? "BEGINNER" }
      userSkills.set(key, item)
      return send(200, item)
    }
    if (method === "DELETE") return userSkills.delete(key) ? send(204) : fail(404, "Навык не найден в профиле")
  }
  if (resource === "users" && id === "me" && sub === "socials") {
    if (!auth) return fail(401, "Unauthorized")
    const key = `${auth.id}:${arg}`
    if (method === "PUT") {
      const item = { userId: auth.id, platform: arg, url: body.url }
      userSocialLinks.set(key, item)
      return send(200, item)
    }
    if (method === "DELETE") return userSocialLinks.delete(key) ? send(204) : fail(404, "Ссылка не найдена")
  }
  if (resource === "users") {
    const user = users.find((user) => user.username === id)
    return user ? send(200, profile(user)) : fail(404, "User not found")
  }
  const paginate = (items) => {
    const page = Number(url.searchParams.get("page") || 1)
    const limit = Math.min(Number(url.searchParams.get("limit") || 10), 50)
    return { items: items.slice((page - 1) * limit, page * limit), page, limit, total: items.length }
  }
  const ideaView = (idea) => ({ ...idea, project: projects.find((project) => project.id === idea.projectId) ?? null })
  const communityView = ({ members, ...community }) => ({ ...community, creator: users.find((user) => user.id === community.creatorId), membersCount: members.size })
  if (resource === "ideas" && !id && method === "GET")
    return send(200, paginate(ideas.map(ideaView)))
  if (resource === "ideas" && !id && method === "POST") {
    if (!auth) return fail(401, "Unauthorized")
    const idea = { id: nextIdeaId++, name: body.name, description: body.description ?? null, authorId: auth.id, author: auth, projectId: null, createdAt: now }
    ideas.unshift(idea)
    return send(201, ideaView(idea))
  }
  if (resource === "ideas" && id) {
    const idea = ideas.find((item) => item.id === Number(id))
    if (!idea) return fail(404, "Idea not found")
    if (method === "GET") return send(200, ideaView(idea))
    if (!sub && method === "PATCH") {
      if (auth?.id !== idea.authorId) return fail(403, "Forbidden")
      Object.assign(idea, { name: body.name, description: body.description })
      return send(200, ideaView(idea))
    }
    if (!sub && method === "DELETE") {
      if (auth?.id !== idea.authorId) return fail(403, "Forbidden")
      ideas.splice(ideas.indexOf(idea), 1)
      return send(204)
    }
    if (sub === "project" && method === "POST") {
      if (!auth || auth.id !== idea.authorId || idea.projectId) return fail(403, "Forbidden")
      const project = addProject(auth.id, {
        name: idea.name,
        description: idea.description,
        roleId: body.roleId,
      })
      idea.projectId = project.id
      return send(201, project)
    }
  }
  if (resource === "communities" && !id && method === "GET") {
    const search = url.searchParams.get("search")?.toLowerCase() ?? ""
    return send(200, paginate(communities.filter((community) => community.name.toLowerCase().includes(search)).map(communityView)))
  }
  if (resource === "communities" && !id && method === "POST") {
    if (!auth) return fail(401, "Unauthorized")
    if (communities.some((community) => community.name === body.name)) return fail(409, "Сообщество с таким названием уже существует")
    const community = { id: nextCommunityId++, name: body.name, description: body.description ?? null, creatorId: auth.id, createdAt: now, members: new Set([auth.id]) }
    communities.unshift(community)
    const { members, ...record } = community
    return send(201, { ...record, communityMembers: [...members].map((id) => ({ userId: id, communityId: community.id, role: "MODERATOR", user: auth })) })
  }
  if (resource === "communities" && id) {
    const community = communities.find((item) => item.id === Number(id))
    if (!community) return fail(404, "Сообщество не найден")
    if (!sub && method === "GET") return send(200, communityView(community))
    if (!auth) return fail(401, "Unauthorized")
    if (sub === "members" && arg === "me") {
      if (method === "PUT") { community.members.add(auth.id); return send(204) }
      if (method === "DELETE") {
        if (auth.id === community.creatorId) return fail(409, "Создатель не может выйти из сообщества")
        if (!community.members.delete(auth.id)) return fail(404, "Вы не участник сообщества")
        return send(204)
      }
    }
    if (auth.id !== community.creatorId) return fail(403, "Forbidden")
    if (!sub && method === "PATCH") {
      if (communities.some((item) => item.id !== community.id && item.name === body.name)) return fail(409, "Сообщество с таким названием уже существует")
      Object.assign(community, { name: body.name, description: body.description })
      return send(200, communityView(community))
    }
    if (!sub && method === "DELETE") { communities.splice(communities.indexOf(community), 1); return send(204) }
  }
  if (resource === "projects" && !id && method === "GET") {
    const items = projects.filter(
      (project) =>
        (!url.searchParams.has("search") ||
          project.name.toLowerCase().includes(url.searchParams.get("search").toLowerCase())) &&
        (!url.searchParams.has("status") || project.status === url.searchParams.get("status")) &&
        (!url.searchParams.has("skillId") ||
          project.projectSkills.some(
            (skill) => skill.skillId === Number(url.searchParams.get("skillId")),
          )) &&
        (!url.searchParams.has("roleId") ||
          project.projectOpenRoles.some(
            (role) => role.roleId === Number(url.searchParams.get("roleId")) && role.slots > 0,
          )),
    )
    const page = Number(url.searchParams.get("page") || 1),
      limit = Number(url.searchParams.get("limit") || 10)
    return send(200, {
      items: items.slice((page - 1) * limit, page * limit),
      page,
      limit,
      total: items.length,
    })
  }
  if (resource === "projects" && !id && method === "POST") {
    const allowed = [
      "name",
      "roleId",
      "description",
      "slogan",
      "projectUrl",
      "videoUrl",
      "partners",
    ]
    if (Object.keys(body).some((key) => !allowed.includes(key)))
      return fail(400, "Unsupported create field")
    return auth ? send(201, addProject(auth.id, body)) : fail(401, "Unauthorized")
  }
  if (resource === "projects" && id) {
    const project = projects.find((item) => item.id === Number(id))
    if (!project) return fail(404, "Проект не найден")
    if (!sub && method === "GET") return send(200, project)
    if (!auth) return fail(401, "Unauthorized")
    const owner = project.authorId === auth.id
    if (!sub && method === "PATCH") {
      if (!owner) return fail(403, "Forbidden")
      const allowed = [
        "name",
        "status",
        "description",
        "slogan",
        "projectUrl",
        "videoUrl",
        "partners",
      ]
      if (Object.keys(body).some((key) => !allowed.includes(key)))
        return fail(400, "Unsupported update field")
      Object.assign(project, body)
      return send(200, project)
    }
    if (!sub && method === "DELETE") {
      if (!owner) return fail(403, "Forbidden")
      projects.splice(projects.indexOf(project), 1)
      for (const idea of ideas) if (idea.projectId === project.id) idea.projectId = null
      return send(204)
    }
    if (sub === "skills" && owner) {
      project.projectSkills = project.projectSkills.filter((item) => item.skillId !== Number(arg))
      if (method === "DELETE") return send(204)
      const result = {
        projectId: project.id,
        skillId: Number(arg),
        skillLevel: body.skillLevel,
        skill: skills.find((skill) => skill.id === Number(arg)),
      }
      project.projectSkills.push(result)
      return send(200, result)
    }
    if (sub === "roles" && owner) {
      project.projectOpenRoles = project.projectOpenRoles.filter(
        (item) => item.roleId !== Number(arg),
      )
      if (method === "DELETE") return send(204)
      const result = {
        projectId: project.id,
        roleId: Number(arg),
        slots: body.slots,
        role: roles.find((role) => role.id === Number(arg)),
      }
      project.projectOpenRoles.push(result)
      return send(200, result)
    }
    if (sub === "members") {
      const userId = arg === "me" ? auth.id : Number(arg)
      const person = project.projectMembers.find((item) => item.userId === userId)
      if (!person || (arg !== "me" && !owner)) return fail(403, "Forbidden")
      if (method === "DELETE") {
        project.projectMembers = project.projectMembers.filter((item) => item.userId !== userId)
        return send(204)
      }
      if (arg === "me") person.contribution = body.contribution
      else {
        person.roleId = body.roleId
        person.role = roles.find((role) => role.id === body.roleId)
      }
      return send(200, person)
    }
    if (sub === "applications" && method === "GET")
      return owner
        ? send(
            200,
            filterApplications(applications.filter((item) => item.projectId === project.id)),
          )
        : fail(403, "Forbidden")
    if (["applications", "invitations"].includes(sub) && method === "POST") {
      if (sub === "invitations" && !owner) return fail(403, "Forbidden")
      const userId = sub === "applications" ? auth.id : body.userId
      const result = {
        id: nextApplicationId++,
        userId,
        projectId: project.id,
        roleId: body.roleId,
        type: sub === "applications" ? "REQUEST" : "INVITATION",
        status: "PENDING",
        message: body.message,
        createdAt: now,
        project: projectView(project),
        user: users.find((user) => user.id === userId),
        role: roles.find((role) => role.id === body.roleId),
      }
      applications.push(result)
      return send(201, result)
    }
    return fail(403, "Forbidden")
  }
  if (resource === "applications" && auth) {
    const item = applications.find((item) => item.id === Number(id))
    if (!item) return fail(404, "Application not found")
    const project = projects.find((p) => p.id === item.projectId)
    if (method === "DELETE") {
      applications.splice(applications.indexOf(item), 1)
      return send(204)
    }
    if (sub === "accept") {
      item.status = "ACCEPTED"
      project.projectMembers.push(member(project.id, item.userId, item.roleId))
      project.projectOpenRoles.find((role) => role.roleId === item.roleId).slots--
    }
    if (sub === "decline") item.status = "DECLINED"
    return send(200, item)
  }
  return fail(404, "Route not found")
})
function profile(user) {
  return {
    ...user,
    location: { id: 1, name: "Санкт-Петербург" },
    userSkills: [...userSkills.values()].filter((item) => item.userId === user.id),
    socialLinks: [...userSocialLinks.values()].filter((item) => item.userId === user.id),
    projectMembers: projects.flatMap((project) =>
      project.projectMembers
        .filter((member) => member.userId === user.id)
        .map((member) => ({ ...member, project: { ...project, projectMembers: undefined } })),
    ),
  }
}
server.listen(Number(process.env.MOCK_API_PORT || 3108), "127.0.0.1")
