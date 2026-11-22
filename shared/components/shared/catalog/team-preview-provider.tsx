"use client"

import "@/app/styles/project-form.css"
import "@/app/styles/forms.css"
import { createContext, useContext, useState, type ReactNode } from "react"
import { Info } from "lucide-react"
import { catalogPreview } from "@/shared/data/catalog-preview"
import { person } from "@/shared/lib/catalog-preview"
import { levelLabels } from "@/shared/lib/project-display"
import { useSkills } from "@/shared/lib/project-queries"
import type { SelectedSkill } from "@/shared/lib/project-form-submit"
import type {
  HackathonTeam,
  Skill,
  Team,
  TeamApplication,
  TeamMember,
  TeamSkill,
} from "@/types/models"
import { ApplicationStatus, ApplicationType, SkillLevel } from "@/types/enums"

export type TeamView = Omit<Team, "teamMembers" | "teamSkills" | "hackathonTeams"> & {
  teamMembers: TeamMember[]
  teamSkills: (TeamSkill & { skill: Skill })[]
  hackathonTeams: HackathonTeam[]
}

type TeamInput = { name: string; description: string; skills: SelectedSkill[] }
type Decision = "accept" | "decline" | "withdraw"
type PreviewState = { teams: TeamView[]; applications: TeamApplication[] }
const users = [1, 2, 3, 4].map((id) => ({ id, ...person(id) }))
const previewSkills = [...new Set(catalogPreview.teams.flatMap((team) => team.skills))].map(
  (name, index): Skill => ({ id: -(index + 1), name }),
)

function initialState(): PreviewState {
  return {
    teams: catalogPreview.teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      captainId: team.captainId,
      createdAt: "2026-11-09T00:00:00.000Z",
      teamMembers: team.members.map((userId) => ({
        teamId: team.id,
        userId,
        contribution: (team.contributions as Record<number, string | undefined>)[userId] ?? null,
      })),
      teamSkills: team.skills.map((name) => {
        const skill = previewSkills.find((item) => item.name === name)!
        const label = (team.levels as Record<string, string | undefined>)[name]
        const skillLevel =
          Object.values(SkillLevel).find((level) => levelLabels[level] === label) ??
          SkillLevel.BEGINNER
        return { teamId: team.id, skillId: skill.id, skill, skillLevel }
      }),
      hackathonTeams: team.eventIds.map((hackathonId) => ({ teamId: team.id, hackathonId })),
    })),
    applications: catalogPreview.teamApplications.map((item) => ({
      ...item,
      type: item.type as ApplicationType,
      status: item.status as ApplicationStatus,
      createdAt: "2026-11-09T00:00:00.000Z",
    })),
  }
}

function teamSkills(teamId: number, skills: SelectedSkill[]): TeamView["teamSkills"] {
  return skills.map(({ id, name, level }) => ({
    teamId,
    skillId: id,
    skillLevel: level,
    skill: { id, name },
  }))
}

export function applicationRights(
  application: TeamApplication,
  captainId: number,
  viewerId: number,
) {
  const request = application.type === ApplicationType.REQUEST
  const senderId = request ? application.userId : captainId
  const recipientId = request ? captainId : application.userId
  const pending = application.status === ApplicationStatus.PENDING
  return {
    canDecide: pending && recipientId === viewerId,
    canWithdraw: pending && senderId === viewerId,
  }
}

