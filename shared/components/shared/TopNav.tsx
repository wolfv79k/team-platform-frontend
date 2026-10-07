import Link from 'next/link'
import React from 'react'
import { Container } from './Container'
import { Button } from '../ui/button'

interface Props{
  className?: string
}

function TopNav({ className }: Props) {
  return (
    <header className={className}>
      <Container className='px-6 py-5 flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-b-2xl bg-background'>
        <div>
          <Link href="/"><h1 className='font-bold text-xl'>Название проекта</h1></Link>
        </div>
        <nav>
          <ul className='flex gap-6 text-muted-foreground *:hover:text-primary'>
            <li>
              <Link href="/">Главная</Link>
            </li>
            <li>
              <Link href="/">Проекты</Link>
            </li>
            <li>
              <Link href="/">Команды</Link>
            </li>
            <li>
              <Link href="/">Сообщества</Link>
            </li>
            <li>
              <Link href="/">События</Link>
            </li>
          </ul>
        </nav>
        <div className='flex gap-3'>
          <Link href="/auth/login"><Button variant="outline" className='font-semibold py-4 px-5'>Войти</Button></Link>
          <Link href="/auth/register"><Button variant="default" className='font-semibold py-4 px-5'>Создать профиль</Button></Link>
        </div>
      </Container>
    </header>
  )
}

export default TopNav