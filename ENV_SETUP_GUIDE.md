# 🔧 Настройка переменных окружения для P.I.D.R.

## Проблема
Ваше приложение возвращает 500 ошибки, потому что не настроены переменные окружения. В данный момент используется MockSupabaseClient.

## Решение

### 1. Создайте файл `.env.local` в корне проекта

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# JWT Secret for authentication (сгенерируйте длинный случайный ключ)
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-here-at-least-32-characters

# Telegram Bot Configuration
BOT_TOKEN=your-telegram-bot-token-from-botfather

# OAuth Configuration (опционально)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_VK_CLIENT_ID=your-vk-client-id

# Redis/Upstash Configuration for rate limiting (опционально)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

### 2. Настройка Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL и anon key из Settings > API
4. Выполните SQL схему из `src/lib/database/schema.sql`

### 3. Настройка Telegram Bot

1. Найдите @BotFather в Telegram
2. Создайте нового бота командой `/newbot`
3. Скопируйте токен бота

### 4. Генерация JWT Secret

```bash
# В терминале выполните:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Перезапуск сервера

После создания `.env.local`:

```bash
npm run dev
```

## Проверка

1. Откройте `/auth/register` - должна работать форма регистрации
2. Попробуйте зарегистрировать пользователя
3. Проверьте, что нет 500 ошибок в консоли

## Дополнительно

- Файл `.env.local` автоматически игнорируется Git
- Для production используйте переменные окружения на хостинге (Vercel, Railway и т.д.)
- Убедитесь, что JWT_SECRET достаточно длинный и случайный

## Статус исправлений

✅ **Исправлено**: React ошибка #130 - обновлены все Chakra UI компоненты на v3 API
✅ **Исправлено**: Импорты и использование Chakra UI компонентов
🔧 **Требует настройки**: Переменные окружения для работы с базой данных
