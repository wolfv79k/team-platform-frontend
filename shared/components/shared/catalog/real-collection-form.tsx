"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Lightbulb, Users } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ideasApi } from "@/services/ideas.api"
import { communitiesApi } from "@/services/communities.api"
import { apiErrorMessage } from "@/services/api-error"
import { BrowseLayout } from "@/shared/components/shared/layout/browse-layout"
import { useViewer } from "@/shared/components/shared/layout/viewer-provider"
import { useCollectionDetail, type CollectionKind } from "@/shared/lib/collection-queries"
import { loginUrl } from "@/shared/lib/project-display"
import { formValue } from "@/shared/lib/project-form-submit"
import type { IdeaView, CommunityView } from "@/types/api"
import { FormField, FormHeading, FormSection, ProjectFormFooter } from "./project-form-fields"

function CollectionEditor({
  kind,
  item,
}: {
  kind: CollectionKind
  item?: IdeaView | CommunityView
}) {
  const router = useRouter()
  const client = useQueryClient()
  const [validation, setValidation] = useState("")
  const isIdea = kind === "ideas"
  const back = item ? `/${kind}/${item.id}` : `/${kind}`
  const mutation = useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      const api = isIdea ? ideasApi : communitiesApi
      return item ? api.update(item.id, input) : api.create(input)
    },
    onSuccess: async (saved) => {
      await client.invalidateQueries({ queryKey: [kind] })
      router.push(`/${kind}/${saved.id}`)
      router.refresh()
    },
  })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    const data = new FormData(event.currentTarget)
    const name = formValue(data, "name")
    const description = formValue(data, "description")
    if (!name || name.length > 100) {
      setValidation("Укажи название до 100 символов.")
      return
    }
    setValidation("")
    mutation.mutate({ name, description })
  }
  const title = item
    ? isIdea
      ? "Редактировать идею"
      : "Редактировать сообщество"
    : isIdea
      ? "Новая идея"
      : "Создать сообщество"
  return (
    <form className="project-form" onSubmit={submit}>
      <FormHeading
        icon={isIdea ? Lightbulb : Users}
        title={title}
        description={
          isIdea ? "Расскажи о задаче, которую хочешь решить." : "Объедини людей вокруг общей темы."
        }
      />
      <fieldset className="project-form-content" disabled={mutation.isPending}>
        <FormSection title="Основная информация">
          <FormField
            name="name"
            label={isIdea ? "Название идеи" : "Название сообщества"}
            initial={item?.name}
            required
            max={100}
            placeholder={isIdea ? "Кратко опиши суть идеи" : "Название сообщества"}
          />
          <FormField
            name="description"
            label={isIdea ? "Описание идеи" : "О сообществе"}
            initial={item?.description}
            rows={7}
            placeholder={
              isIdea
                ? "Какую проблему решает идея и для кого она полезна?"
                : "Какие темы обсуждаем и кому будет интересно вступить?"
            }
          />
        </FormSection>
      </fieldset>
      <ProjectFormFooter
        back={back}
        submitLabel={item ? "Сохранить" : isIdea ? "Опубликовать идею" : "Создать сообщество"}
        pending={mutation.isPending}
        error={validation || (mutation.isError ? apiErrorMessage(mutation.error) : "")}
      />
    </form>
  )
}

export default function RealCollectionForm({ kind, id }: { kind: CollectionKind; id?: number }) {
  const viewer = useViewer()
  const query = useCollectionDetail(kind, id)
  const item = query.data
  const back = id === undefined ? `/${kind}` : `/${kind}/${id}`
  const owner = item && ("authorId" in item ? item.authorId : item.creatorId)
  return (
    <BrowseLayout
      title={
        kind === "ideas"
          ? id
            ? "Редактирование идеи"
            : "Новая идея"
          : id
            ? "Редактирование сообщества"
            : "Новое сообщество"
      }
      back={back}
    >
      {!viewer ? (
        <div className="empty-tab">
          <p>Для продолжения необходимо войти.</p>
          <Link className="btn primary" href={loginUrl(id ? `${back}/edit` : `${back}/new`)}>
            Войти
          </Link>
        </div>
      ) : id !== undefined && !item ? (
        <div className="empty-tab">
          <p>{query.isError ? apiErrorMessage(query.error) : "Загружаем данные…"}</p>
          {query.isError && (
            <button className="btn secondary" onClick={() => query.refetch()}>
              Повторить
            </button>
          )}
        </div>
      ) : item && owner !== viewer.id ? (
        <div className="empty-tab">
          <h2>Недостаточно прав</h2>
          <p>Изменять данные может только создатель.</p>
          <Link className="btn secondary" href={back}>
            Назад
          </Link>
        </div>
      ) : (
        <CollectionEditor key={`${kind}-${id ?? "new"}`} kind={kind} item={item} />
      )}
    </BrowseLayout>
  )
}
