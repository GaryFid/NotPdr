const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Database = require('./database');
const GameRoomManager = require('./gameRoomManager');
const PlayerStatsManager = require('./playerStatsManager');

const app = express();
const server = http.createServer(app);

// Настройка CORS для Express
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://t.me'],
  credentials: true
}));

app.use(express.json());

// Инициализация Socket.IO
const io = socketIo(server, {
  path: '/api/socket',
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://t.me'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Инициализация компонентов
const db = new Database();
const gameRoomManager = new GameRoomManager();
const playerStatsManager = new PlayerStatsManager(db);

const PORT = process.env.PORT || 3001;

// ===== WEBSOCKET СОБЫТИЯ =====

io.on('connection', (socket) => {
  console.log(`🔌 [WebSocket Server] Новое подключение: ${socket.id}`);

  // Присоединение к игровой комнате
  socket.on('join-room', async (roomId, userId) => {
    try {
      console.log(`👥 [WebSocket Server] Игрок ${userId} присоединяется к комнате ${roomId}`);
      
      const room = gameRoomManager.joinRoom(roomId, userId, socket.id);
      socket.join(roomId);
      socket.userId = userId;
      socket.roomId = roomId;

      // Уведомляем всех в комнате о новом игроке
      io.to(roomId).emit('player-joined', {
        userId,
        socketId: socket.id,
        roomInfo: room.getInfo()
      });

      // Отправляем текущее состояние комнаты новому игроку
      socket.emit('room-state', room.getInfo());

      console.log(`✅ [WebSocket Server] Игрок ${userId} успешно присоединился к комнате ${roomId}`);
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка присоединения к комнате:`, error);
      socket.emit('error', { message: 'Не удалось присоединиться к комнате' });
    }
  });

  // Покидание игровой комнаты
  socket.on('leave-room', (roomId, userId) => {
    try {
      console.log(`👥 [WebSocket Server] Игрок ${userId} покидает комнату ${roomId}`);
      
      gameRoomManager.leaveRoom(roomId, userId);
      socket.leave(roomId);

      // Уведомляем остальных игроков
      io.to(roomId).emit('player-left', {
        userId,
        socketId: socket.id
      });

      socket.userId = null;
      socket.roomId = null;
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка покидания комнаты:`, error);
    }
  });

  // Обновление состояния игры
  socket.on('game-state-update', (roomId, gameState) => {
    try {
      console.log(`🎮 [WebSocket Server] Обновление состояния игры в комнате ${roomId}`);
      
      const room = gameRoomManager.getRoom(roomId);
      if (room) {
        room.updateGameState(gameState);
        
        // Отправляем состояние всем игрокам в комнате кроме отправителя
        socket.to(roomId).emit('game-state-sync', gameState);
      }
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка обновления состояния игры:`, error);
    }
  });

  // Ход игрока
  socket.on('player-move', (roomId, moveData) => {
    try {
      console.log(`🎯 [WebSocket Server] Ход игрока в комнате ${roomId}:`, moveData);
      
      // Отправляем ход всем игрокам в комнате кроме отправителя
      socket.to(roomId).emit('player-move-sync', moveData);
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка обработки хода:`, error);
    }
  });

  // Готовность игрока
  socket.on('player-ready', (roomId, readyData) => {
    try {
      console.log(`✅ [WebSocket Server] Готовность игрока ${readyData.userId}: ${readyData.isReady}`);
      
      const room = gameRoomManager.getRoom(roomId);
      if (room) {
        room.setPlayerReady(readyData.userId, readyData.isReady);
        
        // Уведомляем всех в комнате
        io.to(roomId).emit('player-ready-sync', readyData);

        // Проверяем, готовы ли все игроки к игре
        if (room.areAllPlayersReady() && room.players.size >= 4) {
          console.log(`🚀 [WebSocket Server] Все игроки готовы в комнате ${roomId}, запускаем игру!`);
          
          const gameSettings = {
            playerCount: room.players.size,
            roomId: roomId,
            startTime: Date.now()
          };
          
          room.startGame(gameSettings);
          io.to(roomId).emit('game-started', gameSettings);
        }
      }
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка установки готовности:`, error);
    }
  });

  // Запуск игры
  socket.on('start-game', (roomId, gameSettings) => {
    try {
      console.log(`🚀 [WebSocket Server] Принудительный запуск игры в комнате ${roomId}`);
      
      const room = gameRoomManager.getRoom(roomId);
      if (room) {
        room.startGame(gameSettings);
        io.to(roomId).emit('game-started', gameSettings);
      }
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка запуска игры:`, error);
    }
  });

  // Завершение игры
  socket.on('end-game', async (roomId, results) => {
    try {
      console.log(`🏁 [WebSocket Server] Завершение игры в комнате ${roomId}:`, results);
      
      const room = gameRoomManager.getRoom(roomId);
      if (room) {
        room.endGame(results);
        
        // Сохраняем статистику игры
        await playerStatsManager.saveGameResults(roomId, results);
        
        // Уведомляем всех игроков
        io.to(roomId).emit('game-ended', results);

        // Сбрасываем готовность игроков для новой игры
        room.resetPlayersReady();
      }
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка завершения игры:`, error);
    }
  });

  // Чат в игре
  socket.on('game-chat', (roomId, message) => {
    try {
      console.log(`💬 [WebSocket Server] Сообщение в чате комнаты ${roomId}:`, message);
      
      // Отправляем сообщение всем в комнате
      io.to(roomId).emit('game-chat-message', message);
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка чата:`, error);
    }
  });

  // Приглашение друга
  socket.on('invite-friend', (invitationData) => {
    try {
      console.log(`💌 [WebSocket Server] Приглашение друга:`, invitationData);
      
      // Отправляем приглашение конкретному пользователю (если он онлайн)
      const targetSocket = findSocketByUserId(invitationData.friendId);
      if (targetSocket) {
        targetSocket.emit('friend-invitation', invitationData);
      }
    } catch (error) {
      console.error(`❌ [WebSocket Server] Ошибка приглашения:`, error);
    }
  });

  // Отключение сокета
  socket.on('disconnect', (reason) => {
    console.log(`🔌 [WebSocket Server] Отключение сокета ${socket.id}: ${reason}`);
    
    if (socket.roomId && socket.userId) {
      try {
        gameRoomManager.leaveRoom(socket.roomId, socket.userId);
        
        // Уведомляем остальных игроков
        socket.to(socket.roomId).emit('player-left', {
          userId: socket.userId,
          socketId: socket.id
        });
      } catch (error) {
        console.error(`❌ [WebSocket Server] Ошибка при отключении:`, error);
      }
    }
  });
});

