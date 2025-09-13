# 🚀 ДЕПЛОЙ P.I.D.R. МУЛЬТИПЛЕЕРА

## 📋 АРХИТЕКТУРА

- **Frontend:** Vercel (Next.js + Telegram WebApp)
- **Backend:** Railway (Node.js + WebSocket + SQLite)
- **База данных:** SQLite (встроенная в Railway)

---

## 🎯 ШАГ 1: ПОДГОТОВКА BACKEND

### 1.1 Создайте аккаунт на Railway
1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Подтвердите email

### 1.2 Создайте новый проект
1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Выберите ваш репозиторий
4. Выберите папку `server`

### 1.3 Настройте переменные окружения
В Railway Dashboard → Variables добавьте:

```bash
# Основные настройки
PORT=3001
NODE_ENV=production

# CORS (замените на ваш Vercel домен)
CORS_ORIGIN=https://your-app.vercel.app,https://web.telegram.org,https://t.me

# База данных
DATABASE_URL=./pidr.db

# Игровые настройки
MAX_PLAYERS=9
MIN_PLAYERS=4
ROOM_CLEANUP_INTERVAL=300000

# Логирование
LOG_LEVEL=info
```

### 1.4 Деплой
1. Railway автоматически деплоит при push в GitHub
2. Дождитесь завершения деплоя
3. Скопируйте URL сервера (например: `https://pidr-server-production.up.railway.app`)

---

## 🎯 ШАГ 2: НАСТРОЙКА FRONTEND

### 2.1 Обновите переменные окружения Vercel
В Vercel Dashboard → Settings → Environment Variables добавьте:

```bash
# WebSocket URL (замените на ваш Railway URL)
NEXT_PUBLIC_WS_URL=wss://pidr-server-production.up.railway.app

# API URL
NEXT_PUBLIC_API_URL=https://pidr-server-production.up.railway.app
```

### 2.2 Обновите CORS в Railway
В Railway Dashboard → Variables обновите:

```bash
CORS_ORIGIN=https://your-app.vercel.app,https://web.telegram.org,https://t.me
```

### 2.3 Передеплойте Vercel
1. Сделайте push в GitHub
2. Vercel автоматически передеплоит с новыми переменными

---

## 🎯 ШАГ 3: НАСТРОЙКА TELEGRAM BOT

### 3.1 Обновите WebApp URL
В @BotFather обновите WebApp URL на ваш Vercel домен:

```
https://your-app.vercel.app
```

### 3.2 Проверьте настройки
- WebApp URL: `https://your-app.vercel.app`
- Commands: `/start` - запуск игры
- Description: P.I.D.R. Card Game

---

## 🎯 ШАГ 4: ТЕСТИРОВАНИЕ

### 4.1 Локальное тестирование
```bash
# Запустите backend локально
cd server
npm install
npm run dev

# Запустите frontend
npm run dev
```

### 4.2 Тестирование в Telegram
1. Откройте бота в Telegram
2. Нажмите "Start" или "Play"
3. Создайте комнату
4. Пригласите друзей по коду комнаты
5. Начните игру

---

## 🎯 ШАГ 5: МОНИТОРИНГ

### 5.1 Railway Dashboard
- **Logs:** Просмотр логов сервера
- **Metrics:** CPU, память, сеть
- **Deployments:** История деплоев

### 5.2 Vercel Dashboard
- **Analytics:** Статистика пользователей
- **Functions:** Логи API функций
- **Deployments:** История деплоев

---

## 🔧 РЕШЕНИЕ ПРОБЛЕМ

### Проблема: WebSocket не подключается
**Решение:**
1. Проверьте `NEXT_PUBLIC_WS_URL` в Vercel
2. Проверьте `CORS_ORIGIN` в Railway
3. Убедитесь, что Railway сервер запущен

### Проблема: CORS ошибки
**Решение:**
1. Добавьте ваш Vercel домен в `CORS_ORIGIN`
2. Перезапустите Railway сервер
3. Очистите кэш браузера

### Проблема: База данных не работает
**Решение:**
1. Проверьте `DATABASE_URL` в Railway
2. Убедитесь, что SQLite файл создается
3. Проверьте логи Railway

---

## 📊 СТАТИСТИКА

После деплоя вы получите:
- ✅ **Мультиплеер до 9 игроков**
- ✅ **WebSocket синхронизация**
- ✅ **База данных статистики**
- ✅ **Система достижений**
- ✅ **Рейтинговая система**

---

## 🎉 ГОТОВО!

Ваш P.I.D.R. мультиплеер готов к использованию!

**Ссылки:**
- **Игра:** https://your-app.vercel.app
- **Telegram Bot:** @your_bot
- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
