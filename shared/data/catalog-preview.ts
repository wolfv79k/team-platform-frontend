// Reference content for the catalog previews.
export const catalogPreview = {
  "projects": [
    {
      "id": 1,
      "name": "Campus Guide",
      "slogan": "Университет, в котором легко освоиться.",
      "description": "Навигатор для студентов: корпуса, полезные места и события кампуса. Собираем первую версию и ищем людей, которым интересны городские сервисы.",
      "status": "Набор в команду",
      "skills": [
        "ReactJS",
        "TypeScript",
        "Figma"
      ],
      "role": "Frontend-разработчик",
      "need": "Backend-разработчик",
      "contribution": "Спроектировал интерфейс карты, собрал компоненты и настроил адаптивную вёрстку.",
      "cover": "campus"
    },
    {
      "id": 2,
      "name": "Тихая полка",
      "slogan": "Книги находят новых читателей.",
      "description": "Небольшой сервис обмена книгами внутри университетского кампуса.",
      "status": "В работе",
      "skills": [
        "Next.js",
        "PostgreSQL"
      ],
      "role": "Frontend-разработчик",
      "contribution": "Собрал каталог книг и карточку объявления.",
      "cover": "books"
    }
  ],
  "samplePeople": {
    "2": {
      "id": 2,
      "name": "Варвара Зорина",
      "username": "varvara_z",
      "bio": "Проектирую понятные интерфейсы. Люблю разбирать сложные сценарии и собирать из них простые продукты.",
      "city": "Казань",
      "skills": [
        "Figma",
        "TypeScript"
      ],
      "joined": "21.10.2026"
    },
    "3": {
      "id": 3,
      "name": "Лев Соколов",
      "username": "lev_s",
      "bio": "Пишу серверную часть на Node.js. Работаю над учебными проектами и участвую в хакатонах.",
      "city": "Москва",
      "skills": [
        "Node.js",
        "PostgreSQL"
      ],
      "initials": "ЛС",
      "joined": "23.10.2026"
    },
    "4": {
      "id": 4,
      "name": "Никита Власов",
      "username": "nikita_v",
      "bio": "Разработчик. Собираю команду для городских хакатонов.",
      "city": "Санкт-Петербург",
      "skills": [
        "ReactJS",
        "Node.js"
      ],
      "initials": "НВ",
      "joined": "29.10.2026"
    }
  },
  "portfolioWorks": [
    {
      "id": 101,
      "ownerId": 1,
      "name": "Лист",
      "slogan": "Список чтения без лишнего.",
      "description": "Личный учебный проект: сохранять книги, отмечать прочитанное и быстро находить следующую. Собрал интерфейс на React, добавил поиск и сохранение списка в браузере.",
      "role": "Дизайн и разработка",
      "skills": [
        "ReactJS",
        "TypeScript"
      ],
      "url": "",
      "cover": "books"
    },
    {
      "id": 102,
      "ownerId": 1,
      "name": "Маршрут",
      "slogan": "Прогулки, которые хочется повторить.",
      "description": "Концепт небольшого путеводителя. Продумал каталог прогулок, подробную карточку маршрута и адаптивную версию.",
      "role": "Frontend-разработка",
      "skills": [
        "Next.js",
        "Figma"
      ],
      "url": "",
      "cover": "campus"
    },
    {
      "id": 103,
      "ownerId": 2,
      "name": "Тихое утро",
      "slogan": "Интерфейс для небольшого книжного клуба.",
      "description": "Исследование и дизайн сервиса для совместного чтения. Собрала сценарии выбора книги, расписание встреч и библиотеку компонентов.",
      "role": "Исследование и UX/UI",
      "skills": [
        "Figma"
      ],
      "url": "",
      "cover": "books"
    },
    {
      "id": 104,
      "ownerId": 2,
      "name": "Атлас кампуса",
      "slogan": "Университетская карта в кармане.",
      "description": "Мобильный интерфейс для навигации по кампусу. Проверила маршруты со студентами и спроектировала доступную навигацию.",
      "role": "UX/UI-дизайн",
      "skills": [
        "Figma"
      ],
      "url": "",
      "cover": "campus"
    }
  ],
  "teams": [
    {
      "id": 1,
      "name": "Смена",
      "description": "Делаем полезные сервисы для студенческой жизни. Собираемся на хакатоны и доводим идеи до работающих прототипов.",
      "captainId": 1,
      "members": [
        1,
        2,
        3
      ],
      "skills": [
        "ReactJS",
        "Figma",
        "Node.js"
      ],
      "levels": {
        "ReactJS": "Средний",
        "Figma": "Продвинутый",
        "Node.js": "Средний"
      },
      "contributions": {
        "1": "Собираю интерфейс и помогаю соединить дизайн с серверной частью.",
        "2": "Проектирую пользовательские сценарии и компоненты."
      },
      "eventIds": [
        2
      ]
    },
    {
      "id": 2,
      "name": "Вектор",
      "description": "Создаём сервисы для города. Ищем людей, которым интересно работать с картами, открытыми данными и понятными интерфейсами.",
      "captainId": 4,
      "members": [
        4,
        3
      ],
      "skills": [
        "TypeScript",
        "Node.js",
        "PostgreSQL"
      ],
      "levels": {
        "TypeScript": "Средний",
        "Node.js": "Средний",
        "PostgreSQL": "Начальный"
      },
      "contributions": {
        "3": "Готовлю структуру данных и API."
      },
      "eventIds": [
        1
      ]
    },
    {
      "id": 3,
      "name": "Точка сборки",
      "description": "Небольшая команда для экспериментов с веб-продуктами. Проверяем идеи на практике и учимся друг у друга.",
      "captainId": 2,
      "members": [
        2,
        4
      ],
      "skills": [
        "Figma",
        "ReactJS"
      ],
      "levels": {
        "Figma": "Продвинутый",
        "ReactJS": "Средний"
      },
      "contributions": {},
      "eventIds": []
    }
  ],
  "teamApplications": [
    {
      "id": 501,
      "userId": 4,
      "teamId": 1,
      "type": "REQUEST",
      "status": "PENDING",
      "message": "Хочу помочь с интерфейсом и интеграцией карты. Есть опыт на TypeScript, готов подключиться к ближайшему хакатону."
    },
    {
      "id": 502,
      "userId": 1,
      "teamId": 3,
      "type": "INVITATION",
      "status": "PENDING",
      "message": "Даниил, понравился твой проект «Маршрут». Приглашаю к нам, хотим вместе сделать небольшой сервис для кампуса."
    }
  ],
  "communities": [
    {
      "id": 1,
      "name": "Фронтенд-практика",
      "description": "Разбираем интерфейсы, делимся находками в React и обсуждаем то, что получилось на практике.",
      "creatorId": 2,
      "members": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "id": 2,
      "name": "Дизайн в деталях",
      "description": "Показываем свои работы, обсуждаем решения и даём обратную связь по пользовательским сценариям.",
      "creatorId": 2,
      "members": [
        2,
        4
      ]
    },
    {
      "id": 3,
      "name": "Хакатонная среда",
      "description": "Знакомимся перед хакатонами, делимся опытом участия и рассказываем о результатах команд.",
      "creatorId": 1,
      "members": [
        1,
        3,
        4
      ]
    }
  ],
  "posts": [
    {
      "id": 201,
      "communityId": 1,
      "authorId": 2,
      "title": "Как вы проверяете формы перед релизом?",
      "text": "Собираю короткий список для проверки форм. Пока в нём: клавиатура, длинные значения, ошибки сервера и сохранение введённых данных.\n\nКакие сценарии чаще всего забывают в ваших проектах?",
      "created": "Сегодня, 10:30"
    },
    {
      "id": 202,
      "communityId": 1,
      "authorId": 3,
      "title": "Первый опыт с PostgreSQL",
      "text": "Перенёс небольшой проект с локального хранения на базу данных. Самым полезным оказалось сначала нарисовать связи, а уже потом писать запросы. Поделюсь схемой на ближайшем разборе.",
      "created": "Вчера, 18:12"
    },
    {
      "id": 203,
      "communityId": 2,
      "authorId": 2,
      "title": "Один экран, два сценария",
      "text": "Профиль владельца и профиль посетителя решают разные задачи. Показываю, какие действия убрала из публичного просмотра и почему.",
      "created": "Вчера, 12:40"
    },
    {
      "id": 204,
      "communityId": 3,
      "authorId": 1,
      "title": "Что взять на первый хакатон",
      "text": "Рабочую среду лучше подготовить заранее. Проверьте доступы команды, договоритесь о ролях и оставьте время на демонстрацию.",
      "created": "7 ноября, 16:20"
    }
  ],
  "comments": [
    {
      "id": 301,
      "postId": 201,
      "authorId": 1,
      "text": "Ещё проверяю повторное нажатие на отправку и возврат назад. Важно не потерять заполненную форму."
    }
  ],
  "events": [
    {
      "id": 1,
      "name": "Город для людей",
      "description": "Два дня, чтобы собрать прототип полезного городского сервиса. Команды работают с задачами навигации, доступности и городской среды.",
      "startDate": "2026-11-20T10:00:00+03:00",
      "endDate": "2026-11-22T18:00:00+03:00",
      "location": "Москва",
      "organizerUrl": "https://example.com/city-hackathon"
    },
    {
      "id": 2,
      "name": "Открытый кампус",
      "description": "Хакатон о студенческой жизни. Команды создали решения для навигации, общения и обмена полезными вещами в университете.",
      "startDate": "2026-10-23T10:00:00+03:00",
      "endDate": "2026-10-25T18:00:00+03:00",
      "location": "Казань",
      "organizerUrl": "https://example.com/campus-hackathon"
    },
    {
      "id": 3,
      "name": "Полезный код",
      "description": "Онлайн-хакатон для разработчиков и дизайнеров. Найдите повседневную задачу и превратите её в понятный работающий продукт.",
      "startDate": "2026-12-04T10:00:00+03:00",
      "endDate": "2026-12-06T18:00:00+03:00",
      "location": "Онлайн",
      "organizerUrl": "https://example.com/code-hackathon"
    }
  ],
  "ideas": [
    {
      "id": 401,
      "authorId": 2,
      "projectId": null,
      "createdAt": "2026-11-10T09:00:00+03:00",
      "name": "Поиск свободных аудиторий",
      "description": "Студентам негде собраться для работы в группе. Хочу сделать страницу, которая по расписанию показывает свободные аудитории на ближайшие два часа. Начать можно с одного корпуса и открытого расписания."
    },
    {
      "id": 402,
      "authorId": 1,
      "projectId": null,
      "createdAt": "2026-11-08T12:00:00+03:00",
      "name": "Обмен техникой в кампусе",
      "description": "Часто зарядка или переходник нужны всего на одну пару. Предлагаю каталог вещей, которые можно одолжить у студентов из своего корпуса. В первой версии достаточно объявления и времени возврата."
    },
    {
      "id": 403,
      "authorId": 1,
      "projectId": 1,
      "createdAt": "2026-10-29T10:00:00+03:00",
      "name": "Карта кампуса для первокурсников",
      "description": "Собрать на одной карте учебные корпуса, столовые и тихие места для работы. Начать со схемы входов и маршрутов между корпусами, чтобы новому студенту было проще ориентироваться."
    }
  ],
  "photos": {
    "home": {
      "src": "assets/photos/working-table.webp",
      "width": 1440,
      "height": 575,
      "alt": "Люди работают за ноутбуками за общим столом"
    },
    "campus": {
      "src": "assets/photos/campus-courtyard.webp",
      "width": 1120,
      "height": 530,
      "alt": "Кирпичные корпуса университетского кампуса"
    },
    "library": {
      "src": "assets/photos/library-shelves.webp",
      "width": 1120,
      "height": 530,
      "alt": "Книги на библиотечной полке"
    },
    "reading": {
      "src": "assets/photos/reading-shelf.webp",
      "width": 960,
      "height": 480,
      "alt": "Стопка книг рядом с растением"
    },
    "map": {
      "src": "assets/photos/paper-map.webp",
      "width": 960,
      "height": 480,
      "alt": "Бумажная карта в руке"
    },
    "classroom": {
      "src": "assets/photos/lecture-hall.webp",
      "width": 1120,
      "height": 530,
      "alt": "Ряды парт в пустой аудитории"
    },
    "laptops": {
      "src": "assets/photos/laptops.webp",
      "width": 1120,
      "height": 530,
      "alt": "Участники хакатона работают за ноутбуками"
    },
    "street": {
      "src": "assets/photos/crosswalk.webp",
      "width": 1120,
      "height": 530,
      "alt": "Люди на городском пешеходном переходе"
    },
    "equipment": {
      "src": "assets/photos/equipment-exchange.webp",
      "width": 960,
      "height": 640,
      "alt": "Зарядка, кабели и переходники на столе"
    },
    "teamSmena": {
      "src": "assets/photos/team-smena.webp",
      "width": 960,
      "height": 640,
      "alt": "Участники рабочей встречи обсуждают карту за столом"
    },
    "design": {
      "src": "assets/photos/design-discussion.webp",
      "width": 960,
      "height": 640,
      "alt": "Распечатки макетов и чертёжные инструменты на столе"
    },
    "frontend": {
      "src": "assets/photos/frontend-practice.webp",
      "width": 960,
      "height": 640,
      "alt": "Ноутбук с редактором кода и блокнот с эскизом"
    },
    "vector": {
      "src": "assets/photos/team-vector.webp",
      "width": 960,
      "height": 640,
      "alt": "Бумажная карта города на рабочем столе"
    },
    "prototype": {
      "src": "assets/photos/team-prototype.webp",
      "width": 960,
      "height": 640,
      "alt": "Бумажные эскизы мобильного интерфейса рядом с ноутбуком"
    }
  },
  "demoProjectPhotos": {
    "1": {
      "src": "assets/photos/campus-courtyard.webp",
      "width": 1120,
      "height": 530,
      "alt": "Кирпичные корпуса университетского кампуса"
    },
    "2": {
      "src": "assets/photos/library-shelves.webp",
      "width": 1120,
      "height": 530,
      "alt": "Книги на библиотечной полке"
    }
  },
  "demoTeamPhotos": {
    "1": {
      "src": "assets/photos/team-smena.webp",
      "width": 960,
      "height": 640,
      "alt": "Участники рабочей встречи обсуждают карту за столом"
    },
    "2": {
      "src": "assets/photos/team-vector.webp",
      "width": 960,
      "height": 640,
      "alt": "Бумажная карта города на рабочем столе"
    },
    "3": {
      "src": "assets/photos/team-prototype.webp",
      "width": 960,
      "height": 640,
      "alt": "Бумажные эскизы мобильного интерфейса рядом с ноутбуком"
    }
  },
  "demoCommunityPhotos": {
    "1": {
      "src": "assets/photos/frontend-practice.webp",
      "width": 960,
      "height": 640,
      "alt": "Ноутбук с редактором кода и блокнот с эскизом"
    },
    "2": {
      "src": "assets/photos/design-discussion.webp",
      "width": 960,
      "height": 640,
      "alt": "Распечатки макетов и чертёжные инструменты на столе"
    },
    "3": {
      "src": "assets/photos/working-table.webp",
      "width": 1440,
      "height": 575,
      "alt": "Люди работают за ноутбуками за общим столом"
    }
  },
  "demoEventPhotos": {
    "1": {
      "src": "assets/photos/crosswalk.webp",
      "width": 1120,
      "height": 530,
      "alt": "Люди на городском пешеходном переходе"
    },
    "2": {
      "src": "assets/photos/lecture-hall.webp",
      "width": 1120,
      "height": 530,
      "alt": "Ряды парт в пустой аудитории"
    },
    "3": {
      "src": "assets/photos/laptops.webp",
      "width": 1120,
      "height": 530,
      "alt": "Участники хакатона работают за ноутбуками"
    }
  },
  "demoIdeaPhotos": {
    "401": {
      "src": "assets/photos/lecture-hall.webp",
      "width": 1120,
      "height": 530,
      "alt": "Ряды парт в пустой аудитории"
    },
    "402": {
      "src": "assets/photos/equipment-exchange.webp",
      "width": 960,
      "height": 640,
      "alt": "Зарядка, кабели и переходники на столе"
    },
    "403": {
      "src": "assets/photos/paper-map.webp",
      "width": 960,
      "height": 480,
      "alt": "Бумажная карта в руке"
    }
  },
  "demoWorkPhotos": {
    "101": {
      "src": "assets/photos/reading-shelf.webp",
      "width": 960,
      "height": 480,
      "alt": "Стопка книг рядом с растением"
    },
    "102": {
      "src": "assets/photos/paper-map.webp",
      "width": 960,
      "height": 480,
      "alt": "Бумажная карта в руке"
    },
    "103": {
      "src": "assets/photos/library-shelves.webp",
      "width": 1120,
      "height": 530,
      "alt": "Книги на библиотечной полке"
    },
    "104": {
      "src": "assets/photos/lecture-hall.webp",
      "width": 1120,
      "height": 530,
      "alt": "Ряды парт в пустой аудитории"
    }
  }
}
