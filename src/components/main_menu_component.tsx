'use client'

import { motion } from 'framer-motion'
import { Play, Users, Zap, Crown } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useTelegram } from '../hooks/useTelegram'

interface MainMenuProps {
  onNavigate: (page: 'game' | 'profile' | 'shop' | 'settings') => void
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const { startGame, stats } = useGameStore()
  const { hapticFeedback, showMainButton, hideMainButton } = useTelegram()

  const handleStartSinglePlayer = () => {
    hapticFeedback('medium')
    startGame('single', 2)
  }

  const handleStartMultiplayer = () => {
    hapticFeedback('medium')
    startGame('multiplayer', 4)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {/* Логотип и заголовок */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 pt-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="mb-4"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white">P</span>
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
            P.I.D.R.
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Карточная игра
          </p>
        </motion.div>

        {/* Статистика */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {stats.gamesPlayed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Игр сыграно
            </div>
          </div>
          
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.gamesWon}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Побед
            </div>
          </div>
          
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.bestScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Рекорд
            </div>
          </div>
        </motion.div>

        {/* Кнопки игры */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartSinglePlayer}
            className="w-full btn btn-primary py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-3 text-lg font-semibold"
          >
            <Play size={24} />
            <span>Одиночная игра</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartMultiplayer}
            className="w-full btn btn-secondary py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-3 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            <Users size={24} />
            <span>Мультиплеер</span>
          </motion.button>
        </motion.div>

        {/* Быстрые действия */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('shop')}
            className="card p-6 text-center hover:shadow-lg transition-all duration-200"
          >
            <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="font-semibold text-gray-900 dark:text-white">
              Магазин
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Карты и бусты
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('profile')}
            className="card p-6 text-center hover:shadow-lg transition-all duration-200"
          >
            <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="font-semibold text-gray-900 dark:text-white">
              Достижения
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats.achievements.length} получено
            </div>
          </motion.button>
        </motion.div>

        {/* Подсказка */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Соберите все карты P.I.D.R. и станьте легендой!
          </p>
        </motion.div>
      </div>
    </div>
  )
}