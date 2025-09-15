# 🔧 **Отладка аутентификации P.I.D.R. Game**

## 🚨 **Текущие проблемы:**
1. ❌ Страница входа показывает белый фон вместо темного
2. ❌ 500 ошибка при POST `/api/auth` 
3. ❌ "Ошибка сети. Попробуйте позже"
4. ❌ Telegram авторизация не работает

## 🛠️ **Решения:**

### **1. Тестовая авторизация**
Создана тестовая страница: `/auth/test-login`

**Что делает:**
- ✅ Обходит Supabase (использует `/api/auth/test`)
- ✅ Симулирует Telegram авторизацию
- ✅ Сохраняет пользователя в localStorage
- ✅ Перенаправляет в игру

**Как тестировать:**
1. Откройте `/auth/test-login`
2. Нажмите "ТЕСТ TELEGRAM ВХОД"
3. Должно показать "✅ Успешный вход!"
4. Автоматическое перенаправление на главную

### **2. Проверка логов сервера**
Добавлено подробное логирование в `/api/auth`:

```bash
# Запустите dev сервер и смотрите логи:
npm run dev

# В консоли будут логи:
🚀 Auth API called
📝 Request body: {...}
📱 Telegram auth request
👤 Telegram user data: {...}
🔍 Looking for user with telegramId: ...
```

### **3. Проверка переменных окружения**

Создайте файл `.env.local` в корне проекта:

```env
# Supabase (обязательно!)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# JWT (обязательно!)
JWT_SECRET=your-very-long-secret-key-here

# Telegram (опционально для теста)
BOT_TOKEN=your-telegram-bot-token

# Rate limiting (опционально)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### **4. Проверка Supabase**

#### **Создание таблицы users:**
```sql
-- В Supabase SQL Editor выполните:
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegramId VARCHAR(50) UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  avatar VARCHAR(500),
  authType VARCHAR(20) DEFAULT 'local',
  gamesPlayed INTEGER DEFAULT 0,
  gamesWon INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 1000,
  coins INTEGER DEFAULT 1000,
  referralCode VARCHAR(10) UNIQUE,
  registrationDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegramId);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Таблица статуса пользователей
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **5. Исправление дизайна**

Если страница входа все еще белая:

1. **Очистите кэш браузера:**
   - Ctrl+Shift+R (жесткая перезагрузка)
   - Или откройте в приватном режиме

2. **Перезапустите dev сервер:**
   ```bash
   # Остановите сервер (Ctrl+C)
   npm run dev
   ```

3. **Проверьте файл `src/app/auth/login/page.tsx`:**
   - Должен содержать `bg="linear-gradient(135deg, #0f172a..."`
   - Не должен содержать `bg="white"`

## 🔍 **Диагностика шаг за шагом:**

### **Шаг 1: Тестовый API**
```bash
# Проверьте что тестовый API работает:
curl http://localhost:3000/api/auth/test
# Должен вернуть: {"status":"Test auth API is working",...}
```

### **Шаг 2: Тестовая авторизация**
1. Откройте `/auth/test-login`
2. Откройте DevTools (F12) → Console
3. Нажмите "ТЕСТ TELEGRAM ВХОД"
4. Смотрите логи в консоли браузера и сервера

### **Шаг 3: Проверка Supabase**
```bash
# В консоли сервера должно быть:
# ✅ Supabase config check: { hasUrl: true, hasKey: true, ... }
# ❌ Если: Missing Supabase environment variables
```

### **Шаг 4: Реальная авторизация**
После успешного теста:
1. Настройте переменные окружения
2. Создайте таблицы в Supabase
3. Попробуйте обычный вход `/auth/login`

## 🎯 **Приоритеты исправления:**

### **Высокий приоритет:**
1. ✅ **Тестовая авторизация** (готова)
2. 🔧 **Переменные окружения** (настройте)
3. 🔧 **Supabase таблицы** (создайте)

### **Средний приоритет:**
4. 🔧 **Дизайн страницы входа** (очистите кэш)
5. 🔧 **Telegram bot настройка**

### **Низкий приоритет:**
6. 🔧 **Rate limiting** (опционально)
7. 🔧 **OAuth провайдеры** (Google, VK)

## 🚀 **Быстрый старт для теста:**

1. **Запустите сервер:**
   ```bash
   npm run dev
   ```

2. **Откройте тестовую страницу:**
   ```
   http://localhost:3000/auth/test-login
   ```

3. **Нажмите "ТЕСТ TELEGRAM ВХОД"**

4. **Если успешно - увидите:**
   - ✅ Сообщение об успехе
   - Автоматическое перенаправление
   - Пользователь сохранен в localStorage

5. **Проверьте localStorage:**
   - F12 → Application → Local Storage
   - Должны быть: `auth_token`, `user`, `current_user`

## 📞 **Если все еще не работает:**

### **Проверьте порт:**
- Сервер должен быть на `http://localhost:3000`
- Не `http://localhost:3001` или другом порту

### **Проверьте файлы:**
- `src/app/api/auth/test/route.ts` - должен существовать
- `src/app/auth/test-login/page.tsx` - должен существовать

### **Логи ошибок:**
```bash
# В терминале где запущен npm run dev смотрите:
🚀 Auth API called          # API вызвался
📝 Request body: {...}      # Данные получены
✅ Test user created: {...} # Пользователь создан

# Если нет этих логов - проблема с маршрутизацией
```

---

**После успешного теста можно настраивать реальный Supabase!** 🎉
