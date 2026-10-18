
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Rocket,
  Users,
  Megaphone,
  Square,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Проекты",
    href: "/projects",
    icon: LayoutDashboard,
  },
  {
    name: "Команды",
    href: "/teams",
    icon: Rocket,
  },
  {
    name: "Сообщества",
    href: "/communities",
    icon: Users,
  },
  {
    name: "События",
    href: "/events",
    icon: Megaphone,
  },
];

export default function SidebarRoot() {
  const pathname = usePathname();

  return (
    <>
      {/* Десктопный сайдбар */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white px-5 py-6 lg:flex">
        <Link
          href="/projects"
          className="mb-8 flex items-center gap-2.5 px-1"
        >
          <Square
            size={26}
            strokeWidth={3}
            className="fill-indigo-500 text-indigo-500"
          />

          <span className="text-lg font-bold text-gray-900">
            Название
          </span>
        </Link>

        <nav className="flex flex-col gap-2">
          {navigation.map(({ name, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Нижняя навигация для планшетов и телефонов */}
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {navigation.map(({ name, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 py-2.5 text-center transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon size={23} strokeWidth={1.8} />

              <span className="text-[11px] leading-tight">
                {name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
