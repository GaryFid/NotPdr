# 🎮 P.I.D.R. - Мультиплеер Карточная Игра

**P.I.D.R.** - это инновационная карточная игра для Telegram WebApp с поддержкой мультиплеера до 9 игроков!

## 🚀 Быстрый старт

### Локальная разработка:

1. **Установка зависимостей:**
```bash
npm install
```

2. **Запуск backend сервера:**
```bash
cd server
npm install
npm run dev
```

3. **Запуск frontend:**
```bash
npm run dev
```

4. **Откройте [http://localhost:3000](http://localhost:3000) в браузере**

### Продакшен деплой:

📋 **Полная инструкция:** [DEPLOYMENT.md](./DEPLOYMENT.md)

**Быстрый деплой:**
```bash
# 1. Деплой backend на Railway
cd server
railway up

# 2. Обновите переменные в Vercel
# NEXT_PUBLIC_WS_URL=wss://your-railway-url.railway.app
# NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app

# 3. Деплой frontend на Vercel
vercel --prod
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment
Create a `.env.local` file with the following variables:

```
# Required
JWT_SECRET=change_me_to_a_strong_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Telegram bot
BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=your_bot_username

# Optional
APP_URL=https://your-app-url
BASE_URL=https://your-base-url
SESSION_SECRET=another_strong_secret
```

- JWT/SESSION secrets must be strong and rotated.
- Telegram WebApp auth requires valid `initData` verification; ensure `BOT_TOKEN` is set.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
