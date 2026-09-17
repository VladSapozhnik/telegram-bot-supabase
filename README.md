# Telegram Currency Bot on Supabase Edge Functions

Telegram-бот на базе Supabase Edge Functions (Deno / TypeScript) со строгой **чистой архитектурой** (Clean Architecture: Domain, Ports, Adapters, Use Cases).

## Функционал
1. **Поиск кода валюты**: находит в тексте сообщения трёхбуквенный код валюты (например: `EUR`, `GBP`, `JPY`, `CNY` и т.д.) через API Frankfurter (`https://api.frankfurter.dev/v1/latest`).
2. **Ответ с курсом к USD**: возвращает курс валюты относительно USD (и обратный курс).
3. **Хранение данных**:
   - Таблица `clients`: уникальные пользователи Telegram, сохраняется `last_activity_at` (когда последнее сообщение отправил клиент или бот).
   - Таблица `messages`: история каждого входящего и исходящего сообщения (`sender`: `'client'` | `'bot'`).
4. **2 дополнительные Edge-функции**:
   - `get-clients`: возвращает всех клиентов, отсортированных от самых недавних (`last_activity_at DESC`).
   - `get-messages`: возвращает все сообщения, отсортированные от самых новых (`created_at DESC`).

---

## Структура чистой архитектуры

```
supabase/
├── migrations/
│   └── 20260909135820_create_users.sql           # SQL-миграция таблиц clients и messages
└── functions/
    ├── _shared/
    │   ├── domain/                               # 1. Слой сущностей (Domain Entities)
    │   │   └── entities.ts                       # TelegramUpdate, ClientEntity, MessageEntity
    │   ├── ports/                                # 2. Слой портов (Интерфейсы)
    │   │   └── index.ts                          # IExchangeRateProvider, IBotDatabaseRepository, ITelegramSender
    │   ├── usecases/                             # 3. Слой сценариев использования (Use Cases)
    │   │   ├── GetCurrencyRateUseCase.ts         # Поиск валюты в тексте и расчёт курса к USD
    │   │   ├── HandleTelegramMessageUseCase.ts   # Обработка сообщения, запись в БД и ответ клиенту
    │   │   ├── GetClientsRecentFirstUseCase.ts   # Получение клиентов, отсортированных по последней активности
    │   │   ├── GetMessagesRecentFirstUseCase.ts  # Получение сообщений, отсортированных от новых к старым
    │   │   └── index.ts
    │   ├── adapters/                             # 4. Слой адаптеров (Инфраструктура / внешние API)
    │   │   ├── frankfurterAdapter.ts             # Реализация IExchangeRateProvider к api.frankfurter.dev
    │   │   ├── telegramAdapter.ts                # Реализация ITelegramSender к Telegram Bot API
    │   │   ├── supabaseRepository.ts             # Реализация IBotDatabaseRepository к базе Supabase
    │   │   └── index.ts
    │   └── factory.ts                            # DI-контейнер для внедрения зависимостей
    ├── telegram-bot/                             # Контроллер: Edge-функция Webhook бота
    │   ├── index.ts                              # Вызывает HandleTelegramMessageUseCase
    │   └── deno.json
    ├── get-clients/                              # Контроллер: Edge-функция клиентов
    │   ├── index.ts                              # Вызывает GetClientsRecentFirstUseCase
    │   └── deno.json
    └── get-messages/                             # Контроллер: Edge-функция сообщений
        ├── index.ts                              # Вызывает GetMessagesRecentFirstUseCase
        └── deno.json
```

---

## Запуск и настройка

### 1. Применение миграций БД
Выполните миграцию локально или в облаке Supabase:
```bash
supabase db reset
# или
supabase db push
```

### 2. Переменные окружения
Добавьте токен бота в `.env`:
```bash
TELEGRAM_BOT_TOKEN="ваш_токен_бота_от_BotFather"
```

### 3. Локальный запуск функций
```bash
supabase functions serve --no-verify-jwt --env-file .env
```

### 4. Установка Webhook для Telegram
```bash
curl -F "url=https://<ВАШ_ПРОЕКТ>.supabase.co/functions/v1/telegram-bot" https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook
```

---

## Проверка эндпоинтов

1. **Список клиентов (от самых недавних):**
   ```http
   GET /functions/v1/get-clients
   ```
2. **Список сообщений (от самых новых):**
   ```http
   GET /functions/v1/get-messages
   ```
