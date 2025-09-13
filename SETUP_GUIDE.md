# 🎯 ПОШАГОВАЯ НАСТРОЙКА P.I.D.R. МУЛЬТИПЛЕЕРА

## 📋 ЧТО У ВАС ЕСТЬ:

✅ **Frontend на Vercel** - Next.js приложение  
✅ **Telegram Bot** - настроен и работает  
✅ **CORS_ORIGIN** - настроен на ваш сайт  

## 🎯 ЧТО НУЖНО СДЕЛАТЬ:

### **ШАГ 1: ДЕПЛОЙ BACKEND НА RAILWAY**

#### 1.1 Создайте аккаунт Railway
1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "Login" → "Login with GitHub"
3. Разрешите доступ к репозиторию

#### 1.2 Создайте новый проект
1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Найдите ваш репозиторий `pidr_react`
4. Выберите папку `server` как Root Directory
5. Нажмите "Deploy"

#### 1.3 Настройте переменные окружения
В Railway Dashboard → Variables добавьте:

```bash
# Основные настройки
PORT=3001
NODE_ENV=production

# CORS (ЗАМЕНИТЕ НА ВАШ VERCEL ДОМЕН!)
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

#### 1.4 Дождитесь деплоя
- Railway автоматически установит зависимости
- Дождитесь статуса "Deployed"
- Скопируйте URL сервера (например: `https://pidr-server-production.up.railway.app`)

---

### **ШАГ 2: НАСТРОЙКА VERCEL**

#### 2.1 Обновите переменные окружения
В Vercel Dashboard → Settings → Environment Variables добавьте:

```bash
# WebSocket URL (ЗАМЕНИТЕ НА ВАШ RAILWAY URL!)
NEXT_PUBLIC_WS_URL=wss://pidr-server-production.up.railway.app

# API URL (ЗАМЕНИТЕ НА ВАШ RAILWAY URL!)
NEXT_PUBLIC_API_URL=https://pidr-server-production.up.railway.app
```

#### 2.2 Передеплойте Vercel
1. Сделайте любой commit в GitHub
2. Vercel автоматически передеплоит с новыми переменными
3. Дождитесь завершения деплоя

---

### **ШАГ 3: ОБНОВЛЕНИЕ TELEGRAM BOT**

#### 3.1 Обновите WebApp URL
В @BotFather:
1. Отправьте `/mybots`
2. Выберите вашего бота
3. Нажмите "Bot Settings" → "Menu Button"
4. Установите URL: `https://your-app.vercel.app`

#### 3.2 Проверьте настройки
- WebApp URL: `https://your-app.vercel.app`
- Commands: `/start` - запуск игры
- Description: P.I.D.R. Card Game

---

### **ШАГ 4: ТЕСТИРОВАНИЕ**

#### 4.1 Проверьте Railway
1. Откройте Railway Dashboard
2. Перейдите в "Deployments"
3. Нажмите на последний деплой
4. Проверьте логи - не должно быть ошибок

#### 4.2 Проверьте Vercel
1. Откройте Vercel Dashboard
2. Перейдите в "Functions"
3. Проверьте, что переменные окружения установлены

#### 4.3 Тестирование в Telegram
1. Откройте бота в Telegram
2. Нажмите "Start" или "Play"
3. Перейдите в "ОНЛАЙН" → "Создать комнату"
4. Создайте комнату на 4-9 игроков
5. Скопируйте код комнаты
6. Откройте бота в другом аккаунте Telegram
7. Войдите в комнату по коду
8. Начните игру!

---

## 🔧 РЕШЕНИЕ ПРОБЛЕМ

### ❌ WebSocket не подключается
**Проверьте:**
1. `NEXT_PUBLIC_WS_URL` в Vercel (должен начинаться с `wss://`)
2. `CORS_ORIGIN` в Railway (должен содержать ваш Vercel домен)
3. Railway сервер запущен (статус "Deployed")

### ❌ CORS ошибки
**Проверьте:**
1. В Railway `CORS_ORIGIN` содержит ваш Vercel домен
2. В Vercel `NEXT_PUBLIC_WS_URL` правильный
3. Перезапустите Railway сервер

### ❌ База данных не работает
**Проверьте:**
1. `DATABASE_URL=./pidr.db` в Railway
2. Логи Railway на наличие ошибок SQLite
3. Перезапустите Railway сервер

---

## 🎉 ГОТОВО!

После выполнения всех шагов у вас будет:

✅ **Мультиплеер до 9 игроков**  
✅ **WebSocket синхронизация**  
✅ **База данных статистики**  
✅ **Система достижений**  
✅ **Рейтинговая система**  

**Ссылки:**
- **Игра:** https://your-app.vercel.app
- **Telegram Bot:** @your_bot
- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 📞 ПОДДЕРЖКА

Если возникли проблемы:
1. Проверьте логи Railway
2. Проверьте переменные окружения
3. Убедитесь, что все URL правильные
4. Перезапустите серверы

**Удачи с P.I.D.R. мультиплеером! 🎮🚀**
