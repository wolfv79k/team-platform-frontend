"use client"

import "@/app/styles/catalog-details.css"
import "@/app/styles/forms.css"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Lightbulb, Users } from "lucide-react"
import axios from "axios"
import { ideasApi } from "@/services/ideas.api"
import { communitiesApi } from "@/services/communities.api"
import { apiErrorMessage } from "@/services/api-error"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { useViewer } from "@/shared/components/shared/layout/viewer-provider"
import { ProfileAvatar } from "@/shared/components/shared/profile/profile-media"
import { plural } from "@/shared/lib/catalog-preview"
import {
  collectionKeys,
  useCollectionDetail,
  type CollectionKind,
} from "@/shared/lib/collection-queries"
import { loginUrl } from "@/shared/lib/project-display"
import type { CommunityView, IdeaView, PublicUser } from "@/types/api"
import { Tag } from "./catalog-tags"

function Author({ user, label }: { user: PublicUser; label: string }) {
  const name = user.name || user.username
  return (
    <section className="entity-section">
      <h2>{label}</h2>
      <div className="member-row">
        <ProfileAvatar name={name} url={user.avatarUrl} size={40} />
        <div>
          <Link href={`/${encodeURIComponent(user.username)}`}>
            <strong>{name}</strong>
          </Link>
          <small>@{user.username}</small>
        </div>
      </div>
    </section>
  )
}

function OwnerActions({ kind, id, name }: { kind: CollectionKind; id: number; name: string }) {
  const client = useQueryClient()
  const router = useRouter()
  const mutation = useMutation({
    mutationFn: () => (kind === "ideas" ? ideasApi.remove(id) : communitiesApi.remove(id)),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: collectionKeys.catalog(kind) })
      await client.invalidateQueries({
        queryKey: collectionKeys.detail(kind, id),
        refetchType: "none",
      })
      router.replace(`/${kind}`)
      router.refresh()
    },
  })
  return (
    <>
      <div className="project-action-row">
        <Link className="btn secondary small" href={`/${kind}/${id}/edit`}>
          Редактировать
        </Link>
        <button
          className="btn quiet small"
          disabled={mutation.isPending}
          onClick={() => {
            if (window.confirm(`Удалить «${name}»?`)) mutation.mutate()
          }}
        >
          {mutation.isPending ? "Удаляем…" : "Удалить"}
        </button>
      </div>
      {mutation.isError && (
        <p className="field-error" role="alert">
          {apiErrorMessage(mutation.error)}
        </p>
      )}
    </>
  )
}

function IdeaDetail({ idea }: { idea: IdeaView }) {
  const viewer = useViewer()
  const owner = viewer?.id === idea.authorId
  return (
    <article className="entity-detail idea-detail">
      <div className="entity-heading">
        <span className="entity-mark" aria-hidden="true">
          <Lightbulb size={30} />
        </span>
        <div>
          <h1>{idea.name}</h1>
          <p>
            {new Intl.DateTimeFormat("ru-RU", {
              dateStyle: "long",
              timeZone: "Europe/Moscow",
            }).format(new Date(idea.createdAt))}
          </p>
        </div>
      </div>
      <section className="entity-section mt-6">
        <h2>Описание идеи</h2>
        <p className="reading whitespace-pre-wrap">
          {idea.description || "Описание пока не добавлено."}
        </p>
      </section>
      <Author user={idea.author} label="Автор идеи" />
      <section className="entity-section">
        <h2>Проект по идее</h2>
        {idea.projectId ? (
          <Link className="btn secondary" href={`/projects/${idea.projectId}`}>
            {idea.project?.name || "Открыть проект"}
          </Link>
        ) : owner ? (
          <Link className="btn primary" href={`/projects/new?ideaId=${idea.id}`}>
            Создать проект из идеи
          </Link>
        ) : (
          <p className="reading">Проект пока не создан.</p>
        )}
      </section>
      {owner && (
        <section className="entity-section">
          <OwnerActions kind="ideas" id={idea.id} name={idea.name} />
        </section>
      )}
    </article>
  )
}

