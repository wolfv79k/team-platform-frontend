'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Box, Calendar, Pencil, Plus, Sparkles } from 'lucide-react';

function ProfileContent() {

  const { username } = useParams<{ username: string }>();

  const profileNav = [
    { key: 1, label: 'ПРОЕКТЫ' },
    { key: 2, label: 'РЕЗЮМУ' },
    { key: 3, label: 'ПОСТЫ' }
  ]

  const [activeTab, setActiveTab] = useState<number>(profileNav[0].key);

  return (
    <div>
      <header className='flex py-5 px-8 justify-between border-b border-gray-200'>
        <div className='flex items-center gap-2'>
          <Image src='/Avatar.jpg' alt='Avatar' width={28} height={28} className='rounded-full' />
          <span>{username}</span>
        </div>
        <Button
          variant="outline"
          className='rounded-2xl'
        >
          <Pencil />
          Редактирование
        </Button>
      </header>
      <section className='p-10 flex flex-col'>
        <div className='flex flex-col items-center'>
          <div className='w-25 relative'>
            <Image src='/Avatar.jpg' alt='Avatar' width={100} height={100} className='rounded-full' />
            <Button size="sm" variant="outline" className='border-gray-200 border-1 w-min p-1.5 rounded-full absolute bottom-0 right-0 z-40 bg-background'>
              <Pencil className='text-gray-500' width={12} height={12} />
            </Button>
          </div>

          <h2 className='font-semibold text-2xl mt-2.5'>{username}</h2>
          <p className='flex text-sm items-center text-ring gap-1 mt-4'>
            <Calendar className='text-gray-500' width={16} height={16} />
            Присоеденился 17.10.2026
          </p>

          <Button className="bg-primary/10 text-primary py-4 px-5 mt-4 rounded-2xl hover:bg-primary/20">
            <Sparkles />
            Добавьте свои скиллы
            <Plus />
          </Button>

          <ul className='flex gap-8 mt-8'>
            {profileNav.map((item) => (
              <li key={item.key} className={'text-sm text-gray-500 hover:text-primary cursor-pointer font-semibold'
                + (activeTab === item.key ? ' text-primary' : '')}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className='h-[1px] bg-gray-200 w-full my-8'></div>

          <div className='w-full'>
            <h3 className='font-semibold text-xl'>Покажите свои работы</h3>
            <div className='flex gap-4 mt-5'>
              <Button variant="outline" className="flex-1 py-6 text-base bg-secondary hover:bg-primary/80"><Box /> Добавить проект <Plus/></Button>
              <Button variant="outline" className="flex-1 py-6 text-base bg-secondary hover:bg-primary/80"><Image src='/GitHubVector.svg' alt='GitHub' width={16} height={16} /> GitHub <Plus/></Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfileContent