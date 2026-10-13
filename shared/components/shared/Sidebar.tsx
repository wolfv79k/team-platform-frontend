
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Rocket,
  Users,
  Megaphone,
  Square,
} from "lucide-react";

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

export default function Sidebar() {
  return (
    <aside className="fixed z-40 flex h-screen w-60 flex-col border-r border-gray-200 bg-white px-5 py-6">
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
        {navigation.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Icon size={20} strokeWidth={2} />
            <span>{name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