function CommunityMembership({ community }: { community: CommunityView }) {
  const viewer = useViewer()
  const client = useQueryClient()
  const key = ["community-membership", viewer?.id, community.id] as const
  // The API does not return current membership. Cache only confirmed write results for this session.
  const membership = useQuery<boolean | null>({
    queryKey: key,
    queryFn: () => null,
    enabled: false,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  const mutation = useMutation({
    mutationFn: async (action: "join" | "leave") => {
      try {
        await communitiesApi[action](community.id)
      } catch (error) {
        if (
          action === "leave" &&
          axios.isAxiosError(error) &&
          error.response?.status === 404 &&
          apiErrorMessage(error) === "Вы не участник сообщества"
        )
          return
        throw error
      }
    },
    onSuccess: async (_, action) => {
      client.setQueryData(key, action === "join")
      await client.invalidateQueries({ queryKey: ["communities"] })
    },
  })
  if (viewer?.id === community.creatorId) return <Tag tone="blue">Ты создатель</Tag>
  if (!viewer)
    return (
      <Link className="btn primary" href={loginUrl(`/communities/${community.id}`)}>
        Войти, чтобы вступить
      </Link>
    )
  return (
    <div className="grid gap-2">
      <div className="project-action-row">
        {membership.data === true && <Tag tone="blue">Ты участник</Tag>}
        {membership.data !== true && (
          <button
            className="btn primary"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("join")}
          >
            Вступить
          </button>
        )}
        {membership.data !== false && (
          <button
            className="btn secondary"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("leave")}
          >
            Выйти
          </button>
        )}
      </div>
      {membership.data === null && (
        <small className="reading">Статус участия пока недоступен в API.</small>
      )}
      {mutation.isPending && <small role="status">Обновляем участие…</small>}
      {mutation.isError && (
        <p className="field-error" role="alert">
          {apiErrorMessage(mutation.error)}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="reading" role="status">
          {membership.data ? "Ты в сообществе." : "Ты вышел из сообщества."}
        </p>
      )}
    </div>
  )
}

function CommunityDetail({ community }: { community: CommunityView }) {
  const viewer = useViewer()
  return (
    <article className="entity-detail">
      <div className="entity-heading">
        <span className="entity-mark community" aria-hidden="true">
          <Users size={30} />
        </span>
        <div>
          <h1>{community.name}</h1>
          <p>{plural(community.membersCount, "участник", "участника", "участников")}</p>
        </div>
      </div>
      <div className="mt-4">
        <CommunityMembership key={viewer?.id ?? "guest"} community={community} />
      </div>
      <section className="entity-section mt-6">
        <h2>О сообществе</h2>
        <p className="reading whitespace-pre-wrap">
          {community.description || "Описание пока не добавлено."}
        </p>
      </section>
      <Author user={community.creator} label="Создатель сообщества" />
      {viewer?.id === community.creatorId && (
        <section className="entity-section">
          <OwnerActions kind="communities" id={community.id} name={community.name} />
        </section>
      )}
      <section className="entity-section">
        <h2>Публикации</h2>
        <p className="reading">Публикации появятся после подключения API постов и комментариев.</p>
      </section>
    </article>
  )
}

export default function RealCollectionDetail({ kind, id }: { kind: CollectionKind; id: number }) {
  const query = useCollectionDetail(kind, id)
  const item = query.data
  const title = kind === "ideas" ? "Идеи" : "Сообщества"
  return (
    <BrowseLayout title={item ? `${title} › ${item.name}` : title} back={`/${kind}`}>
      {query.isPending ? (
        <div className="empty-tab">
          <p>Загружаем данные…</p>
        </div>
      ) : query.isError ? (
        <div className="empty-tab">
          <h2>Не удалось загрузить данные</h2>
          <p>{apiErrorMessage(query.error)}</p>
          <button className="btn secondary" onClick={() => query.refetch()}>
            Повторить
          </button>
        </div>
      ) : (
        item &&
        ("authorId" in item ? <IdeaDetail idea={item} /> : <CommunityDetail community={item} />)
      )}
    </BrowseLayout>
  )
}
