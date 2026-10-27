
"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  Bell,
  Box,
  Calendar,
  Pencil,
  Plus,
  Sparkles,
} from "lucide-react";
import { useProfileSidebarStore } from "@/shared/store/profile-sidebar.store";

function ProfileContent() {
  const { username } = useParams<{ username: string }>();

  const isOpen = useProfileSidebarStore((state) => state.isOpen);
  const setIsOpen = useProfileSidebarStore(
    (state) => state.setIsOpen
  );

  const profileNav = [
    { key: 1, label: "ПРОЕКТЫ" },
    { key: 2, label: "РЕЗЮМЕ" },
    { key: 3, label: "ПОСТЫ" },
  ];

  const [activeTab, setActiveTab] = useState<number>(
    profileNav[0].key
  );

  return (
    <div>
      {/* Шапка профиля */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Открыть меню профиля"
            aria-controls="profile-sidebar"
            aria-expanded={isOpen}
            className="shrink-0 rounded-full transition-opacity hover:opacity-80"
          >
            <Image
              src="/Avatar.jpg"
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
          </button>

          <span className="hidden truncate lg:block">
            {username}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <Button
            variant="outline"
            className="rounded-2xl"
          >
            <Pencil />
            <span>
              Редактирование
            </span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            aria-label="Уведомления"
            className="shrink-0 transition-colors lg:hidden"
          >
            <Bell />
          </Button>
        </div>
      </header>

      {/* Основной контент */}
      <section className="flex flex-col p-5 sm:p-10">
        <div className="flex flex-col items-center">
          {/* Аватар и кнопка редактирования */}
          <div className="relative w-[100px]">
            <Image
              src="/Avatar.jpg"
              alt="Avatar"
              width={100}
              height={100}
              className="rounded-full"
            />

            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Изменить аватар"
              className="absolute bottom-0 right-0 z-10 w-min rounded-full border border-gray-200 bg-background p-1.5"
            >
              <Pencil
                className="text-gray-500"
                width={12}
                height={12}
              />
            </Button>
          </div>

          <h2 className="mt-2.5 text-2xl font-semibold">
            {username}
          </h2>

          <p className="mt-4 flex items-center gap-1 text-sm text-ring">
            <Calendar
              className="text-gray-500"
              width={16}
              height={16}
            />
            Присоединился 17.10.2026
          </p>

          <Button className="mt-4 rounded-2xl bg-primary/10 px-5 py-4 text-primary hover:bg-primary/20">
            <Sparkles />
            Добавьте свои скиллы
            <Plus />
          </Button>

          {/* Навигация профиля */}
          <ul className="mt-8 flex gap-5 sm:gap-8">
            {profileNav.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  aria-current={
                    activeTab === item.key ? "page" : undefined
                  }
                  className={`cursor-pointer text-sm font-semibold transition-colors ${
                    activeTab === item.key
                      ? "text-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="my-8 h-px w-full bg-gray-200" />

          {/* Контент активной вкладки */}
          <div className="w-full">
            {activeTab === 1 && (
              <>
                <h3 className="text-xl font-semibold">
                  Покажите свои работы
                </h3>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1 bg-secondary py-6 text-base hover:bg-primary/80"
                  >
                    <Box />
                    Добавить проект
                    <Plus />
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 bg-secondary py-6 text-base hover:bg-primary/80"
                  >
                    <Image
                      src="/GitHub.svg"
                      alt="GitHub"
                      width={16}
                      height={16}
                    />
                    GitHub
                    <Plus />
                  </Button>
                </div>
              </>
            )}

            {activeTab === 2 && (
              <div>
                <h3 className="text-xl font-semibold">
                  Резюме
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Здесь будет информация о твоём опыте и навыках.
                </p>
              </div>
            )}

            {activeTab === 3 && (
              <div>
                <h3 className="text-xl font-semibold">
                  Посты
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Здесь будут публикации пользователя.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProfileContent;