// ===== HTTP API ЭНДПОИНТЫ =====

// Создание новой игровой комнаты
app.post('/api/rooms/create', (req, res) => {
  try {
    const { hostUserId, maxPlayers = 4 } = req.body;
    
    if (!hostUserId) {
      return res.status(400).json({ error: 'hostUserId обязателен' });
    }

    const roomId = uuidv4();
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = gameRoomManager.createRoom(roomId, hostUserId, maxPlayers);
    room.roomCode = roomCode;

    console.log(`🏠 [HTTP API] Создана новая комната: ${roomId} (код: ${roomCode})`);

    res.json({
      roomId,
      roomCode,
      maxPlayers,
      hostUserId
    });
  } catch (error) {
    console.error(`❌ [HTTP API] Ошибка создания комнаты:`, error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Присоединение к комнате по коду
app.post('/api/rooms/join', (req, res) => {
  try {
    const { roomCode, userId } = req.body;
    
    if (!roomCode || !userId) {
      return res.status(400).json({ error: 'roomCode и userId обязательны' });
    }

    const room = gameRoomManager.findRoomByCode(roomCode);
    if (!room) {
      return res.status(404).json({ error: 'Комната не найдена' });
    }

    if (room.players.size >= room.maxPlayers) {
      return res.status(400).json({ error: 'Комната заполнена' });
    }

    console.log(`🚪 [HTTP API] Присоединение к комнате ${room.id} по коду ${roomCode}`);

    res.json({
      roomId: room.id,
      roomCode: room.roomCode,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.players.size,
      hostUserId: room.hostUserId
    });
  } catch (error) {
    console.error(`❌ [HTTP API] Ошибка присоединения к комнате:`, error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение статистики игрока
app.get('/api/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await playerStatsManager.getPlayerStats(userId);
    
    res.json(stats);
  } catch (error) {
    console.error(`❌ [HTTP API] Ошибка получения статистики:`, error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение истории игр игрока
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const history = await playerStatsManager.getGameHistory(userId, parseInt(limit), parseInt(offset));
    
    res.json(history);
  } catch (error) {
    console.error(`❌ [HTTP API] Ошибка получения истории:`, error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение топ игроков
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const leaderboard = await playerStatsManager.getLeaderboard(parseInt(limit));
    
    res.json(leaderboard);
  } catch (error) {
    console.error(`❌ [HTTP API] Ошибка получения рейтинга:`, error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    activeRooms: gameRoomManager.getRoomCount(),
    connectedClients: io.sockets.sockets.size
  });
});

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function findSocketByUserId(userId) {
  for (const [id, socket] of io.sockets.sockets) {
    if (socket.userId === userId) {
      return socket;
    }
  }
  return null;
}

// ===== ЗАПУСК СЕРВЕРА =====

server.listen(PORT, () => {
  console.log(`🚀 [P.I.D.R. Server] Сервер запущен на порту ${PORT}`);
  console.log(`🔌 [P.I.D.R. Server] WebSocket доступен по пути /api/socket`);
  console.log(`📡 [P.I.D.R. Server] HTTP API доступен по /api/*`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 [P.I.D.R. Server] Получен SIGTERM, завершаем работу...');
  server.close(() => {
    console.log('✅ [P.I.D.R. Server] Сервер успешно остановлен');
    process.exit(0);
  });
});
