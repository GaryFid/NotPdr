import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Card {
  id: string
  type: 'normal' | 'special' | 'pidr'
  title: string
  description: string
  image?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  effect?: string
  rank?: number // Ранг карты (2-14)
  suit?: string // Масть карты
  open?: boolean // Открыта ли карта
}

export interface Player {
  id: string
  name: string
  avatar?: string
  score: number
  cards: Card[]
  isCurrentPlayer: boolean
}

export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  totalScore: number
  bestScore: number
  cardsCollected: number
  achievements: string[]
}

export interface GameSettings {
  soundEnabled: boolean
  animationsEnabled: boolean
  hapticEnabled: boolean
  autoPlay: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

interface GameState {
  // Игровое состояние
  isGameActive: boolean
  gameMode: 'single' | 'multiplayer'
  currentRound: number
  maxRounds: number
  players: Player[]
  currentPlayerId: string | null
  deck: Card[]
  playedCards: Card[]
  lastPlayedCard: Card | null
  
  // Состояние для стадий игры P.I.D.R
  gameStage: 1 | 2 | 3
  availableTargets: number[] // Индексы игроков, на которых можно положить карту
  mustDrawFromDeck: boolean // Должен ли игрок взять карту из колоды
  canPlaceOnSelf: boolean // Может ли игрок положить карту себе
  
  // Статистика и настройки
  stats: GameStats
  settings: GameSettings
  
  // UI состояние
  selectedCard: Card | null
  showCardDetails: boolean
  isLoading: boolean
  notification: {
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    visible: boolean
  } | null
  
  // Действия игры
  startGame: (mode: 'single' | 'multiplayer', playersCount?: number) => void
  endGame: () => void
  playCard: (cardId: string) => void
  drawCard: () => void
  nextTurn: () => void
  resetGame: () => void
  
  // Методы для P.I.D.R игры
  getCardRank: (imageName: string) => number
  findAvailableTargets: (currentPlayerId: string) => number[]
  canMakeMove: (currentPlayerId: string) => boolean
  makeMove: (targetPlayerId: string) => void
  drawCardFromDeck: () => boolean // возвращает true если карта взята
  placeCardOnSelf: () => void
  checkStage1End: () => void
  processPlayerTurn: (playerId: string) => void
  
  // Управление картами
  selectCard: (card: Card | null) => void
  addCardToDeck: (card: Card) => void
  removeCardFromDeck: (cardId: string) => void
  
  // Игроки
  addPlayer: (name: string) => void
  removePlayer: (playerId: string) => void
  updatePlayerScore: (playerId: string, score: number) => void
  
  // Настройки
  updateSettings: (settings: Partial<GameSettings>) => void
  
  // Статистика
  updateStats: (stats: Partial<GameStats>) => void
  addAchievement: (achievementId: string) => void
  
  // UI
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
  hideNotification: () => void
  setLoading: (loading: boolean) => void
}

// Базовые карты для игры P.I.D.R.
const DEFAULT_CARDS: Card[] = [
  {
    id: '1',
    type: 'normal',
    title: 'Обычная карта',
    description: 'Простая карта без особых эффектов',
    rarity: 'common'
  },
  {
    id: '2',
    type: 'special',
    title: 'Специальная карта',
    description: 'Карта с особым эффектом',
    rarity: 'rare',
    effect: 'draw_extra'
  },
  {
    id: '3',
    type: 'pidr',
    title: 'P.I.D.R.',
    description: 'Легендарная карта P.I.D.R.!',
    rarity: 'legendary',
    effect: 'pidr_power'
  }
]

// Создание Zustand стора с персистентностью
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      isGameActive: false,
      gameMode: 'single',
      currentRound: 0,
      maxRounds: 10,
      players: [],
      currentPlayerId: null,
      deck: [...DEFAULT_CARDS],
      playedCards: [],
      lastPlayedCard: null,
      
