#!/bin/bash

# P.I.D.R. WebSocket Server Startup Script

echo "🚀 [P.I.D.R. Server] Запуск сервера..."

# Проверяем установлены ли зависимости
if [ ! -d "node_modules" ]; then
  echo "📦 [P.I.D.R. Server] Устанавливаем зависимости..."
  npm install
fi

# Создаем директорию для логов
mkdir -p logs

# Создаем .env файл если не существует
if [ ! -f ".env" ]; then
  echo "⚙️ [P.I.D.R. Server] Создаем файл переменных окружения..."
  cat > .env << EOL
PORT=3001
CORS_ORIGIN=http://localhost:3000,https://t.me
DATABASE_PATH=./pidr_game.db
WS_PATH=/api/socket
MAX_ROOMS=1000
ROOM_CLEANUP_INTERVAL=300000
ROOM_TIMEOUT_MINUTES=30
BASE_RATING=1000
MIN_RATING=100
MAX_RATING_CHANGE=50
LOG_LEVEL=info
JWT_SECRET=pidr-game-secret-$(date +%s)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
EOL
fi

# Запускаем сервер
if [ "$1" == "dev" ]; then
  echo "🔧 [P.I.D.R. Server] Запуск в режиме разработки..."
  npm run dev
else
  echo "🏭 [P.I.D.R. Server] Запуск в продакшн режиме..."
  npm start
fi
