class PlayerStatsManager {
  constructor(database) {
    this.db = database;
  }

  // Сохранить результаты игры и обновить статистику всех игроков
  async saveGameResults(roomId, gameResults) {
    try {
      console.log(`📊 [PlayerStats] Сохраняем результаты игры ${roomId}:`, gameResults);
      
      const {
        players = [],
        winner,
        gameSettings = {},
        gameDuration,
        gameData = {}
      } = gameResults;

      // Создаем запись игры
      const gameId = await this.db.createGame({
        room_id: roomId,
        room_code: gameSettings.roomCode || null,
        host_user_id: gameSettings.hostUserId || players[0]?.userId,
        player_count: players.length,
        game_mode: gameSettings.gameMode || 'classic',
        started_at: new Date(gameSettings.startTime || Date.now()),
        game_data_json: gameData
      });

      // Завершаем игру
      await this.db.finishGame(gameId, {
        ended_at: new Date(),
        duration_ms: gameDuration || 0,
        winner_user_id: winner?.userId || null
      });

      // Обрабатываем результаты каждого игрока
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        await this.processPlayerGameResult(gameId, player, i + 1, gameResults);
      }

      console.log(`✅ [PlayerStats] Результаты игры ${roomId} успешно сохранены`);
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка сохранения результатов игры:`, error);
      throw error;
    }
  }

  // Обработать результат игры для конкретного игрока
  async processPlayerGameResult(gameId, playerResult, position, gameResults) {
    try {
      const { userId } = playerResult;
      
      // Убеждаемся что игрок существует в базе
      await this.db.upsertPlayer({
        user_id: userId,
        username: playerResult.username || playerResult.name,
        first_name: playerResult.firstName,
        last_name: playerResult.lastName,
        photo_url: playerResult.photoUrl
      });

      // Вычисляем статистику игрока из результатов
      const playerStats = this.calculatePlayerStats(playerResult, position, gameResults);

      // Добавляем участие игрока в игре
      await this.db.addGameParticipation({
        game_id: gameId,
        user_id: userId,
        position: position,
        final_cards: playerStats.finalCards,
        penki_used: playerStats.penkiUsed,
        cards_played: playerStats.cardsPlayed,
        penalty_cards: playerStats.penaltyCards,
        one_card_declarations: playerStats.oneCardDeclarations,
        turns_count: playerStats.turnsCount,
        game_score: playerStats.gameScore
      });

      // Обновляем общую статистику игрока
      await this.updatePlayerOverallStats(userId, playerStats, gameResults);

      console.log(`📈 [PlayerStats] Статистика игрока ${userId} обновлена`);
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка обработки результата игрока:`, error);
      throw error;
    }
  }

  // Вычислить статистику игрока из результатов игры
  calculatePlayerStats(playerResult, position, gameResults) {
    const {
      cards = [],
      penki = [],
      gameStats = {},
      isBot = false
    } = playerResult;

    const finalCards = cards.length + penki.length;
    const isWinner = position === 1;
    const penkiUsed = gameStats.penkiActivated || false;
    
    // Извлекаем статистику из игровых данных
    const cardsPlayed = gameStats.cardsPlayed || 0;
    const penaltyCards = gameStats.penaltyCardsReceived || 0;
    const oneCardDeclarations = gameStats.oneCardDeclarations || 0;
    const turnsCount = gameStats.turnsCount || 0;

    // Вычисляем игровые очки
    let gameScore = 0;
    if (isWinner) {
      gameScore += 100; // Базовые очки за победу
      gameScore += Math.max(0, 50 - finalCards * 10); // Бонус за меньшее количество карт
    } else {
      gameScore = Math.max(10, 80 - finalCards * 5 - penaltyCards * 2); // Очки за участие
    }

    // Бонусы и штрафы
    if (penkiUsed) gameScore += 20; // Бонус за использование пеньков
    if (penaltyCards > 0) gameScore -= penaltyCards * 3; // Штраф за штрафные карты
    gameScore += oneCardDeclarations * 5; // Бонус за правильные объявления

    return {
      finalCards,
      isWinner,
      penkiUsed,
      cardsPlayed,
      penaltyCards,
      oneCardDeclarations,
      turnsCount,
      gameScore: Math.max(0, gameScore), // Минимум 0 очков
      isBot,
      gameDuration: gameResults.gameDuration || 0
    };
  }

  // Обновить общую статистику игрока
  async updatePlayerOverallStats(userId, gameStats, gameResults) {
    try {
      // Получаем текущую статистику
      const currentStats = await this.db.getPlayerStats(userId);
      
      // Вычисляем изменения рейтинга
      const ratingChange = this.calculateRatingChange(
        currentStats.rating, 
        gameStats, 
        gameResults.players.length
      );

      // Подготавливаем обновления статистики
      const statsUpdate = {
        // Общие счетчики
        total_games: currentStats.total_games + 1,
        total_wins: currentStats.total_wins + (gameStats.isWinner ? 1 : 0),
        total_losses: currentStats.total_losses + (gameStats.isWinner ? 0 : 1),
        
        // Позиции
        first_places: currentStats.first_places + (gameStats.position === 1 ? 1 : 0),
        second_places: currentStats.second_places + (gameStats.position === 2 ? 1 : 0),
        third_places: currentStats.third_places + (gameStats.position === 3 ? 1 : 0),
        fourth_places: currentStats.fourth_places + (gameStats.position === 4 ? 1 : 0),
        
        // Игровая статистика
        total_cards_played: currentStats.total_cards_played + gameStats.cardsPlayed,
        total_penalty_cards: currentStats.total_penalty_cards + gameStats.penaltyCards,
        total_one_card_declarations: currentStats.total_one_card_declarations + gameStats.oneCardDeclarations,
        total_penki_used: currentStats.total_penki_used + (gameStats.penkiUsed ? 1 : 0),
        total_turns: currentStats.total_turns + gameStats.turnsCount,
        
        // Временная статистика
        total_game_time_ms: currentStats.total_game_time_ms + gameStats.gameDuration,
        
        // Рекорды
        fastest_win_ms: gameStats.isWinner ? 
          Math.min(currentStats.fastest_win_ms || Infinity, gameStats.gameDuration) : 
          currentStats.fastest_win_ms,
        longest_game_ms: Math.max(currentStats.longest_game_ms || 0, gameStats.gameDuration),
        
        // Достижения
        perfect_games: currentStats.perfect_games + (gameStats.penaltyCards === 0 ? 1 : 0),
        
        // Рейтинг
        rating: Math.max(100, currentStats.rating + ratingChange), // Минимум 100 рейтинга
        rating_games: currentStats.rating_games + 1
      };

      // Обновляем статистику в базе
      await this.db.updatePlayerStats(userId, statsUpdate);
      
      // Проверяем достижения
      await this.checkAchievements(userId, gameStats, statsUpdate);
      
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка обновления общей статистики:`, error);
      throw error;
    }
  }

  // Вычислить изменение рейтинга (упрощенная система ELO)
  calculateRatingChange(currentRating, gameStats, playerCount) {
    const baseChange = 25; // Базовое изменение рейтинга
    const K = 32; // K-фактор для ELO
    
    // Ожидаемая позиция основана на рейтинге (упрощение)
    const expectedPosition = 2.5; // Средняя позиция для 4 игроков
    const actualPosition = gameStats.position || playerCount;
    
    // Вычисляем изменение на основе позиции
    let ratingChange = 0;
    
    if (gameStats.isWinner) {
      // Победа
      ratingChange = baseChange + (gameStats.gameScore / 10);
    } else {
      // Поражение - рейтинг уменьшается
      const positionPenalty = (actualPosition - 1) * 5;
      ratingChange = -Math.min(baseChange / 2, positionPenalty);
    }
    
    // Модификаторы
    if (gameStats.penkiUsed) ratingChange += 5; // Бонус за использование пеньков
    if (gameStats.penaltyCards > 3) ratingChange -= 10; // Штраф за много штрафных карт
    
    // Защита от слишком больших изменений
    ratingChange = Math.max(-50, Math.min(50, ratingChange));
    
    return Math.round(ratingChange);
  }

  // Проверить достижения игрока
  async checkAchievements(userId, gameStats, overallStats) {
    const achievements = [];
    
    try {
      // Достижение: Первая победа
      if (overallStats.total_wins === 1) {
        achievements.push({
          type: 'first_win',
          name: 'Первая победа!',
          description: 'Выиграйте свою первую игру в P.I.D.R.',
          data: { gameStats }
        });
      }
      
      // Достижение: 10 побед
      if (overallStats.total_wins === 10) {
        achievements.push({
          type: 'ten_wins',
          name: 'Ветеран',
          description: 'Выиграйте 10 игр',
          data: { totalWins: overallStats.total_wins }
        });
      }
      
      // Достижение: Идеальная игра (без штрафных карт)
      if (gameStats.penaltyCards === 0 && gameStats.isWinner) {
        achievements.push({
          type: 'perfect_game',
          name: 'Идеальная игра',
          description: 'Выиграйте игру без получения штрафных карт',
          data: { gameStats }
        });
      }
      
      // Достижение: Мастер пеньков
      if (gameStats.penkiUsed && gameStats.isWinner) {
        achievements.push({
          type: 'penki_master',
          name: 'Мастер пеньков',
          description: 'Выиграйте игру используя пеньки',
          data: { gameStats }
        });
      }
      
      // Достижение: Высокий рейтинг
      if (overallStats.rating >= 1500 && currentStats.rating < 1500) {
        achievements.push({
          type: 'high_rating',
          name: 'Профи',
          description: 'Достигните рейтинга 1500',
          data: { rating: overallStats.rating }
        });
      }
      
      // Сохраняем достижения
      for (const achievement of achievements) {
        await this.saveAchievement(userId, achievement);
      }
      
      if (achievements.length > 0) {
        console.log(`🏆 [PlayerStats] Получено ${achievements.length} достижений для ${userId}`);
      }
      
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка проверки достижений:`, error);
    }
  }

  // Сохранить достижение
  async saveAchievement(userId, achievement) {
    try {
      await this.db.run(
        `INSERT OR IGNORE INTO achievements (user_id, achievement_type, achievement_data) 
         VALUES (?, ?, ?)`,
        [userId, achievement.type, JSON.stringify(achievement)]
      );
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка сохранения достижения:`, error);
    }
  }

  // Получить статистику игрока
  async getPlayerStats(userId) {
    try {
      const stats = await this.db.getPlayerStats(userId);
      
      // Получаем достижения игрока
      const achievements = await this.db.all(
        'SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC',
        [userId]
      );
      
      return {
        ...stats,
        achievements: achievements.map(ach => ({
          ...ach,
          achievement_data: JSON.parse(ach.achievement_data || '{}')
        }))
      };
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка получения статистики:`, error);
      throw error;
    }
  }

  // Получить историю игр
  async getGameHistory(userId, limit = 10, offset = 0) {
    try {
      return await this.db.getGameHistory(userId, limit, offset);
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка получения истории:`, error);
      throw error;
    }
  }

  // Получить таблицу лидеров
  async getLeaderboard(limit = 50, orderBy = 'rating') {
    try {
      return await this.db.getLeaderboard(limit, orderBy);
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка получения рейтинга:`, error);
      throw error;
    }
  }

  // Получить сравнительную статистику игроков
  async getPlayersComparison(userIds) {
    try {
      const stats = [];
      
      for (const userId of userIds) {
        const playerStats = await this.getPlayerStats(userId);
        stats.push(playerStats);
      }
      
      return stats;
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка сравнения игроков:`, error);
      throw error;
    }
  }

  // Получить аналитику по периоду
  async getPeriodAnalytics(userId, periodDays = 30) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as games_played,
          SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) as wins,
          AVG(game_score) as avg_score,
          SUM(penalty_cards) as total_penalties,
          AVG(g.duration_ms) as avg_duration
        FROM game_participations gp
        JOIN games g ON gp.game_id = g.id
        WHERE gp.user_id = ? 
          AND g.started_at >= datetime('now', '-${periodDays} days')
      `;
      
      const analytics = await this.db.get(sql, [userId]);
      return analytics;
    } catch (error) {
      console.error(`❌ [PlayerStats] Ошибка получения аналитики:`, error);
      throw error;
    }
  }
}

module.exports = PlayerStatsManager;
