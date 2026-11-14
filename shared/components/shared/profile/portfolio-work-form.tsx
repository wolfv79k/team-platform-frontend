"use client"

import "@/app/styles/forms.css"

import Link from "next/link"
import { useState } from "react"

export default function PortfolioWorkForm() {
  const [showNotice, setShowNotice] = useState(false)
  return (
    <form
      className="edit-form"
      onSubmit={(event) => {
        event.preventDefault()
        setShowNotice(true)
      }}
    >
      <section className="form-section">
        <div className="form-intro">
          <h1>Новая работа в портфолио</h1>
          <p>Покажи, что ты создал и какую задачу решил. Работа появится в твоём портфолио.</p>
        </div>
        <div className="field">
          <label htmlFor="work-name">Название работы *</label>
          <input id="work-name" required maxLength={100} placeholder="Название личного проекта" />
        </div>
        <div className="field">
          <label htmlFor="work-slogan">Короткое описание</label>
          <input id="work-slogan" placeholder="Что это и для кого" />
        </div>
        <div className="field">
          <label htmlFor="work-role">Что ты сделал</label>
          <input id="work-role" placeholder="Например, дизайн и разработка" />
        </div>
        <div className="field">
          <label htmlFor="work-description">О работе</label>
          <textarea id="work-description" rows={5} placeholder="Задача, твой подход и результат" />
        </div>
        <div className="field">
          <label htmlFor="work-url">Ссылка на работу</label>
          <input id="work-url" type="url" placeholder="https://" />
          <small>Сайт, репозиторий или опубликованный кейс.</small>
        </div>
        <div className="field">
          <label htmlFor="work-skills">Технологии</label>
          <input id="work-skills" placeholder="ReactJS, TypeScript" />
          <small>Перечисли через запятую.</small>
        </div>
      </section>
      <footer className="form-footer">
        {showNotice && <p role="status">Сохранение личных работ пока не подключено.</p>}
        <Link href="/user" className="btn secondary">
          Отмена
        </Link>
        <button type="submit" className="btn primary">
          Добавить работу
        </button>
      </footer>
    </form>
  )
}
