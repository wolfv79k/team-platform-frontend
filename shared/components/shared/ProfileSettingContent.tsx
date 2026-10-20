"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Tags,
  Link2,
  Plus,
  X,
} from "lucide-react";


import { Input } from "@/shared/components/ui/input";

type ProfileFields = {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  gender: string;
  website: string;
  telegram: string;
  linkedin: string;
  instagram: string;
  figma: string;
  github: string;
  other: string;
};

type SocialKey =
  | "telegram"
  | "linkedin"
  | "instagram"
  | "figma"
  | "github"
  | "other";


  // Примеры технологий
const technologies = [
  "Figma",
  "Product Design",
  "JavaScript",
  "Product Management",
  "ReactJS",
  "TypeScript",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
];

const socialFields: {
  key: SocialKey;
  label: string;
  icon?: string;
  placeholder: string;
}[] = [
  {
    key: "telegram",
    label: "Telegram",
    icon: "/Telegram.svg",
    placeholder: "t.me/",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "/LinkedIn.svg",
    placeholder: "linkedin.com/",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "/Instagram.svg",
    placeholder: "instagram.com/",
  },
  {
    key: "figma",
    label: "Figma",
    icon: "/Figma.svg",
    placeholder: "figma.com/@",
  },
  {
    key: "github",
    label: "GitHub",
    icon: "/GitHub.svg",
    placeholder: "github.com/",
  },
  {
    key: "other",
    label: "Другая ссылка",
    placeholder: "Другое",
  },
];

const initialFields: ProfileFields = {
  username: "",
  firstName: "",
  lastName: "",
  bio: "",
  location: "",
  gender: "",
  website: "",
  telegram: "",
  linkedin: "",
  instagram: "",
  figma: "",
  github: "",
  other: "",
};

