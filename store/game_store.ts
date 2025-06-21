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
        const players: Player[] = []
        
        // Создаем игроков
        for (let i = 0; i < playersCount; i++) {
          players.push({
            id: `player_${i + 1}`,
            name: i === 0 ? 'Вы' : `Игрок ${i + 1}`,
            score: 0,
            cards: [],
            isCurrentPlayer: i === 0
          })
        }
        
        // Раздаем карты
        const shuffledDeck = [...DEFAULT_CARDS].sort(() => Math.random() - 0.5)
        players.forEach(player => {
          player.cards = shuffledDeck.slice(0, 5) // Каждому игроку по 5 карт
        })
        
        set({
          isGameActive: true,
          gameMode: mode,
          currentRound: 1,
          players,
          currentPlayerId: players[0].id,
          deck: shuffledDeck.slice(5 * playersCount),
          playedCards: [],
          lastPlayedCard: null
        })
        
        get().showNotification('Игра начата!', 'success')
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
        const { players, currentPlayerId, currentRound, maxRounds } = get()
        
        // Находим следующего игрока
        const currentIndex = players.findIndex(p => p.id === currentPlayerId)
        const nextIndex = (currentIndex + 1) % players.length
        const nextPlayerId = players[nextIndex].id
        
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
          currentRound: newRound
        })
        
        // Проверяем окончание игры
        if (newRound > maxRounds) {
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
      
      setLoading: (loading) => set({ isLoading: loading })
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