      // Состояние для стадий игры P.I.D.R
      gameStage: 1,
      availableTargets: [],
      mustDrawFromDeck: false,
      canPlaceOnSelf: false,
      
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalScore: 0,
        bestScore: 0,
        cardsCollected: 0,
        achievements: []
      },
      
      settings: {
        soundEnabled: true,
        animationsEnabled: true,
        hapticEnabled: true,
        autoPlay: false,
        difficulty: 'medium'
      },
      
      selectedCard: null,
      showCardDetails: false,
      isLoading: false,
      notification: null,
      
      // Игровые действия
      startGame: (mode, playersCount = 2) => {
        // Создаем полную стандартную колоду карт (52 карты)
        const standardDeck = [
          // Двойки (2)
          '2_of_clubs.png','2_of_diamonds.png','2_of_hearts.png','2_of_spades.png',
          // Тройки (3) 
          '3_of_clubs.png','3_of_diamonds.png','3_of_hearts.png','3_of_spades.png',
          // Четверки (4)
          '4_of_clubs.png','4_of_diamonds.png','4_of_hearts.png','4_of_spades.png',
          // Пятерки (5)
          '5_of_clubs.png','5_of_diamonds.png','5_of_hearts.png','5_of_spades.png',
          // Шестерки (6)
          '6_of_clubs.png','6_of_diamonds.png','6_of_hearts.png','6_of_spades.png',
          // Семерки (7)
          '7_of_clubs.png','7_of_diamonds.png','7_of_hearts.png','7_of_spades.png',
          // Восьмерки (8)
          '8_of_clubs.png','8_of_diamonds.png','8_of_hearts.png','8_of_spades.png',
          // Девятки (9)
          '9_of_clubs.png','9_of_diamonds.png','9_of_hearts.png','9_of_spades.png',
          // Десятки (10)
          '10_of_clubs.png','10_of_diamonds.png','10_of_hearts.png','10_of_spades.png',
          // Валеты (11)
          'jack_of_clubs.png','jack_of_diamonds.png','jack_of_hearts.png','jack_of_spades.png',
          // Дамы (12)
          'queen_of_clubs.png','queen_of_diamonds.png','queen_of_hearts.png','queen_of_spades.png',
          // Короли (13)
          'king_of_clubs.png','king_of_diamonds.png','king_of_hearts.png','king_of_spades.png',
          // Тузы (14)
          'ace_of_clubs.png','ace_of_diamonds.png','ace_of_hearts.png','ace_of_spades.png'
        ];
        
        // Проверяем что у нас ровно 52 карты
        console.log('🃏 Размер колоды:', standardDeck.length, 'карт');
        
        // Перемешиваем колоду
        const shuffledImages = [...standardDeck].sort(() => Math.random() - 0.5);
        
        const players: Player[] = []
        const cardsPerPlayer = 3;
        
        // Создаем игроков и раздаем им карты
        for (let i = 0; i < playersCount; i++) {
          const playerCards: Card[] = [];
          
          // Раздаем 3 карты каждому игроку
          for (let j = 0; j < cardsPerPlayer; j++) {
            const cardIndex = i * cardsPerPlayer + j;
            const imageName = shuffledImages[cardIndex];
            
            playerCards.push({
              id: `card_${i}_${j}`,
              type: 'normal',
              title: `Карта ${j + 1}`,
              description: '',
              image: imageName,
              rarity: 'common',
              rank: get().getCardRank(imageName),
              open: j === cardsPerPlayer - 1, // Только верхняя карта открыта
            });
          }
          
          players.push({
            id: `player_${i + 1}`,
            name: i === 0 ? 'Вы' : `Игрок ${i + 1}`,
            score: 0,
            cards: playerCards,
            isCurrentPlayer: i === 0
          });
        }
        
        // Оставшиеся карты в колоде
        const remainingCards: Card[] = shuffledImages.slice(playersCount * cardsPerPlayer).map((imageName, index) => ({
          id: `deck_card_${index}`,
          type: 'normal',
          title: `Карта колоды`,
          description: '',
          image: imageName,
          rarity: 'common',
          rank: get().getCardRank(imageName),
          open: false,
        }));
        
        // Определяем первого игрока по старшей открытой карте
        let firstPlayerIndex = 0;
        let maxRank = 0;
        players.forEach((player, index) => {
          const topCard = player.cards[player.cards.length - 1];
          if (topCard && topCard.rank && topCard.rank > maxRank) {
            maxRank = topCard.rank;
            firstPlayerIndex = index;
          }
        });
        
        // Обновляем кто ходит первым
        players.forEach((player, index) => {
          player.isCurrentPlayer = index === firstPlayerIndex;
        });
        
        set({
          isGameActive: true,
          gameMode: mode,
          currentRound: 1,
          players,
          currentPlayerId: players[firstPlayerIndex].id,
          deck: remainingCards,
          playedCards: [],
          lastPlayedCard: null,
          gameStage: 1,
          availableTargets: [],
          mustDrawFromDeck: false,
          canPlaceOnSelf: false
        });
        
        get().showNotification(`Игра начата! Ходит первым: ${players[firstPlayerIndex].name}`, 'success');
        
        // Для первого хода просто проверяем доступные цели, без автоматического взятия карт
        setTimeout(() => {
          const targets = get().findAvailableTargets(players[firstPlayerIndex].id);
          if (targets.length > 0) {
            set({ availableTargets: targets });
          } else {
            // Если нет доступных ходов - показываем кнопку "положить себе"
            set({ canPlaceOnSelf: true });
          }
        }, 1000);
      },
      
      endGame: () => {
        const { players, stats } = get()
        const winner = players.reduce((prev, current) => 
          prev.score > current.score ? prev : current
        )
        
        const playerWon = winner.id === 'player_1'
        
        set({
          isGameActive: false,
          stats: {
            ...stats,
            gamesPlayed: stats.gamesPlayed + 1,
            gamesWon: playerWon ? stats.gamesWon + 1 : stats.gamesWon,
            totalScore: stats.totalScore + winner.score,
            bestScore: Math.max(stats.bestScore, winner.score)
          }
        })
        
        get().showNotification(
          playerWon ? 'Вы выиграли!' : 'Игра окончена!', 
          playerWon ? 'success' : 'info'
        )
      },
      
      playCard: (cardId) => {
        const { players, currentPlayerId, playedCards } = get()
        const currentPlayer = players.find(p => p.id === currentPlayerId)
        
        if (!currentPlayer) return
        
        const cardIndex = currentPlayer.cards.findIndex(c => c.id === cardId)
        if (cardIndex === -1) return
        
        const playedCard = currentPlayer.cards[cardIndex]
        
        // Удаляем карту из руки игрока
        currentPlayer.cards.splice(cardIndex, 1)
        
        // Добавляем карту в сыгранные
        const newPlayedCards = [...playedCards, playedCard]
        
        // Обновляем счет игрока
        let scoreBonus = 10
        if (playedCard.rarity === 'rare') scoreBonus = 20
        if (playedCard.rarity === 'epic') scoreBonus = 50
        if (playedCard.rarity === 'legendary') scoreBonus = 100
        
        currentPlayer.score += scoreBonus
        
        set({
          players: [...players],
          playedCards: newPlayedCards,
          lastPlayedCard: playedCard
        })
        
        // Применяем эффект карты
        if (playedCard.effect === 'pidr_power') {
          get().showNotification('P.I.D.R. АКТИВИРОВАН!', 'success')
          currentPlayer.score += 50 // Бонус за P.I.D.R.
        }
        
        // Переходим к следующему ходу
        setTimeout(() => get().nextTurn(), 1000)
      },
      
      drawCard: () => {
        const { players, currentPlayerId, deck } = get()
        const currentPlayer = players.find(p => p.id === currentPlayerId)
        
        if (!currentPlayer || deck.length === 0) return
        
        const drawnCard = deck[0]
        currentPlayer.cards.push(drawnCard)
        
        set({
          players: [...players],
          deck: deck.slice(1)
        })
        
        get().showNotification('Карта взята!', 'info')
      },
      
      nextTurn: () => {
        const { players, currentPlayerId, currentRound, maxRounds, gameStage } = get()
        
        // Находим следующего игрока
        const currentIndex = players.findIndex(p => p.id === currentPlayerId)
        const nextIndex = (currentIndex + 1) % players.length
        const nextPlayerId = players[nextIndex].id
        const nextPlayer = players[nextIndex]
        
        // Обновляем текущего игрока
        players.forEach(p => p.isCurrentPlayer = p.id === nextPlayerId)
        
        let newRound = currentRound
        
        // Если круг завершен (вернулись к первому игроку)
        if (nextIndex === 0) {
          newRound = currentRound + 1
        }
        
        set({
          players: [...players],
          currentPlayerId: nextPlayerId,
          currentRound: newRound,
          availableTargets: [], // Сбрасываем цели
          canPlaceOnSelf: false, // Сбрасываем флаг
        })
        
        get().showNotification(`Ход переходит к ${nextPlayer.name}`, 'info')
        
        // Для 1-й стадии запускаем обработку хода
        if (gameStage === 1) {
          setTimeout(() => get().processPlayerTurn(nextPlayerId), 1000)
        }
        
        // Проверяем окончание игры (только для стадий выше 1)
        if (gameStage > 1 && newRound > maxRounds) {
          get().endGame()
        }
      },
      
      resetGame: () => {
        set({
          isGameActive: false,
          currentRound: 0,
          players: [],
          currentPlayerId: null,
          deck: [...DEFAULT_CARDS],
          playedCards: [],
          lastPlayedCard: null,
          selectedCard: null
        })
      },
      
      // Управление картами
      selectCard: (card) => set({ selectedCard: card }),
      
      addCardToDeck: (card) => {
        const { deck } = get()
        set({ deck: [...deck, card] })
      },
      
      removeCardFromDeck: (cardId) => {
        const { deck } = get()
        set({ deck: deck.filter(c => c.id !== cardId) })
      },
      
      // Управление игроками
      addPlayer: (name) => {
        const { players } = get()
        const newPlayer: Player = {
          id: `player_${Date.now()}`,
          name,
          score: 0,
          cards: [],
          isCurrentPlayer: false
        }
        set({ players: [...players, newPlayer] })
      },
      
      removePlayer: (playerId) => {
        const { players } = get()
        set({ players: players.filter(p => p.id !== playerId) })
      },
      
      updatePlayerScore: (playerId, score) => {
        const { players } = get()
        const player = players.find(p => p.id === playerId)
        if (player) {
          player.score = score
          set({ players: [...players] })
        }
      },
      
      // Настройки
      updateSettings: (newSettings) => {
        const { settings } = get()
        set({ settings: { ...settings, ...newSettings } })
      },
      
      // Статистика
      updateStats: (newStats) => {
        const { stats } = get()
        set({ stats: { ...stats, ...newStats } })
      },
      
      addAchievement: (achievementId) => {
        const { stats } = get()
        if (!stats.achievements.includes(achievementId)) {
          set({
            stats: {
              ...stats,
              achievements: [...stats.achievements, achievementId]
            }
          })
          get().showNotification('Новое достижение!', 'success')
        }
      },
      
      // UI
      showNotification: (message, type) => {
        set({
          notification: {
            message,
            type,
            visible: true
          }
        })
        
        // Автоматически скрываем через 3 секунды
        setTimeout(() => get().hideNotification(), 3000)
      },
      
      hideNotification: () => {
        set({ notification: null })
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      // ===== МЕТОДЫ ДЛЯ P.I.D.R ИГРЫ =====
      
      // Определение ранга карты по изображению
      getCardRank: (imageName: string) => {
        const name = imageName.replace('.png', '').replace('/img/cards/', '');
        if (name.startsWith('ace')) return 14;
        if (name.startsWith('king')) return 13;
        if (name.startsWith('queen')) return 12;
        if (name.startsWith('jack')) return 11;
        const match = name.match(/(\d+)_of/);
        return match ? parseInt(match[1], 10) : 0;
      },
      
      // Поиск доступных целей для текущего хода
      findAvailableTargets: (currentPlayerId: string) => {
        const { players } = get();
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        if (!currentPlayer || currentPlayer.cards.length === 0) return [];
        
        // Берем верхнюю открытую карту игрока
        const topCard = currentPlayer.cards[currentPlayer.cards.length - 1];
        if (!topCard || !topCard.open) return [];
        
        const currentRank = get().getCardRank(topCard.image || '');
        
        // Определяем целевой ранг с учетом специального правила Туза
        // ПРАВИЛО: Только двойка (2) может перекрыть Туз (14)!
        let targetRank: number;
        if (currentRank === 2) {
          // Двойка может ложиться на Туз (14) - ИСКЛЮЧЕНИЕ!
          targetRank = 14;
        } else {
          // Обычное правило: на 1 ранг ниже (К→Д, Д→В, В→10, и т.д.)
          targetRank = currentRank - 1;
        }
        
        const targets: number[] = [];
        players.forEach((player, index) => {
          if (player.id === currentPlayerId) return; // Не можем положить на себя (пока)
          
          // Проверяем верхнюю карту игрока
          const playerTopCard = player.cards[player.cards.length - 1];
          if (playerTopCard && playerTopCard.open) {
            const playerRank = get().getCardRank(playerTopCard.image || '');
            if (playerRank === targetRank) {
              targets.push(index);
            }
          }
        });
        
        return targets;
      },
      
      // Проверка возможности сделать ход
      canMakeMove: (currentPlayerId: string) => {
        const targets = get().findAvailableTargets(currentPlayerId);
        return targets.length > 0;
      },
      
      // Выполнение хода
      makeMove: (targetPlayerId: string) => {
        const { players, currentPlayerId } = get();
        if (!currentPlayerId) return;
        
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        const targetPlayer = players.find(p => p.id === targetPlayerId);
        
        if (!currentPlayer || !targetPlayer || currentPlayer.cards.length === 0) return;
        
        // Перемещаем верхнюю карту с текущего игрока на целевого
        const cardToMove = currentPlayer.cards.pop();
        if (cardToMove) {
          targetPlayer.cards.push(cardToMove);
          
          set({ 
            players: [...players],
            availableTargets: [] // Убираем подсветку после хода
          });
          get().showNotification(`Карта переложена на ${targetPlayer.name}!`, 'success');
          
          // После хода ОБЯЗАТЕЛЬНО берем карту из колоды
          setTimeout(() => {
            const cardDrawn = get().drawCardFromDeck();
            if (!cardDrawn) {
              // Колода пуста - проверяем окончание стадии
              get().checkStage1End();
              return;
            }
            
            // После взятия карты проверяем новую верхнюю карту
            setTimeout(() => {
              if (get().canMakeMove(currentPlayerId)) {
                // Может ходить - показываем новые цели
                const targets = get().findAvailableTargets(currentPlayerId);
                set({ availableTargets: targets });
              } else {
                // Не может ходить - может положить себе
                set({ canPlaceOnSelf: true });
              }
            }, 500);
          }, 500);
        }
      },
      
      // Взятие карты из колоды
      drawCardFromDeck: () => {
        const { deck, players, currentPlayerId } = get();
        if (deck.length === 0 || !currentPlayerId) return false;
        
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        if (!currentPlayer) return false;
        
        const drawnCard = deck[0];
        // Добавляем ранг к карте
        drawnCard.rank = get().getCardRank(drawnCard.image || '');
        drawnCard.open = true;
        
        currentPlayer.cards.push(drawnCard);
        
        set({ 
          deck: deck.slice(1),
          players: [...players]
        });
        
        get().showNotification(`${currentPlayer.name} взял карту из колоды (осталось: ${deck.length - 1})`, 'info');
        return true;
      },
      
      // Размещение карты на себя
      placeCardOnSelf: () => {
        const { players, currentPlayerId } = get();
        if (!currentPlayerId) return;
        
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        if (!currentPlayer || currentPlayer.cards.length === 0) return;
        
        // Карта уже лежит на игроке, просто завершаем ход
        set({ 
          canPlaceOnSelf: false,
          mustDrawFromDeck: false,
          availableTargets: [] // Убираем подсветку
        });
        
        get().showNotification(`${currentPlayer.name} оставил карту у себя и пропускает ход`, 'warning');
        
        // Проверяем окончание стадии перед передачей хода
        get().checkStage1End();
        
        // Переходим к следующему игроку
        setTimeout(() => get().nextTurn(), 1000);
      },
      
      // Проверка окончания 1-й стадии
      checkStage1End: () => {
        const { deck, gameStage } = get();
        if (gameStage === 1 && deck.length === 0) {
          set({ 
            gameStage: 2,
            availableTargets: [],
            canPlaceOnSelf: false,
            mustDrawFromDeck: false
          });
          
          // Заглушка для 2-й стадии
          setTimeout(() => {
            get().showNotification('🎉 Ты реально до 2-ой стадии дошел?! 🎉', 'success');
            
            setTimeout(() => {
              get().showNotification('😎 Пока что это все... Скоро будет продолжение!', 'info');
            }, 2000);
          }, 1000);
        }
      },
      
      // Обработка хода игрока (основная логика 1-й стадии)
      processPlayerTurn: (playerId: string) => {
        const { gameStage, deck } = get();
        if (gameStage !== 1) return;
        
        const analyzeAndMove = () => {
          // 1. Анализируем верхнюю открытую карту
          if (get().canMakeMove(playerId)) {
            // Если может положить - показываем доступные цели и ждем действия игрока
            const targets = get().findAvailableTargets(playerId);
            set({ 
              availableTargets: targets,
              canPlaceOnSelf: false,
              mustDrawFromDeck: false 
            });
            return true; // Ждем действия игрока
          }
          return false; // Не может ходить
        };
        
        // Сначала анализируем текущую верхнюю карту
        if (analyzeAndMove()) {
          return; // Ждем хода игрока
        }
        
        // Если не может ходить - берет карту из колоды
        const cardDrawn = get().drawCardFromDeck();
        if (!cardDrawn) {
          // Колода пуста
          get().checkStage1End();
          if (deck.length === 0) {
            get().nextTurn(); // Переходим к следующему игроку только если стадия не закончилась
          }
          return;
        }
        
        // После взятия карты анализируем НОВУЮ верхнюю карту
        setTimeout(() => {
          if (analyzeAndMove()) {
            // Может ходить новой картой - продолжает ход
            return;
          } else {
            // Не может ходить новой картой - кладет себе и заканчивает ход
            set({ 
              canPlaceOnSelf: true,
              availableTargets: [],
              mustDrawFromDeck: false 
            });
          }
          
          // Проверяем окончание стадии
          get().checkStage1End();
        }, 1000);
      }
    }),
    {
      name: 'pidr-game-storage',
      // Сохраняем только важные данные
      partialize: (state) => ({
        stats: state.stats,
        settings: state.settings
      })
    }
  )
)