export default function ProfileSettingsContent() {
  const [fields, setFields] = useState<ProfileFields>(initialFields);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    [],
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const updateField = (key: keyof ProfileFields, value: string) => {
    setFields((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleTechnology = (technology: string) => {
    setSelectedTechnologies((previous) => {
      if (previous.includes(technology)) {
        return previous.filter((item) => item !== technology);
      }

      if (previous.length >= 10) return previous;

      return [...previous, technology];
    });
  };


  return (
    <main className="min-w-0 flex-1 bg-white pb-20 lg:pb-0">
      <header className="flex h-10 items-center gap-2 border-b border-gray-200 px-4 sm:px-6">
        <div
          className="flex items-center gap-2 text-gray-500"
        >
          <Link
            href="/user"
            className="flex p-1 items-center justify-center rounded border border-gray-200">
            <ArrowLeft size={16} />
          </Link>

          Настройки
        </div>

        <span className="text-gray-400">›</span>

        <span className="font-medium text-gray-900">Профиль</span>
      </header>

      {/* Базовая информация */}
      <section className="px-4 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />

          <UserRound size={13} className="shrink-0 text-indigo-500" />

          <h2 className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Базовая информация
          </h2>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Аватар */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {avatarPreview && (
              <Image
                src={avatarPreview}
                alt="Аватар профиля"
                fill
                sizes="44px"
                unoptimized
                className="object-cover"
              />
            )}
          </div>

          <div className="min-w-0">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Обновить аватар
            </button>

            <p className="mt-1 text-[10px] text-gray-400">
              Рекомендуемый размер: 400 × 400 px
            </p>
          </div>
        </div>

        {/* Username */}
        <div className="mb-3">
          <label
            htmlFor="profile-username"
            className="mb-1.5 block text-xs font-medium text-gray-800"
          >
            Username <span className="text-rose-500">*</span>
          </label>

          <Input
            id="profile-username"
            value={fields.username}
            onChange={(event) => updateField("username", event.target.value)}
            placeholder="Username"
            className="h-9 border-gray-200 text-xs shadow-none focus-visible:ring-indigo-400"
          />
        </div>

        {/* Имя и фамилия */}
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-first-name"
              className="mb-1.5 block text-xs font-medium text-gray-800"
            >
              Имя <span className="text-rose-500">*</span>
            </label>

            <Input
              id="profile-first-name"
              value={fields.firstName}
              onChange={(event) =>
                updateField("firstName", event.target.value)
              }
              placeholder="Ваше имя"
              className="h-9 border-gray-200 text-xs shadow-none focus-visible:ring-indigo-400"
            />
          </div>

          <div>
            <label
              htmlFor="profile-last-name"
              className="mb-1.5 block text-xs font-medium text-gray-800"
            >
              Фамилия <span className="text-rose-500">*</span>
            </label>

            <Input
              id="profile-last-name"
              value={fields.lastName}
              onChange={(event) =>
                updateField("lastName", event.target.value)
              }
              placeholder="Ваша фамилия"
              className="h-9 border-gray-200 text-xs shadow-none focus-visible:ring-indigo-400"
            />
          </div>
        </div>

        {/* Краткое описание */}
        <div className="mb-1">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="profile-bio"
              className="text-xs font-medium text-gray-800"
            >
              О себе <span className="text-rose-500">*</span>
            </label>

            <span className="text-[10px] tabular-nums text-gray-400">
              {fields.bio.length}/120
            </span>
          </div>

          <textarea
            id="profile-bio"
            value={fields.bio}
            onChange={(event) =>
              updateField("bio", event.target.value.slice(0, 120))
            }
            maxLength={120}
            rows={3}
            placeholder="Расскажите немного о себе"
            className="w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition-shadow placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0"
          />

          <p className="mt-1 text-[11px] text-indigo-500">
            Первое, что увидят пользователи в вашем профиле
          </p>
        </div>

        {/* Локация и пол */}
        <div className="mb-3 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-location"
              className="mb-1.5 block text-xs font-medium text-gray-800"
            >
              Локация
            </label>

            <select
              id="profile-location"
              value={fields.location}
              onChange={(event) => updateField("location", event.target.value)}
              className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <option value="">Выберите страну/город</option>
              <option value="Москва">Москва</option>
              <option value="Санкт-Петербург">Санкт-Петербург</option>
              <option value="Казань">Казань</option>
              <option value="Новосибирск">Новосибирск</option>
              <option value="Удалённо">Удалённо</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="profile-gender"
              className="mb-1.5 block text-xs font-medium text-gray-800"
            >
              Пол
            </label>

            <select
              id="profile-gender"
              value={fields.gender}
              onChange={(event) => updateField("gender", event.target.value)}
              className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <option value="">Выберите</option>
              <option value="Мужской">Мужской</option>
              <option value="Женский">Женский</option>
              <option value="Не указан">Не указывать</option>
            </select>
          </div>
        </div>

        {/* Сайт или резюме */}
        <div>
          <label
            htmlFor="profile-website"
            className="mb-1.5 block text-xs font-medium text-gray-800"
          >
            Ссылка на ваш сайт/резюме
          </label>

          <Input
            id="profile-website"
            type="url"
            value={fields.website}
            onChange={(event) => updateField("website", event.target.value)}
            placeholder="https://..."
            className="h-9 border-gray-200 text-xs shadow-none focus-visible:ring-indigo-400"
          />
        </div>
      </section>

      {/* Теги и технологии */}
      <section className="px-4 py-5 sm:px-6">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />

          <Tags size={13} className="shrink-0 text-indigo-500" />

          <h2 className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Теги и технологии
          </h2>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="profile-technologies"
            className="text-xs font-medium text-gray-800"
          >
            Найдите технологии, навыки и роли
          </label>

          <span className="text-[11px] text-indigo-500">
            В профиле отображаются до 10
          </span>
        </div>

        <select
          id="profile-technologies"
          value=""
          onChange={(event) => {
            const value = event.target.value;
            if (value) toggleTechnology(value);
          }}
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <option value="">Выберите технологию или навык</option>

          {technologies
            .filter((technology) => !selectedTechnologies.includes(technology))
            .map((technology) => (
              <option key={technology} value={technology}>
                {technology}
              </option>
            ))}
        </select>

        {selectedTechnologies.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[10px] text-gray-500">
              Выбранные навыки
            </p>

            <div className="flex flex-wrap gap-1.5">
              {selectedTechnologies.map((technology) => (
                <button
                  key={technology}
                  type="button"
                  onClick={() => toggleTechnology(technology)}
                  className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  {technology}
                  <X size={11} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <p className="mb-2 text-[10px] text-gray-400">
            Рекомендуемые навыки
          </p>

          <div className="flex flex-wrap gap-1.5">
            {technologies.slice(0, 5).map((technology) => {
              const isSelected = selectedTechnologies.includes(technology);
              const isLimitReached = selectedTechnologies.length >= 10;

              return (
                <button
                  key={technology}
                  type="button"
                  disabled={!isSelected && isLimitReached}
                  aria-pressed={isSelected}
                  onClick={() => toggleTechnology(technology)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isSelected
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {technology}
                  {isSelected ? <X size={11} /> : <Plus size={11} />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Социальные сети */}
      <section className="px-4 py-5 sm:px-6">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />

          <Link2 size={13} className="shrink-0 text-indigo-500" />

          <h2 className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Ссылки на соцсети
          </h2>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {socialFields.map(({ key, label, icon, placeholder }) => (
            <div key={key} className="relative min-w-0">
              {icon && <Image width={20} height={20} src={icon} alt={label} className="absolute left-2 top-1/2 -translate-y-1/2" />}

              <label htmlFor={`social-${key}`} className="sr-only">
                {label}
              </label>

              <Input
                id={`social-${key}`}
                value={fields[key]}
                onChange={(event) => updateField(key, event.target.value)}
                placeholder={placeholder}
                className={"h-9 border-gray-200 text-xs shadow-none placeholder:text-gray-400 focus-visible:ring-indigo-400" + (icon ? " pl-10" : "")}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}