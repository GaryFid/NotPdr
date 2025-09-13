class GameRoom {
  constructor(id, hostUserId, maxPlayers = 4) {
    this.id = id;
    this.hostUserId = hostUserId;
    this.maxPlayers = maxPlayers;
    this.roomCode = null;
    this.players = new Map(); // userId -> { socketId, isReady, joinTime }
    this.gameState = null;
    this.gameInProgress = false;
    this.gameStartTime = null;
    this.gameEndTime = null;
    this.createdAt = new Date();
    this.lastActivity = new Date();
  }

  // Добавить игрока в комнату
  addPlayer(userId, socketId) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Комната заполнена');
    }

    if (this.gameInProgress) {
      throw new Error('Игра уже идет');
    }

    this.players.set(userId, {
      socketId,
      isReady: false,
      joinTime: new Date(),
      isHost: userId === this.hostUserId
    });

    this.updateActivity();
    console.log(`✅ [GameRoom ${this.id}] Игрок ${userId} добавлен (${this.players.size}/${this.maxPlayers})`);
  }

  // Удалить игрока из комнаты
  removePlayer(userId) {
    const removed = this.players.delete(userId);
    
    if (removed) {
      this.updateActivity();
      console.log(`➖ [GameRoom ${this.id}] Игрок ${userId} удален (${this.players.size}/${this.maxPlayers})`);
    }

    // Если хост покинул комнату, назначаем нового хоста
    if (userId === this.hostUserId && this.players.size > 0) {
      const firstPlayer = this.players.keys().next().value;
      this.hostUserId = firstPlayer;
      this.players.get(firstPlayer).isHost = true;
      console.log(`👑 [GameRoom ${this.id}] Новый хост: ${firstPlayer}`);
    }

    return removed;
  }

  // Установить готовность игрока
  setPlayerReady(userId, isReady) {
    const player = this.players.get(userId);
    if (player) {
      player.isReady = isReady;
      this.updateActivity();
      console.log(`🎯 [GameRoom ${this.id}] Игрок ${userId} готовность: ${isReady}`);
    }
  }

  // Проверить готовность всех игроков
  areAllPlayersReady() {
    if (this.players.size < 4) {
      return false; // Минимум 4 игрока для P.I.D.R.
    }

    for (const player of this.players.values()) {
      if (!player.isReady) {
        return false;
      }
    }
    return true;
  }

  // Сбросить готовность всех игроков
  resetPlayersReady() {
    for (const player of this.players.values()) {
      player.isReady = false;
    }
    this.updateActivity();
    console.log(`🔄 [GameRoom ${this.id}] Готовность всех игроков сброшена`);
  }

  // Начать игру
  startGame(gameSettings) {
    if (this.gameInProgress) {
      throw new Error('Игра уже идет');
    }

    if (this.players.size < 4) {
      throw new Error('Недостаточно игроков (минимум 4)');
    }

    this.gameInProgress = true;
    this.gameStartTime = new Date();
    this.gameState = {
      ...gameSettings,
      roomId: this.id,
      startTime: this.gameStartTime,
      playersCount: this.players.size
    };

    this.updateActivity();
    console.log(`🚀 [GameRoom ${this.id}] Игра началась с ${this.players.size} игроками`);
  }

  // Завершить игру
  endGame(results) {
    if (!this.gameInProgress) {
      throw new Error('Игра не идет');
    }

    this.gameInProgress = false;
    this.gameEndTime = new Date();
    
    // Добавляем информацию о длительности игры
    if (this.gameStartTime) {
      results.gameDuration = this.gameEndTime - this.gameStartTime;
    }

    this.updateActivity();
    console.log(`🏁 [GameRoom ${this.id}] Игра завершена. Длительность: ${results.gameDuration}ms`);
  }

  // Обновить состояние игры
  updateGameState(gameState) {
    this.gameState = { ...this.gameState, ...gameState };
    this.updateActivity();
  }

  // Обновить время последней активности
  updateActivity() {
    this.lastActivity = new Date();
  }

  // Проверить истекло ли время неактивности
  isExpired(timeoutMinutes = 30) {
    const now = new Date();
    const diffMinutes = (now - this.lastActivity) / (1000 * 60);
    return diffMinutes > timeoutMinutes;
  }

  // Получить информацию о комнате
  getInfo() {
    return {
      id: this.id,
      roomCode: this.roomCode,
      hostUserId: this.hostUserId,
      maxPlayers: this.maxPlayers,
      currentPlayers: this.players.size,
      gameInProgress: this.gameInProgress,
      gameState: this.gameState,
      players: Array.from(this.players.entries()).map(([userId, playerData]) => ({
        userId,
        socketId: playerData.socketId,
        isReady: playerData.isReady,
        isHost: playerData.isHost,
        joinTime: playerData.joinTime
      })),
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      canStart: this.areAllPlayersReady()
    };
  }
}

class GameRoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> GameRoom
    this.roomCodes = new Map(); // roomCode -> roomId
    
    // Периодическая очистка старых комнат
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Каждые 5 минут
  }

  // Создать новую комнату
  createRoom(roomId, hostUserId, maxPlayers = 4) {
    if (this.rooms.has(roomId)) {
      throw new Error('Комната с таким ID уже существует');
    }

    const room = new GameRoom(roomId, hostUserId, maxPlayers);
    this.rooms.set(roomId, room);

    console.log(`🏠 [GameRoomManager] Создана новая комната: ${roomId} (хост: ${hostUserId})`);
    
    return room;
  }

  // Присоединиться к комнате
  joinRoom(roomId, userId, socketId) {
    let room = this.rooms.get(roomId);
    
    // Если комната не существует, создаем новую
    if (!room) {
      room = this.createRoom(roomId, userId);
    }

    room.addPlayer(userId, socketId);
    return room;
  }

  // Покинуть комнату
  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    const removed = room.removePlayer(userId);
    
    // Удаляем пустые комнаты
    if (room.players.size === 0) {
      this.deleteRoom(roomId);
    }

    return removed;
  }

  // Удалить комнату
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room && room.roomCode) {
      this.roomCodes.delete(room.roomCode);
    }
    
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      console.log(`🗑️ [GameRoomManager] Комната ${roomId} удалена`);
    }
    
    return deleted;
  }

  // Получить комнату
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // Найти комнату по коду
  findRoomByCode(roomCode) {
    for (const room of this.rooms.values()) {
      if (room.roomCode === roomCode.toUpperCase()) {
        return room;
      }
    }
    return null;
  }

  // Установить код комнаты
  setRoomCode(roomId, roomCode) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Комната не найдена');
    }

    // Проверяем уникальность кода
    const existingRoom = this.findRoomByCode(roomCode);
    if (existingRoom && existingRoom.id !== roomId) {
      throw new Error('Код комнаты уже используется');
    }

    // Удаляем старый код если был
    if (room.roomCode) {
      this.roomCodes.delete(room.roomCode);
    }

    room.roomCode = roomCode.toUpperCase();
    this.roomCodes.set(room.roomCode, roomId);

    console.log(`🔑 [GameRoomManager] Код комнаты ${roomId} установлен: ${room.roomCode}`);
  }

  // Получить количество комнат
  getRoomCount() {
    return this.rooms.size;
  }

  // Получить статистику
  getStats() {
    let totalPlayers = 0;
    let activeGames = 0;
    
    for (const room of this.rooms.values()) {
      totalPlayers += room.players.size;
      if (room.gameInProgress) {
        activeGames++;
      }
    }

    return {
      totalRooms: this.rooms.size,
      totalPlayers,
      activeGames,
      timestamp: new Date()
    };
  }

  // Очистка старых комнат
  cleanup() {
    let cleanedCount = 0;
    
    for (const [roomId, room] of this.rooms.entries()) {
      // Удаляем пустые комнаты или комнаты с истекшим временем неактивности
      if (room.players.size === 0 || room.isExpired()) {
        this.deleteRoom(roomId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 [GameRoomManager] Очищено ${cleanedCount} неактивных комнат`);
    }
  }

  // Получить список всех комнат (для отладки)
  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => room.getInfo());
  }

  // Деструктор
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.rooms.clear();
    this.roomCodes.clear();
  }
}

module.exports = GameRoomManager;
