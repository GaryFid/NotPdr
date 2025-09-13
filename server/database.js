const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor(dbPath = './pidr_game.db') {
    this.dbPath = dbPath;
    this.db = null;
    this.init();
  }

  // Инициализация базы данных
  init() {
    console.log(`💾 [Database] Инициализация базы данных: ${this.dbPath}`);
    
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ [Database] Ошибка подключения к базе данных:', err);
        return;
      }
      console.log('✅ [Database] Подключение к SQLite базе данных успешно');
    });

    this.createTables();
  }

  // Создание таблиц
  createTables() {
    const tables = [
      // Таблица игроков
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Таблица игр
      `CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        room_code TEXT,
        host_user_id TEXT NOT NULL,
        player_count INTEGER NOT NULL,
        game_mode TEXT DEFAULT 'classic',
        started_at DATETIME NOT NULL,
        ended_at DATETIME,
        duration_ms INTEGER,
        winner_user_id TEXT,
        game_data TEXT, -- JSON с полными данными игры
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Таблица участий игроков в играх
      `CREATE TABLE IF NOT EXISTS game_participations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        position INTEGER, -- место в игре (1 = победитель, 2 = второе место, и т.д.)
        final_cards INTEGER DEFAULT 0, -- карт осталось в конце
        penki_used BOOLEAN DEFAULT FALSE, -- использовал ли пеньки
        cards_played INTEGER DEFAULT 0, -- сколько карт сыграл
        penalty_cards INTEGER DEFAULT 0, -- сколько штрафных карт получил
        one_card_declarations INTEGER DEFAULT 0, -- сколько раз объявил "одна карта"
        turns_count INTEGER DEFAULT 0, -- количество ходов
        game_score INTEGER DEFAULT 0, -- игровые очки
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
      )`,

      // Таблица статистики игроков
      `CREATE TABLE IF NOT EXISTS player_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        
        -- Общая статистика
        total_games INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_losses INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0.0,
        
        -- Статистика по позициям
        first_places INTEGER DEFAULT 0,
        second_places INTEGER DEFAULT 0,
        third_places INTEGER DEFAULT 0,
        fourth_places INTEGER DEFAULT 0,
        
        -- Игровая статистика
        total_cards_played INTEGER DEFAULT 0,
        total_penalty_cards INTEGER DEFAULT 0,
        total_one_card_declarations INTEGER DEFAULT 0,
        total_penki_used INTEGER DEFAULT 0,
        total_turns INTEGER DEFAULT 0,
        
        -- Временная статистика
        total_game_time_ms INTEGER DEFAULT 0,
        average_game_time_ms INTEGER DEFAULT 0,
        fastest_win_ms INTEGER,
        longest_game_ms INTEGER,
        
        -- Достижения
        perfect_games INTEGER DEFAULT 0, -- игры без штрафных карт
        comeback_wins INTEGER DEFAULT 0, -- победы из отстающей позиции
        fastest_declaration_ms INTEGER, -- самое быстрое объявление "одна карта"
        
        -- Рейтинг
        rating INTEGER DEFAULT 1000,
        peak_rating INTEGER DEFAULT 1000,
        rating_games INTEGER DEFAULT 0,
        
        -- Временные метки
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Таблица достижений
      `CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        achievement_type TEXT NOT NULL,
        achievement_data TEXT, -- JSON с данными достижения
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        game_id INTEGER, -- в какой игре получено (если применимо)
        UNIQUE(user_id, achievement_type)
      )`,

      // Индексы для производительности
      `CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_games_room_id ON games(room_id)`,
      `CREATE INDEX IF NOT EXISTS idx_games_started_at ON games(started_at)`,
      `CREATE INDEX IF NOT EXISTS idx_game_participations_user_id ON game_participations(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_game_participations_game_id ON game_participations(game_id)`,
      `CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON player_stats(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_player_stats_rating ON player_stats(rating DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id)`
    ];

    tables.forEach((sql, index) => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error(`❌ [Database] Ошибка создания таблицы ${index + 1}:`, err);
        }
      });
    });

    console.log('✅ [Database] Таблицы созданы/проверены');
  }

  // Выполнить SQL запрос
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Получить одну запись
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Получить все записи
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Создать или обновить игрока
  async upsertPlayer(userData) {
    const { user_id, username, first_name, last_name, photo_url } = userData;
    
    try {
      const sql = `
        INSERT INTO players (user_id, username, first_name, last_name, photo_url, last_active)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          username = excluded.username,
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          photo_url = excluded.photo_url,
          last_active = CURRENT_TIMESTAMP
      `;
      
      await this.run(sql, [user_id, username, first_name, last_name, photo_url]);
      console.log(`👤 [Database] Игрок обновлен/создан: ${user_id}`);
    } catch (error) {
      console.error(`❌ [Database] Ошибка обновления игрока:`, error);
      throw error;
    }
  }

  // Создать запись игры
  async createGame(gameData) {
    const {
      room_id, room_code, host_user_id, player_count,
      game_mode = 'classic', started_at, game_data_json
    } = gameData;
    
    try {
      const sql = `
        INSERT INTO games (room_id, room_code, host_user_id, player_count, game_mode, started_at, game_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await this.run(sql, [
        room_id, room_code, host_user_id, player_count,
        game_mode, started_at, JSON.stringify(game_data_json)
      ]);
      
      console.log(`🎮 [Database] Игра создана: ${room_id} (ID: ${result.lastID})`);
      return result.lastID;
    } catch (error) {
      console.error(`❌ [Database] Ошибка создания игры:`, error);
      throw error;
    }
  }

  // Завершить игру
  async finishGame(gameId, gameResults) {
    const { ended_at, duration_ms, winner_user_id } = gameResults;
    
    try {
      const sql = `
        UPDATE games 
        SET ended_at = ?, duration_ms = ?, winner_user_id = ?
        WHERE id = ?
      `;
      
      await this.run(sql, [ended_at, duration_ms, winner_user_id, gameId]);
      console.log(`🏁 [Database] Игра завершена: ${gameId}`);
    } catch (error) {
      console.error(`❌ [Database] Ошибка завершения игры:`, error);
      throw error;
    }
  }

  // Добавить участие игрока в игре
  async addGameParticipation(participationData) {
    const {
      game_id, user_id, position, final_cards, penki_used,
      cards_played, penalty_cards, one_card_declarations,
      turns_count, game_score
    } = participationData;
    
    try {
      const sql = `
        INSERT INTO game_participations (
          game_id, user_id, position, final_cards, penki_used,
          cards_played, penalty_cards, one_card_declarations,
          turns_count, game_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await this.run(sql, [
        game_id, user_id, position, final_cards, penki_used,
        cards_played, penalty_cards, one_card_declarations,
        turns_count, game_score
      ]);
      
      console.log(`📊 [Database] Участие игрока добавлено: ${user_id} в игре ${game_id}`);
    } catch (error) {
      console.error(`❌ [Database] Ошибка добавления участия:`, error);
      throw error;
    }
  }

  // Получить статистику игрока
  async getPlayerStats(userId) {
    try {
      let stats = await this.get(
        'SELECT * FROM player_stats WHERE user_id = ?', 
        [userId]
      );
      
      // Если статистика не найдена, создаем базовую
      if (!stats) {
        await this.run(
          'INSERT INTO player_stats (user_id) VALUES (?)',
          [userId]
        );
        
        stats = await this.get(
          'SELECT * FROM player_stats WHERE user_id = ?', 
          [userId]
        );
      }
      
      return stats;
    } catch (error) {
      console.error(`❌ [Database] Ошибка получения статистики:`, error);
      throw error;
    }
  }

  // Обновить статистику игрока
  async updatePlayerStats(userId, statsUpdate) {
    try {
      // Получаем текущую статистику
      const currentStats = await this.getPlayerStats(userId);
      
      // Вычисляем новые значения
      const newStats = { ...currentStats, ...statsUpdate };
      
      // Пересчитываем win_rate
      if (newStats.total_games > 0) {
        newStats.win_rate = newStats.total_wins / newStats.total_games;
      }
      
      // Пересчитываем average_game_time_ms
      if (newStats.total_games > 0) {
        newStats.average_game_time_ms = Math.round(newStats.total_game_time_ms / newStats.total_games);
      }
      
      // Обновляем peak_rating
      if (newStats.rating > newStats.peak_rating) {
        newStats.peak_rating = newStats.rating;
      }
      
      const sql = `
        UPDATE player_stats SET
          total_games = ?, total_wins = ?, total_losses = ?, win_rate = ?,
          first_places = ?, second_places = ?, third_places = ?, fourth_places = ?,
          total_cards_played = ?, total_penalty_cards = ?, total_one_card_declarations = ?,
          total_penki_used = ?, total_turns = ?, total_game_time_ms = ?, average_game_time_ms = ?,
          fastest_win_ms = ?, longest_game_ms = ?, perfect_games = ?, comeback_wins = ?,
          fastest_declaration_ms = ?, rating = ?, peak_rating = ?, rating_games = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      
      await this.run(sql, [
        newStats.total_games, newStats.total_wins, newStats.total_losses, newStats.win_rate,
        newStats.first_places, newStats.second_places, newStats.third_places, newStats.fourth_places,
        newStats.total_cards_played, newStats.total_penalty_cards, newStats.total_one_card_declarations,
        newStats.total_penki_used, newStats.total_turns, newStats.total_game_time_ms, newStats.average_game_time_ms,
        newStats.fastest_win_ms, newStats.longest_game_ms, newStats.perfect_games, newStats.comeback_wins,
        newStats.fastest_declaration_ms, newStats.rating, newStats.peak_rating, newStats.rating_games,
        userId
      ]);
      
      console.log(`📈 [Database] Статистика игрока обновлена: ${userId}`);
    } catch (error) {
      console.error(`❌ [Database] Ошибка обновления статистики:`, error);
      throw error;
    }
  }

  // Получить топ игроков
  async getLeaderboard(limit = 50, orderBy = 'rating') {
    try {
      const validOrderColumns = ['rating', 'total_wins', 'win_rate', 'total_games'];
      const orderColumn = validOrderColumns.includes(orderBy) ? orderBy : 'rating';
      
      const sql = `
        SELECT 
          ps.*,
          p.username,
          p.first_name,
          p.last_name,
          p.photo_url
        FROM player_stats ps
        LEFT JOIN players p ON ps.user_id = p.user_id
        WHERE ps.total_games >= 5
        ORDER BY ps.${orderColumn} DESC
        LIMIT ?
      `;
      
      const leaderboard = await this.all(sql, [limit]);
      return leaderboard;
    } catch (error) {
      console.error(`❌ [Database] Ошибка получения рейтинга:`, error);
      throw error;
    }
  }

  // Получить историю игр игрока
  async getGameHistory(userId, limit = 10, offset = 0) {
    try {
      const sql = `
        SELECT 
          g.*,
          gp.position,
          gp.final_cards,
          gp.penki_used,
          gp.cards_played,
          gp.penalty_cards,
          gp.one_card_declarations,
          gp.turns_count,
          gp.game_score
        FROM games g
        JOIN game_participations gp ON g.id = gp.game_id
        WHERE gp.user_id = ?
        ORDER BY g.started_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const history = await this.all(sql, [userId, limit, offset]);
      return history;
    } catch (error) {
      console.error(`❌ [Database] Ошибка получения истории:`, error);
      throw error;
    }
  }

  // Закрыть соединение
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('❌ [Database] Ошибка закрытия базы данных:', err);
          reject(err);
        } else {
          console.log('✅ [Database] Соединение с базой данных закрыто');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;
