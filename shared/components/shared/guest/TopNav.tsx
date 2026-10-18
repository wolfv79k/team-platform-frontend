'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Container } from '../Container'
import { Button } from '../../ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '../../ui/sheet'

interface Props {
  className?: string
}

const navigation = [
  { name: 'Главная', href: '/' },
  { name: 'Проекты', href: '/projects' },
  { name: 'Команды', href: '/teams' },
  { name: 'Сообщества', href: '/communities' },
  { name: 'События', href: '/events' },
]

function TopNav({ className }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <header className={className}>
      <Container className="flex items-center justify-between rounded-b-2xl bg-background px-6 py-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={
              <button
                type="button"
                className="text-xl font-bold lg:hidden"
              >
                Название проекта
              </button>
              }
            />
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <nav className="mt-16">
                <ul className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-r-lg px-4 py-3 mr-4 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="hidden lg:block">
            <h1 className="text-xl font-bold">
              Название проекта
            </h1>
          </Link>
        </div>

        <nav className="hidden lg:block">
          <ul className="flex gap-6 text-muted-foreground [&_a:hover]:text-primary">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 gap-2 sm:gap-3">
          <Link href="/login">
            <Button
              variant="outline"
              className="px-3 py-4 font-semibold sm:px-5"
            >
              Войти
            </Button>
          </Link>

          <Link href="/register">
            <Button
              variant="default"
              className="px-3 py-4 font-semibold sm:px-5"
            >
              <span className="sm:hidden">Регистрация</span>
              <span className="hidden sm:inline">
                Создать профиль
              </span>
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  )
}

export default TopNav
