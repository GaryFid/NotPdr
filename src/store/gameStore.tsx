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
  
  // Состояния хода для новой логики
  turnPhase: 'analyzing_hand' | 'showing_deck_hint' | 'deck_card_revealed' | 'waiting_deck_action' | 'showing_card_actions' | 'waiting_target_selection' | 'turn_ended'
  revealedDeckCard: Card | null // Открытая карта из колоды (слева от колоды)
  canPlaceOnSelfByRules: boolean // Может ли положить карту из колоды на себя по правилам
  skipHandAnalysis: boolean // Пропуск анализа руки после укладки на себя
  
  // Для второй стадии
  lastDrawnCard: Card | null // Последняя взятая карта из колоды
  lastPlayerToDrawCard: string | null // ID игрока, который последним взял карту
  trumpSuit: 'clubs' | 'diamonds' | 'hearts' | 'spades' | null // Козырь второй стадии
  
  // Состояние 2-й стадии (дурак)
  tableStack: Card[] // Стопка карт на столе (нижняя = первая, верхняя = последняя)
  selectedHandCard: Card | null // Выбранная карта в руке (для двойного клика)
  stage2TurnPhase: 'selecting_card' | 'playing_card' | 'waiting_beat' | 'round_complete' // Фазы хода 2-й стадии
  roundInProgress: boolean // Идет ли текущий раунд битья
  currentRoundInitiator: string | null // Кто начал текущий раунд
  
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
  determineTrumpSuit: () => 'clubs' | 'diamonds' | 'hearts' | 'spades' | null
  getCardSuit: (imageName: string) => 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'unknown'
  
  // Новые методы для алгоритма хода
  revealDeckCard: () => boolean
  canPlaceCardOnSelf: (deckCard: Card, playerTopCard: Card) => boolean  
  placeCardOnSelfByRules: () => void
  takeCardNotByRules: () => void
  resetTurnState: () => void
  onDeckClick: () => void
  findAvailableTargetsForDeckCard: (deckCard: Card) => number[]
  
  // Методы для 2-й стадии
  selectHandCard: (card: Card) => void
  playSelectedCard: () => void
  canBeatCard: (attackCard: Card, defendCard: Card, trumpSuit: string) => boolean
  beatCard: (defendCard: Card) => void
  takeTableCards: () => void
  checkRoundComplete: () => boolean
  initializeStage2: () => void
  
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
      
      // Для второй стадии
      lastDrawnCard: null,
      lastPlayerToDrawCard: null,
      trumpSuit: null,
      
      // Состояние 2-й стадии (дурак)
      tableStack: [],
      selectedHandCard: null,
      stage2TurnPhase: 'selecting_card',
      roundInProgress: false,
      currentRoundInitiator: null,
      
      // Состояния хода для новой логики
      turnPhase: 'analyzing_hand',
      revealedDeckCard: null,
      canPlaceOnSelfByRules: false,
      skipHandAnalysis: false,
      
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
        
        // Сбрасываем состояние и начинаем игру
        get().resetTurnState();
        
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
          // Сбрасываем данные второй стадии
          lastDrawnCard: null,
          lastPlayerToDrawCard: null,
          trumpSuit: null
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
        
        // Сбрасываем все состояния хода
        get().resetTurnState();
        
        set({
          players: [...players],
          currentPlayerId: nextPlayerId,
          currentRound: newRound
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
        
        // Определяем целевой ранг с учетом правил P.I.D.R.
        // ПРАВИЛО: Ищем у соперников карты на 1 ранг НИЖЕ нашей карты
        // ИСКЛЮЧЕНИЕ: Только двойка (2) может ложиться на Туз (14)!
        let targetRank: number;
        
        if (currentRank === 2) {
          // Двойка может ложиться ТОЛЬКО на Туз (14) - ИСКЛЮЧЕНИЕ!
          targetRank = 14;
        } else {
          // Обычное правило: ищем карты на 1 ранг ниже
          // Туз(14) → Король(13), Король(13) → Дама(12), Дама(12) → Валет(11), Валет(11) → 10, ..., 3 → 2
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
      
      // Выполнение хода (обновленная логика)
      makeMove: (targetPlayerId: string) => {
        const { players, currentPlayerId, revealedDeckCard, turnPhase } = get();
        if (!currentPlayerId) return;
        
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        const targetPlayer = players.find(p => p.id === targetPlayerId);
        
        if (!currentPlayer || !targetPlayer) return;
        
        let cardToMove: Card | undefined;
        
        // Определяем какую карту перемещаем
        if (revealedDeckCard && (turnPhase === 'waiting_target_selection' || turnPhase === 'waiting_deck_action')) {
          // Ходим картой из колоды
          cardToMove = revealedDeckCard;
          
          // Убираем карту из колоды и сбрасываем состояние
          const { deck } = get();
          set({
            deck: deck.slice(1),
            revealedDeckCard: null,
            lastDrawnCard: cardToMove,
            lastPlayerToDrawCard: currentPlayerId,
            turnPhase: 'turn_ended'
          });
        } else {
          // Ходим верхней картой из руки
          if (currentPlayer.cards.length === 0) return;
          cardToMove = currentPlayer.cards.pop();
          
          set({ 
            players: [...players],
            skipHandAnalysis: false // После хода на соперника - ВСЕГДА анализ руки
          });
        }
        
        if (!cardToMove) return;
        
        // Перемещаем карту
        targetPlayer.cards.push(cardToMove);
        
        set({ 
          players: [...players]
        });
        
        get().showNotification(`Карта переложена на ${targetPlayer.name}!`, 'success');
        
        // Продолжаем ход (анализ верхней карты в руке) только если это был ход из руки
        if (!revealedDeckCard || (turnPhase !== 'waiting_target_selection' && turnPhase !== 'waiting_deck_action')) {
          setTimeout(() => {
            get().processPlayerTurn(currentPlayerId);
          }, 1000);
        } else {
          // Если это был ход картой из колоды - возвращаемся к анализу руки
          setTimeout(() => {
            get().processPlayerTurn(currentPlayerId);
          }, 1000);
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
        
        // Отслеживаем для второй стадии
        set({ 
          deck: deck.slice(1),
          players: [...players],
          lastDrawnCard: drawnCard,
          lastPlayerToDrawCard: currentPlayerId
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
        const { deck, gameStage, lastPlayerToDrawCard, players } = get();
        if (gameStage !== 1 || deck.length > 0) return;
        
        console.log('🏁 Первая стадия завершена! Колода пуста.');
        
        // Определяем козырь второй стадии
        const trumpSuit = get().determineTrumpSuit();
        console.log('🃏 Козырь второй стадии:', trumpSuit);
        
        // Определяем стартового игрока (последний взявший карту)
        let startingPlayerId = lastPlayerToDrawCard || players[0].id;
        console.log('🎮 Стартовый игрок второй стадии:', startingPlayerId);
        
        // Обновляем текущего игрока
        players.forEach(p => p.isCurrentPlayer = p.id === startingPlayerId);
        
        set({ 
          gameStage: 2,
          availableTargets: [],
          canPlaceOnSelf: false,
          mustDrawFromDeck: false,
          trumpSuit: trumpSuit,
          currentPlayerId: startingPlayerId,
          players: [...players],
          currentRound: 1 // Сбрасываем раунды для новой стадии
        });
        
        // Инициализируем 2-ю стадию
        get().initializeStage2();
        
        // Уведомления о начале второй стадии
        setTimeout(() => {
          get().showNotification('🎉 Первая стадия завершена!', 'success');
          
          setTimeout(() => {
            const startingPlayer = players.find(p => p.id === startingPlayerId);
            get().showNotification(`🚀 Вторая стадия! Ходит: ${startingPlayer?.name || 'Игрок'}`, 'info');
            
            setTimeout(() => {
              const trumpName = trumpSuit === 'clubs' ? 'Трефы' : 
                              trumpSuit === 'diamonds' ? 'Бубны' :
                              trumpSuit === 'hearts' ? 'Червы' : 
                              trumpSuit === 'spades' ? 'Пики' : 'Неизвестно';
              get().showNotification(`🃏 Козырь: ${trumpName}`, 'warning');
            }, 2000);
          }, 2000);
        }, 1000);
      },
      
      // Обработка хода игрока (НОВАЯ логика)
      processPlayerTurn: (playerId: string) => {
        const { gameStage, players, skipHandAnalysis, deck } = get();
        if (gameStage !== 1) return;
        
        console.log(`🎮 Обработка хода игрока: ${playerId}, пропуск анализа руки: ${skipHandAnalysis}`);
        
        const currentPlayer = players.find(p => p.id === playerId);
        if (!currentPlayer) return;
        
        // ДЕБАГ: проверяем состояние карт игрока
        const openCards = currentPlayer.cards.filter(c => c.open);
        console.log(`📋 У игрока ${currentPlayer.name}: ${currentPlayer.cards.length} карт, из них открытых: ${openCards.length}`);
        if (openCards.length > 0) {
          console.log(`📋 Верхняя открытая карта:`, openCards[openCards.length - 1]?.image);
        }
        
        // ЭТАП 1: Анализ руки (ТОЛЬКО если не пропускаем)
        if (!skipHandAnalysis && currentPlayer.cards.length > 0) {
          if (get().canMakeMove(playerId)) {
            // Может ходить - показываем цели и ждем клика по карте
            const targets = get().findAvailableTargets(playerId);
            console.log(`✅ Может ходить картой из руки, цели:`, targets);
            set({ 
              availableTargets: targets,
              turnPhase: 'analyzing_hand'  // ИСПРАВЛЕНО: оставляем в режиме анализа руки
            });
            get().showNotification(`${currentPlayer.name}: выберите карту для хода`, 'info');
            return; // Ждем клика по карте в руке игрока
          } else {
            console.log(`❌ Не может ходить картой из руки, переходим к колоде`);
            // ИСПРАВЛЕНО: явно переходим к этапу 2 (колода)
            get().showNotification(`${currentPlayer.name}: нет ходов из руки, нужна карта из колоды`, 'warning');
          }
        } else if (skipHandAnalysis) {
          console.log(`⏭️ Пропускаем анализ руки, идем к колоде`);
          set({ skipHandAnalysis: false }); // Сбрасываем флаг
        }
        
        // ЭТАП 2: Работа с колодой
        if (deck.length === 0) {
          console.log(`🔚 Колода пуста - завершаем стадию`);
          get().checkStage1End();
          return;
        }
        
        // Показываем подсказку о клике на колоду
        set({ turnPhase: 'showing_deck_hint' });
        get().showNotification(`${currentPlayer.name}: кликните на колоду чтобы открыть карту`, 'info');
      },
      
      // Обработка клика по колоде
      onDeckClick: () => {
        const { turnPhase, currentPlayerId, players, revealedDeckCard } = get();
        if (turnPhase !== 'showing_deck_hint' || !currentPlayerId) return;
        
        // Открываем карту из колоды
        if (!get().revealDeckCard()) {
          get().checkStage1End();
          return;
        }
        
        const { revealedDeckCard: newRevealedCard } = get();
        if (!newRevealedCard) return;
        
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        if (!currentPlayer) return;
        
                 console.log(`🃏 Открыта карта из колоды:`, newRevealedCard.image);
         
         // Проверяем возможности с картой из колоды
         const deckTargets = get().findAvailableTargetsForDeckCard(newRevealedCard);
         const canMoveToOpponents = deckTargets.length > 0;
        
        let canPlaceOnSelfByRules = false;
        if (currentPlayer.cards.length > 0) {
          const topCard = currentPlayer.cards[currentPlayer.cards.length - 1];
          canPlaceOnSelfByRules = get().canPlaceCardOnSelf(newRevealedCard, topCard);
        }
        
                 set({
           turnPhase: 'waiting_deck_action',
           canPlaceOnSelfByRules: canPlaceOnSelfByRules,
           availableTargets: canMoveToOpponents ? deckTargets : []
         });
        
        console.log(`🎯 Доступные действия: ходить на соперников: ${canMoveToOpponents}, положить на себя: ${canPlaceOnSelfByRules}`);
        
        if (canMoveToOpponents) {
          get().showNotification('Выберите: сходить на соперника или положить на себя', 'info');
        } else if (canPlaceOnSelfByRules) {
          get().showNotification('Можете положить карту на себя по правилам или взять просто так', 'warning');
        } else {
          get().showNotification('Нет доступных ходов - карта будет взята', 'warning');
          // Автоматически берем через 2 секунды
          setTimeout(() => {
            get().takeCardNotByRules();
          }, 2000);
        }
      },
      
      // Определение козыря для второй стадии
      determineTrumpSuit: () => {
        const { lastDrawnCard } = get();
        
        if (!lastDrawnCard || !lastDrawnCard.image) return null;
        
        // Определяем масть последней взятой карты
        const lastSuit = get().getCardSuit(lastDrawnCard.image);
        
        // Если не пики - это козырь
        if (lastSuit !== 'spades' && lastSuit !== 'unknown') {
          return lastSuit as 'clubs' | 'diamonds' | 'hearts' | 'spades';
        }
        
        // Если пики или неизвестно - ищем в истории взятых карт
        // TODO: Реализовать поиск предпоследней не-пиковой карты
        // Пока возвращаем червы как дефолт
        console.log('🃏 Последняя карта была пики, нужно найти предпоследнюю не-пиковую');
        return 'hearts';
      },
      
      // Определение масти карты
      getCardSuit: (imageName: string) => {
        const name = imageName.replace('.png', '').replace('/img/cards/', '');
        if (name.includes('clubs')) return 'clubs';
        if (name.includes('diamonds')) return 'diamonds';
        if (name.includes('hearts')) return 'hearts';
                 if (name.includes('spades')) return 'spades';
         return 'unknown';
       },
       
       // ===== НОВЫЕ МЕТОДЫ ДЛЯ АЛГОРИТМА ХОДА =====
       
       // Показать карту из колоды
       revealDeckCard: () => {
         const { deck } = get();
         if (deck.length === 0) return false;
         
         const topCard = { ...deck[0] };
         topCard.rank = get().getCardRank(topCard.image || '');
         topCard.open = true;
         
         set({ 
           revealedDeckCard: topCard,
           turnPhase: 'deck_card_revealed'
         });
         
         return true;
       },
       
       // Проверка возможности положить карту из колоды на себя по правилам
       canPlaceCardOnSelf: (deckCard: Card, playerTopCard: Card) => {
         if (!deckCard.image || !playerTopCard.image) return false;
         
         const deckRank = get().getCardRank(deckCard.image);
         const playerRank = get().getCardRank(playerTopCard.image);
         
         // Логика как в findAvailableTargets: ищем цель на 1 ранг ниже
         if (deckRank === 14) {
           return false; // Туз не может ложиться ни на что
         } else if (deckRank === 2) {
           return playerRank === 14; // Двойка только на туз
         } else {
           return playerRank === (deckRank - 1); // Обычное правило
         }
       },
       
       // Положить карту из колоды на себя по правилам
       placeCardOnSelfByRules: () => {
         const { players, currentPlayerId, revealedDeckCard, deck } = get();
         if (!currentPlayerId || !revealedDeckCard) return;
         
         const currentPlayer = players.find(p => p.id === currentPlayerId);
         if (!currentPlayer) return;
         
         // Добавляем карту из колоды на верх стопки игрока (ОТКРЫТОЙ!)
         revealedDeckCard.open = true; // ИСПРАВЛЕНО: убеждаемся что карта открыта
         currentPlayer.cards.push(revealedDeckCard);
         
         // Отслеживаем для второй стадии
         set({
           players: [...players],
           deck: deck.slice(1),
           lastDrawnCard: revealedDeckCard,
           lastPlayerToDrawCard: currentPlayerId,
           revealedDeckCard: null,
           skipHandAnalysis: true, // ⭐ Пропускаем анализ руки!
           turnPhase: 'analyzing_hand' // Возвращаемся к началу (но с пропуском)
         });
         
         get().showNotification(`${currentPlayer.name} положил карту на себя по правилам - ходит снова!`, 'success');
         
         // ИСПРАВЛЕНО: Продолжаем ход (анализируем руку, если нет открытых карт - идем к колоде)
         setTimeout(() => {
           get().processPlayerTurn(currentPlayerId);
         }, 1000);
       },
       
       // Взять карту не по правилам (завершение хода)
       takeCardNotByRules: () => {
         const { players, currentPlayerId, revealedDeckCard, deck } = get();
         if (!currentPlayerId || !revealedDeckCard) return;
         
         const currentPlayer = players.find(p => p.id === currentPlayerId);
         if (!currentPlayer) return;
         
         // Добавляем карту игроку
         currentPlayer.cards.push(revealedDeckCard);
         
         // Отслеживаем для второй стадии
         set({
           players: [...players],
           deck: deck.slice(1),
           lastDrawnCard: revealedDeckCard,
           lastPlayerToDrawCard: currentPlayerId,
           turnPhase: 'turn_ended'
         });
         
         get().showNotification(`${currentPlayer.name} взял карту и пропускает ход`, 'warning');
         get().resetTurnState();
         
         // Переход к следующему игроку
         setTimeout(() => {
           get().nextTurn();
         }, 1500);
       },
       
                // Сброс состояния хода
         resetTurnState: () => {
           set({
             turnPhase: 'analyzing_hand',
             revealedDeckCard: null,
             availableTargets: [],
             canPlaceOnSelf: false,
             canPlaceOnSelfByRules: false,
             skipHandAnalysis: false
           });
         },
         
         // Поиск целей для карты из колоды
         findAvailableTargetsForDeckCard: (deckCard: Card) => {
           const { players, currentPlayerId } = get();
           if (!deckCard.image || !currentPlayerId) return [];
           
           const deckRank = get().getCardRank(deckCard.image);
           
           // Определяем целевой ранг (та же логика что в findAvailableTargets)
           let targetRank: number;
           
           if (deckRank === 2) {
             // Двойка может ложиться ТОЛЬКО на Туз (14)
             targetRank = 14;
           } else {
             // Обычное правило: ищем карты на 1 ранг ниже
             // Туз(14) → Король(13), Король(13) → Дама(12), и т.д.
             targetRank = deckRank - 1;
           }
           
           const targets: number[] = [];
           players.forEach((player, index) => {
             if (player.id === currentPlayerId) return; // Не можем положить на себя
             
             // Проверяем верхнюю карту игрока
             const playerTopCard = player.cards[player.cards.length - 1];
             if (playerTopCard && playerTopCard.open && playerTopCard.image) {
               const playerRank = get().getCardRank(playerTopCard.image);
               if (playerRank === targetRank) {
                 targets.push(index);
               }
             }
           });
           
           return targets;
         },
         
         // ===== МЕТОДЫ ДЛЯ 2-Й СТАДИИ =====
         
         // Инициализация 2-й стадии
         initializeStage2: () => {
           set({
             stage2TurnPhase: 'selecting_card',
             roundInProgress: false,
             currentRoundInitiator: null,
             tableStack: [],
             selectedHandCard: null
           });
         },
         
         // Выбор карты в руке (двойной клик)
         selectHandCard: (card: Card) => {
           const { selectedHandCard } = get();
           
           if (selectedHandCard?.id === card.id) {
             // Второй клик - играем карту
             get().playSelectedCard();
           } else {
             // Первый клик - выбираем карту
             set({ selectedHandCard: card });
           }
         },
         
         // Розыгрыш выбранной карты
         playSelectedCard: () => {
           const { selectedHandCard, currentPlayerId, players, tableStack, roundInProgress } = get();
           if (!selectedHandCard || !currentPlayerId) return;
           
           const currentPlayer = players.find(p => p.id === currentPlayerId);
           if (!currentPlayer) return;
           
           // Убираем карту из руки игрока
           const cardIndex = currentPlayer.cards.findIndex(c => c.id === selectedHandCard.id);
           if (cardIndex === -1) return;
           
           currentPlayer.cards.splice(cardIndex, 1);
           
           // Добавляем карту на стол (всегда наверх стопки)
           const playedCard = { ...selectedHandCard };
           playedCard.open = false; // На столе карты рубашкой вверх
           
           set({
             players: [...players],
             tableStack: [...tableStack, playedCard],
             selectedHandCard: null,
             roundInProgress: true,
             currentRoundInitiator: roundInProgress ? get().currentRoundInitiator : currentPlayerId,
             stage2TurnPhase: 'waiting_beat'
           });
           
           get().showNotification(`${currentPlayer.name} сыграл карту`, 'info');
           
           // Переходим к следующему игроку
           get().nextTurn();
         },
         
         // Проверка возможности побить карту
         canBeatCard: (attackCard: Card, defendCard: Card, trumpSuit: string) => {
           if (!attackCard.image || !defendCard.image) return false;
           
           const attackSuit = get().getCardSuit(attackCard.image);
           const defendSuit = get().getCardSuit(defendCard.image);
           const attackRank = get().getCardRank(attackCard.image);
           const defendRank = get().getCardRank(defendCard.image);
           
           // Правило "Пики только Пикями"
           if (attackSuit === 'spades' && defendSuit !== 'spades') {
             return false;
           }
           
           // Бить той же мастью старшей картой
           if (attackSuit === defendSuit) {
             return defendRank > attackRank;
           }
           
           // Бить козырем некозырную карту
           if (defendSuit === trumpSuit && attackSuit !== trumpSuit) {
             return true;
           }
           
           return false;
         },
         
         // Побить карту на столе
         beatCard: (defendCard: Card) => {
           const { currentPlayerId, players, tableStack, trumpSuit } = get();
           if (!currentPlayerId || tableStack.length === 0) return;
           
           const currentPlayer = players.find(p => p.id === currentPlayerId);
           if (!currentPlayer) return;
           
           const topCard = tableStack[tableStack.length - 1]; // Верхняя карта для битья
           
           // Проверяем можем ли побить
           if (!get().canBeatCard(topCard, defendCard, trumpSuit || '')) {
             get().showNotification('Нельзя побить эту карту!', 'error');
             return;
           }
           
           // Убираем карту из руки
           const cardIndex = currentPlayer.cards.findIndex(c => c.id === defendCard.id);
           if (cardIndex === -1) return;
           
           currentPlayer.cards.splice(cardIndex, 1);
           
           // Добавляем карту на стол
           const playedCard = { ...defendCard };
           playedCard.open = false; // Рубашкой вверх
           
           set({
             players: [...players],
             tableStack: [...tableStack, playedCard]
           });
           
           get().showNotification(`${currentPlayer.name} побил карту!`, 'success');
           
           // Проверяем завершение раунда
           if (get().checkRoundComplete()) {
             // Раунд завершен - карты в биту, текущий игрок ходит снова
             setTimeout(() => {
               set({
                 tableStack: [],
                 roundInProgress: false,
                 currentRoundInitiator: null,
                 stage2TurnPhase: 'selecting_card'
               });
               get().showNotification('Раунд завершен! Карты в биту', 'success');
             }, 1000);
           } else {
             // Переходим к следующему игроку
             get().nextTurn();
           }
         },
         
         // Взять карты со стола
         takeTableCards: () => {
           const { currentPlayerId, players, tableStack } = get();
           if (!currentPlayerId || tableStack.length === 0) return;
           
           const currentPlayer = players.find(p => p.id === currentPlayerId);
           if (!currentPlayer) return;
           
           // Берем нижнюю карту (первую в стопке)
           const bottomCard = tableStack[0];
           bottomCard.open = true; // Открываем взятую карту
           
           currentPlayer.cards.push(bottomCard);
           
           set({
             players: [...players],
             tableStack: tableStack.slice(1) // Убираем нижнюю карту
           });
           
           get().showNotification(`${currentPlayer.name} взял карту со стола`, 'warning');
           
           // Если стол пуст - раунд завершен
           if (tableStack.length === 1) { // Была только одна карта
             set({
               tableStack: [],
               roundInProgress: false,
               currentRoundInitiator: null,
               stage2TurnPhase: 'selecting_card'
             });
           }
           
           // Переходим к следующему игроку
           get().nextTurn();
         },
         
         // Проверка завершения раунда
         checkRoundComplete: () => {
           const { currentPlayerId, currentRoundInitiator, players } = get();
           if (!currentRoundInitiator) return false;
           
           // Найдем индекс инициатора раунда
           const initiatorIndex = players.findIndex(p => p.id === currentRoundInitiator);
           const currentIndex = players.findIndex(p => p.id === currentPlayerId);
           
           if (initiatorIndex === -1 || currentIndex === -1) return false;
           
           // Раунд завершается когда доходим до игрока перед инициатором
           const beforeInitiatorIndex = (initiatorIndex - 1 + players.length) % players.length;
           
           return currentIndex === beforeInitiatorIndex;
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