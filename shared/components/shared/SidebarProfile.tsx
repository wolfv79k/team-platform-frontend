
"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import {
  User,
  Settings,
  Briefcase,
  Search,
  Bell,
  X,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useProfileSidebarStore } from "@/shared/store/profile-sidebar.store";

export default function SidebarProfile() {
  const { username } = useParams<{ username: string }>();
  const pathname = usePathname();

  const isOpen = useProfileSidebarStore((state) => state.isOpen);
  const setIsOpen = useProfileSidebarStore(
    (state) => state.setIsOpen
  );

  const navigation = [
    {
      name: username || "Username",
      href: pathname || "#",
      icon: User,
    },
    {
      name: "Настройки",
      href: "user/settings/profile-edit",
      icon: Settings,
    },
    {
      name: "Опыт работы",
      href: "user/setting/experience",
      icon: Briefcase,
    },
  ];

  return (
    <>
      {/* Затемнение — только на планшетах и телефонах */}
      <button
        type="button"
        aria-label="Закрыть меню"
        tabIndex={isOpen ? 0 : -1}
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Мобильная панель слева */}
      <aside
        id="profile-sidebar"
        aria-label="Меню профиля"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-80 max-w-[85vw] flex-col border-r border-gray-200 bg-white px-3 py-3 shadow-xl transition-transform duration-300 ease-in-out motion-reduce:transition-none lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Закрыть меню профиля"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          {navigation.map(({ name, href, icon: Icon }, index) => {
            const isActive =
              index === 0 ||
              pathname === href ||
              pathname.startsWith(`${href}/`);

            return (
              <Link
                key={name}
                href={href}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="truncate">{name}</span>
              </Link>
            );
          })}
        </nav>

        {/* HH.ru без поиска, аватара и уведомлений */}
        <section className="mt-4 rounded-xl border border-gray-200 p-2.5">
          <div className="mb-3 flex items-center gap-1.5">
            <Image
              src="/HeadHanter.png"
              alt="HH.ru"
              width={18}
              height={18}
              className="shrink-0"
            />

            <h3 className="text-sm font-normal leading-tight text-gray-900">
              Заполни профиль с помощью HH.ru
            </h3>
          </div>

          <label
            htmlFor="hh-profile-mobile"
            className="mb-1.5 block text-xs text-gray-500"
          >
            Ссылка на профиль HH.ru
          </label>

          <Input
            id="hh-profile-mobile"
            type="url"
            placeholder="https://hh.ru/..."
            tabIndex={isOpen ? 0 : -1}
            className="h-8 border-gray-200 text-xs shadow-none"
          />

          <p className="mt-1.5 text-xs text-gray-500">
            Введите ссылку на свой профиль
          </p>

          <Button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            className="mt-2 h-8 rounded-md bg-indigo-500 px-4 hover:bg-indigo-600"
          >
            Автозаполнение
          </Button>
        </section>
      </aside>

      {/* Десктопная панель справа — исходный вариант */}
      <aside className="sticky top-0 z-40 hidden h-screen w-80 shrink-0 flex-col border-l border-gray-200 bg-white px-3 py-3 lg:flex">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <Input
              placeholder="Поиск"
              className="h-9 border-gray-200 bg-gray-50 pl-8 text-sm shadow-none"
            />
          </div>

          <button
            type="button"
            aria-label="Уведомления"
            className="shrink-0 text-gray-500 transition-colors hover:text-indigo-600"
          >
            <Bell size={20} />
          </button>

          <Image
            src="/Avatar.jpg"
            alt="Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>

        <nav className="flex flex-col gap-2">
          {navigation.map(({ name, href, icon: Icon }, index) => (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="truncate">{name}</span>
            </Link>
          ))}
        </nav>

        <section className="mt-4 rounded-xl border border-gray-200 p-2.5">
          <div className="mb-3 flex items-center gap-1.5">
            <Image
              src="/HeadHanter.png"
              alt="HH.ru"
              width={18}
              height={18}
              className="shrink-0"
            />

            <h3 className="text-sm font-normal leading-tight text-gray-900">
              Заполни профиль с помощью HH.ru
            </h3>
          </div>

          <label
            htmlFor="hh-profile-desktop"
            className="mb-1.5 block text-xs text-gray-500"
          >
            Ссылка на профиль HH.ru
          </label>

          <Input
            id="hh-profile-desktop"
            type="url"
            placeholder=""
            className="h-6 border-gray-200 text-xs shadow-none"
          />

          <p className="mt-1.5 text-xs text-gray-500">
            Введите ссылку на свой профиль
          </p>

          <Button
            type="button"
            className="mt-2 h-6 rounded-md bg-indigo-500 px-5 py-4 hover:bg-indigo-600"
          >
            Автозаполнение
          </Button>
        </section>
      </aside>
    </>
  );
}
