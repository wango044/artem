# Artem Lustov Landing + Telegram Bot

Лендинг барбера Артёма Лустова и Telegram-бот-консьерж для портфолио, подбора образа и заявок.

## Запуск сайта

```bash
pnpm install
pnpm dev --host 0.0.0.0 --port 5175
```

## Telegram-бот на Vercel

Бот работает через Telegram webhook и Vercel Function `api/bot.js`.

В Vercel Project Settings -> Environment Variables добавьте:

- `BOT_TOKEN` - токен Telegram-бота.
- `BOT_USERNAME` - `barber_concierge_bot`.
- `SITE_URL` - публичный URL сайта, например `https://your-project.vercel.app`.
- `WEBHOOK_URL` - `https://your-project.vercel.app/api/bot`.
- `WEBHOOK_SECRET` - случайная строка из букв, цифр, `_` и `-`.
- `ADMIN_CHAT_ID` - опционально, чтобы заявки уходили мастеру напрямую.
- `DIRECT_TELEGRAM_URL` - ссылка на личный Telegram мастера.
- `VITE_TELEGRAM_BOT_USERNAME` - `barber_concierge_bot`.

После деплоя установите webhook:

```bash
pnpm bot:set-webhook
```

Для локальной проверки можно скопировать `.env.example` в `.env`, добавить значения и запустить:

```bash
pnpm bot:dry-run
pnpm bot
```

Команда `pnpm bot` запускает polling только локально. На Vercel используется webhook.

Чтобы узнать свой `ADMIN_CHAT_ID`, отправьте боту команду `/id`.

## Что умеет бот

- Показывает портфолио по категориям.
- Отправляет фото и видео из тех же ассетов, что использует сайт.
- Проводит короткий подбор стрижки.
- Собирает заявку одним ответом на Force Reply: услуга, имя, время, контакт, комментарий или фото-референс.
- При наличии `ADMIN_CHAT_ID` пересылает заявку мастеру.

## Deep links с сайта

Сайт ведёт в сценарии бота:

- `booking_site_hero` - запись из hero.
- `portfolio_site` - портфолио в Telegram.
- `style_quiz_site` - подбор стрижки.
