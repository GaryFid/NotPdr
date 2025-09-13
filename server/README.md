# P.I.D.R. WebSocket Server

Мультиплеерный сервер для карточной игры P.I.D.R. с поддержкой WebSocket, комнат, статистики игроков и базы данных.

## 🚀 Быстрый запуск

### Автоматический запуск (рекомендуется)

```bash
# Делаем скрипт исполняемым (Linux/Mac)
chmod +x start.sh

# Запуск в режиме разработки
./start.sh dev

# Запуск в продакшн режиме
./start.sh
```

### Ручной запуск

1. **Установка зависимостей:**
```bash
npm install
```

2. **Настройка окружения:**
```bash
cp .env.example .env
# Отредактируйте .env файл при необходимости
```

3. **Запуск сервера:**
```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## 📡 API Endpoints

### WebSocket
- **Путь:** `/api/socket`
- **События:** `join-room`, `leave-room`, `game-state-update`, `player-move`, etc.

### HTTP API
- `POST /api/rooms/create` - Создать комнату
- `POST /api/rooms/join` - Присоединиться к комнате
- `GET /api/stats/:userId` - Статистика игрока
- `GET /api/history/:userId` - История игр
- `GET /api/leaderboard` - Таблица лидеров
- `GET /api/health` - Проверка здоровья сервера

## 🏗️ Архитектура

### Основные компоненты

1. **GameRoomManager** - Управление игровыми комнатами
2. **Database** - SQLite база данных для статистики
3. **PlayerStatsManager** - Обработка и анализ статистики игроков
4. **WebSocket Server** - Socket.io для реального времени

### База данных

Сервер автоматически создает SQLite базу данных со следующими таблицами:

- `players` - Информация об игроках
- `games` - История игр
- `game_participations` - Участие игроков в играх
- `player_stats` - Агрегированная статистика
- `achievements` - Достижения игроков

## 🎮 Игровая логика

### Комнаты
- **Максимум игроков:** 4-8 (настраивается)
- **Коды комнат:** 6-символьные коды для присоединения
- **Автоочистка:** Неактивные комнаты удаляются через 30 минут

### Статистика
- **Рейтинг:** ELO-подобная система рейтинга
- **Достижения:** Автоматическое получение достижений
- **Аналитика:** Подробная статистика по играм

## ⚙️ Конфигурация

### Переменные окружения

```env
# Основные настройки
PORT=3001
CORS_ORIGIN=http://localhost:3000,https://t.me

# База данных
DATABASE_PATH=./pidr_game.db

# Настройки комнат
MAX_ROOMS=1000
ROOM_CLEANUP_INTERVAL=300000
ROOM_TIMEOUT_MINUTES=30

# Рейтинг
BASE_RATING=1000
MIN_RATING=100
MAX_RATING_CHANGE=50
```

### Настройка CORS для Telegram

Для работы с Telegram WebApp добавьте домены в `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://yourdomain.com,https://t.me
```

## 🔧 Разработка

### Структура файлов
```
server/
├── server.js              # Основной сервер
├── gameRoomManager.js      # Управление комнатами
├── database.js             # База данных
├── playerStatsManager.js   # Статистика игроков
├── package.json            # Зависимости
├── start.sh               # Скрипт запуска
└── README.md              # Документация
```

### Логирование

Сервер выводит подробные логи с эмодзи для удобства:
- 🔌 WebSocket соединения
- 🏠 Управление комнатами
- 💾 Операции с базой данных
- 📊 Статистика
- 🎮 Игровые события

### Отладка

1. **Проверка здоровья сервера:**
```bash
curl http://localhost:3001/api/health
```

2. **Просмотр логов в реальном времени:**
```bash
npm run dev
```

## 🌐 Деплой

### Docker (рекомендуется)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2

```bash
npm install -g pm2
pm2 start server.js --name "pidr-server"
pm2 save
pm2 startup
```

## 📊 Мониторинг

### Метрики
- Активные комнаты: `/api/health`
- Подключенные клиенты: Socket.io статистика
- Статистика базы данных: автоматические запросы

### Логи
- Консольные логи с цветовой индикацией
- Файл логов: `./logs/server.log` (если настроено)

## 🔒 Безопасность

1. **Rate Limiting** - Ограничение частоты запросов
2. **CORS** - Настраиваемые домены
3. **Input Validation** - Проверка входных данных
4. **SQL Injection** - Параметризованные запросы

## 🚨 Устранение неполадок

### Частые проблемы

1. **Порт занят:**
```bash
lsof -i :3001
kill -9 <PID>
```

2. **База данных заблокирована:**
```bash
rm pidr_game.db
# Перезапуск создаст новую базу
```

3. **CORS ошибки:**
   - Проверьте `CORS_ORIGIN` в `.env`
   - Убедитесь что домен клиента включен

### Логи ошибок

Все ошибки логируются с контекстом:
```
❌ [Component] Описание ошибки: детали
```

## 🤝 Интеграция с фронтендом

### useWebSocket Hook
```typescript
const {
  isConnected,
  joinRoom,
  sendPlayerMove,
  updateGameState
} = useWebSocket({
  userId: user.id,
  roomId: roomId,
  autoConnect: true
});
```

### Компоненты
- `MultiplayerMenu` - Создание/присоединение к комнатам
- `MultiplayerLobby` - Лобби с игроками
- `PlayerStats` - Отображение статистики

## 📈 Производительность

- **SQLite** - Быстрая локальная база данных
- **Socket.io** - Оптимизированный WebSocket транспорт
- **Memory Management** - Автоочистка неактивных комнат
- **Индексы БД** - Оптимизированные запросы

---

## ⭐ Возможности

✅ Мультиплеер до 8 игроков  
✅ Система комнат с кодами  
✅ WebSocket синхронизация  
✅ База данных статистики  
✅ Рейтинговая система  
✅ Система достижений  
✅ Автоочистка комнат  
✅ RESTful API  
✅ Telegram WebApp поддержка  

🎯 **Готов к продакшену!**
