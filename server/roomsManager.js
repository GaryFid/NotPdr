const { v4: uuidv4 } = require('uuid');

class RoomsManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map(); // userId -> roomId mapping
    
    // Запускаем очистку неактивных комнат каждую минуту
    setInterval(() => this.cleanupInactiveRooms(), 60000);
  }

  generateRoomCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.getRoomByCode(code));
    return code;
  }

  createRoom(hostUserId, roomData) {
    const roomId = uuidv4();
    const roomCode = this.generateRoomCode();
    
    const room = {
      id: roomId,
      code: roomCode,
      name: roomData.roomName || `Комната ${roomCode}`,
      host: roomData.hostName || 'Хост',
      hostUserId: hostUserId,
      maxPlayers: roomData.maxPlayers || 6,
      gameMode: roomData.gameMode || 'casual',
      hasPassword: roomData.hasPassword || false,
      password: roomData.password || null,
      isPrivate: roomData.isPrivate || false,
      status: 'waiting', // waiting, playing, finished
      players: [{
        userId: hostUserId,
        name: roomData.hostName || 'Хост',
        isReady: true,
        isHost: true,
        joinedAt: new Date()
      }],
      createdAt: new Date(),
      lastActivity: new Date(),
      gameData: null, // Данные текущей игры
      gameResults: null // Результаты завершенной игры
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(hostUserId, roomId);
    
    console.log(`✅ Room created: ${roomCode} by ${roomData.hostName}`);
    return room;
  }

  joinRoom(roomCode, userId, userData, password = null) {
    const room = this.getRoomByCode(roomCode);
    
    if (!room) {
      throw new Error('Комната не найдена');
    }

    if (room.status !== 'waiting') {
      throw new Error('Комната недоступна для подключения');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Комната заполнена');
    }

    if (room.hasPassword && room.password !== password) {
      throw new Error('Неверный пароль');
    }

    // Проверяем, не находится ли игрок уже в комнате
    if (room.players.find(p => p.userId === userId)) {
      throw new Error('Вы уже в этой комнате');
    }

    // Добавляем игрока
    const player = {
      userId: userId,
      name: userData.userName || 'Игрок',
      isReady: false,
      isHost: false,
      joinedAt: new Date()
    };

    room.players.push(player);
    room.lastActivity = new Date();
    this.playerRooms.set(userId, room.id);

    console.log(`✅ Player ${userData.userName} joined room ${roomCode}`);
    return room;
  }

  leaveRoom(userId) {
    const roomId = this.playerRooms.get(userId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Удаляем игрока из комнаты
    room.players = room.players.filter(p => p.userId !== userId);
    this.playerRooms.delete(userId);
    room.lastActivity = new Date();

    // Если комната пуста, удаляем её
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      console.log(`🗑️ Empty room ${room.code} deleted`);
      return { roomDeleted: true, room };
    }

    // Если хост покинул комнату, назначаем нового хоста
    if (room.hostUserId === userId && room.players.length > 0) {
      const newHost = room.players[0];
      newHost.isHost = true;
      room.hostUserId = newHost.userId;
      room.host = newHost.name;
      console.log(`👑 New host: ${newHost.name} in room ${room.code}`);
    }

    console.log(`❌ Player left room ${room.code}, ${room.players.length} players remaining`);
    return { roomDeleted: false, room };
  }

  getRoomByCode(code) {
    for (const room of this.rooms.values()) {
      if (room.code === code) {
        return room;
      }
    }
    return null;
  }

  getRoomById(roomId) {
    return this.rooms.get(roomId);
  }

  getPlayerRoom(userId) {
    const roomId = this.playerRooms.get(userId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  getAllRooms() {
    return Array.from(this.rooms.values())
      .filter(room => !room.isPrivate) // Показываем только публичные комнаты
      .map(room => ({
        id: room.id,
        code: room.code,
        name: room.name,
        host: room.host,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        gameMode: room.gameMode,
        hasPassword: room.hasPassword,
        isPrivate: room.isPrivate,
        status: room.status,
        ping: Math.floor(Math.random() * 50) + 20, // Mock ping
        difficulty: room.gameMode === 'casual' ? 'easy' : 'medium',
        createdAt: room.createdAt
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Новые комнаты сверху
  }

  updateRoomActivity(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.lastActivity = new Date();
    }
  }

  startGame(roomId, gameData) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.status = 'playing';
    room.gameData = gameData;
    room.lastActivity = new Date();
    
    console.log(`🎮 Game started in room ${room.code}`);
    return true;
  }

  finishGame(roomId, gameResults) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.status = 'finished';
    room.gameResults = {
      ...gameResults,
      finishedAt: new Date()
    };
    room.lastActivity = new Date();

    console.log(`🏁 Game finished in room ${room.code}`);

    // Удаляем комнату через 3 минуты после завершения игры
    setTimeout(() => {
      if (this.rooms.has(roomId)) {
        // Здесь можно сохранить результаты в базу данных
        this.saveGameResults(room);
        
        // Удаляем всех игроков из маппинга
        room.players.forEach(player => {
          this.playerRooms.delete(player.userId);
        });
        
        this.rooms.delete(roomId);
        console.log(`🗑️ Finished room ${room.code} deleted after 3 minutes`);
      }
    }, 3 * 60 * 1000); // 3 минуты

    return true;
  }

  saveGameResults(room) {
    // TODO: Сохранить результаты игры в базу данных для рейтинга
    console.log(`💾 Saving game results for room ${room.code}:`, room.gameResults);
  }

  cleanupInactiveRooms() {
    const now = new Date();
    const inactiveThreshold = 15 * 60 * 1000; // 15 минут

    for (const [roomId, room] of this.rooms.entries()) {
      const inactiveTime = now - room.lastActivity;
      
      if (room.status === 'waiting' && inactiveTime > inactiveThreshold) {
        // Удаляем всех игроков из маппинга
        room.players.forEach(player => {
          this.playerRooms.delete(player.userId);
        });
        
        this.rooms.delete(roomId);
        console.log(`🧹 Inactive room ${room.code} cleaned up (inactive for ${Math.round(inactiveTime / 60000)} minutes)`);
      }
    }
  }

  getRoomStats() {
    const totalRooms = this.rooms.size;
    const waitingRooms = Array.from(this.rooms.values()).filter(r => r.status === 'waiting').length;
    const playingRooms = Array.from(this.rooms.values()).filter(r => r.status === 'playing').length;
    const totalPlayers = Array.from(this.rooms.values()).reduce((sum, room) => sum + room.players.length, 0);

    return {
      totalRooms,
      waitingRooms,
      playingRooms,
      totalPlayers
    };
  }
}

// Singleton instance
const roomsManager = new RoomsManager();

module.exports = roomsManager;