// Temporary in-memory preview. Replace this provider with the real team API once its contract exists.
function usePreviewState() {
  const [state, setState] = useState(initialState)
  const [viewerId, setViewerId] = useState(1)
  const dictionary = useSkills()
  const skills = [
    ...previewSkills,
    ...(dictionary.data ?? []).filter(
      (skill) => !previewSkills.some((sample) => sample.name === skill.name),
    ),
  ]

  function requireTeam(id: number) {
    const team = state.teams.find((item) => item.id === id)
    if (!team) throw new Error("Команда не найдена.")
    return team
  }

  function requireCaptain(team: TeamView) {
    if (team.captainId !== viewerId) throw new Error("Действие доступно капитану команды.")
  }

  function updateTeam(team: TeamView) {
    setState((previous) => ({
      ...previous,
      teams: previous.teams.map((item) => (item.id === team.id ? team : item)),
    }))
  }

  function validate(input: TeamInput) {
    if (!input.name.trim() || input.name.length > 100)
      throw new Error("Укажи название команды до 100 символов.")
  }

  function create(input: TeamInput) {
    validate(input)
    const id = Math.max(0, ...state.teams.map((team) => team.id)) + 1
    const team: TeamView = {
      id,
      name: input.name.trim(),
      description: input.description.trim() || null,
      captainId: viewerId,
      createdAt: new Date().toISOString(),
      teamMembers: [{ teamId: id, userId: viewerId, contribution: null }],
      teamSkills: teamSkills(id, input.skills),
      hackathonTeams: [],
    }
    setState((previous) => ({ ...previous, teams: [...previous.teams, team] }))
    return id
  }

  function edit(id: number, input: TeamInput) {
    const team = requireTeam(id)
    requireCaptain(team)
    validate(input)
    updateTeam({
      ...team,
      name: input.name.trim(),
      description: input.description.trim() || null,
      teamSkills: teamSkills(id, input.skills),
    })
  }

  function remove(id: number) {
    requireCaptain(requireTeam(id))
    setState((previous) => ({
      teams: previous.teams.filter((team) => team.id !== id),
      applications: previous.applications.filter((item) => item.teamId !== id),
    }))
  }

  function removeMember(id: number, userId: number) {
    const team = requireTeam(id)
    if (viewerId !== userId) requireCaptain(team)
    if (userId === team.captainId) throw new Error("Капитан не может покинуть команду.")
    updateTeam({
      ...team,
      teamMembers: team.teamMembers.filter((member) => member.userId !== userId),
    })
  }

  function contribution(id: number, value: string) {
    const team = requireTeam(id)
    if (!team.teamMembers.some((member) => member.userId === viewerId))
      throw new Error("Ты не состоишь в команде.")
    updateTeam({
      ...team,
      teamMembers: team.teamMembers.map((member) =>
        member.userId === viewerId ? { ...member, contribution: value.trim() || null } : member,
      ),
    })
  }

  function send(id: number, type: ApplicationType, message: string, username?: string) {
    const team = requireTeam(id)
    let userId = viewerId
    if (type === ApplicationType.INVITATION) {
      requireCaptain(team)
      const target = users.find(
        (user) => user.username.toLowerCase() === username?.trim().replace(/^@/, "").toLowerCase(),
      )
      if (!target) throw new Error("Выбери пользователя из списка демо-аккаунтов.")
      userId = target.id
    }
    if (team.teamMembers.some((member) => member.userId === userId))
      throw new Error("Пользователь уже в команде.")
    if (
      state.applications.some(
        (item) =>
          item.teamId === id && item.userId === userId && item.status === ApplicationStatus.PENDING,
      )
    ) {
      throw new Error("Между пользователем и командой уже есть ожидающая заявка или приглашение.")
    }
    const application: TeamApplication = {
      id: Math.max(0, ...state.applications.map((item) => item.id)) + 1,
      teamId: id,
      userId,
      type,
      message: message.trim() || null,
      status: ApplicationStatus.PENDING,
      createdAt: new Date().toISOString(),
    }
    setState((previous) => ({ ...previous, applications: [application, ...previous.applications] }))
  }

  function decide(id: number, action: Decision) {
    const application = state.applications.find((item) => item.id === id)
    if (!application) throw new Error("Заявка не найдена.")
    const team = requireTeam(application.teamId)
    const rights = applicationRights(application, team.captainId, viewerId)
    if (action === "withdraw" ? !rights.canWithdraw : !rights.canDecide)
      throw new Error("Действие недоступно.")
    if (
      action === "accept" &&
      team.teamMembers.some((member) => member.userId === application.userId)
    ) {
      throw new Error("Пользователь уже в команде.")
    }
    setState((previous) => ({
      teams:
        action === "accept"
          ? previous.teams.map((item) =>
              item.id === team.id
                ? {
                    ...item,
                    teamMembers: [
                      ...item.teamMembers,
                      { teamId: item.id, userId: application.userId, contribution: null },
                    ],
                  }
                : item,
            )
          : previous.teams,
      applications:
        action === "withdraw"
          ? previous.applications.filter((item) => item.id !== id)
          : previous.applications.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status:
                      action === "accept" ? ApplicationStatus.ACCEPTED : ApplicationStatus.DECLINED,
                  }
                : item,
            ),
    }))
  }

  return {
    ...state,
    viewerId,
    setViewerId,
    users,
    skills,
    create,
    edit,
    remove,
    removeMember,
    contribution,
    send,
    decide,
  }
}

const TeamPreviewContext = createContext<ReturnType<typeof usePreviewState> | null>(null)

export function TeamPreviewProvider({ children }: { children: ReactNode }) {
  const value = usePreviewState()
  return <TeamPreviewContext.Provider value={value}>{children}</TeamPreviewContext.Provider>
}

export function useTeamPreview() {
  const context = useContext(TeamPreviewContext)
  if (!context) throw new Error("TeamPreviewProvider is required")
  return context
}

export function TeamPreviewNotice() {
  const { viewerId, setViewerId, users } = useTeamPreview()
  return (
    <div className="project-form-note flex flex-wrap items-center" role="note">
      <Info size={16} aria-hidden="true" />
      <p className="min-w-0 flex-1">
        Демо-режим команд. API ещё разрабатывается. Изменения сбросятся при выходе из раздела или перезагрузке страницы.
      </p>
      <label className="field min-w-0">
        <span>Демо-пользователь</span>
        <select
          aria-label="Демо-пользователь"
          value={viewerId}
          onChange={(event) => setViewerId(Number(event.target.value))}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
