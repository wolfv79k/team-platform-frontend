"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  Settings,
  Briefcase,
  Search,
  Bell,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";

export default function SidebarRight() {
  const { username } = useParams<{ username: string }>();

  const navigation = [
    {
      name: username || "Username",
      href: "#",
      icon: User,
    },
    {
      name: "Настройки",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Опыт работы",
      href: "/experience",
      icon: Briefcase,
    },
  ];

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-80 shrink-0 flex-col border-l border-gray-200 bg-white px-3 py-3">
      {/* Поиск и профиль */}
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

        <Image src='/Avatar.jpg' alt='Avatar' width={32} height={32} className='rounded-full' />
      </div>

      {/* Навигация */}
      <nav className="flex flex-col gap-2">
        {navigation.map(({ name, href, icon: Icon }, index) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${index === 0
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            <Icon size={20} strokeWidth={2} />
            <span className="truncate">{name}</span>
          </Link>
        ))}
      </nav>

      {/* Автозаполнение профиля */}
      <section className="mt-4 rounded-xl border border-gray-200 p-2.5">
        <div className="mb-3 flex items-center gap-1.5">
          <Image
            src="/HeadHanter.png"
            alt="HH.ru"
            width={18}
            height={18}
            className="shrink-0"
          />

          <h3 className="text-sm font-regular leading-tight text-gray-900">
            Заполни профиль с помощью HH.ru
          </h3>
        </div>

        <label
          htmlFor="hh-profile"
          className="mb-1.5 block text-xs text-gray-500"
        >
          Ссылка на профиль HH.ru
        </label>

        <Input
          id="hh-profile"
          type="url"
          placeholder=""
          className="h-6 border-gray-200 text-xs shadow-none"
        />

        <p className="mt-1.5 text-xs text-gray-500">
          Введите ссылку на свой профиль
        </p>

        <Button
          type="button"
          size="default"
          className="mt-2 h-6 rounded-md py-4 bg-indigo-500 px-5 hover:bg-indigo-600"
        >
          Автозаполнение
        </Button>
      </section>
    </aside>
  );
}