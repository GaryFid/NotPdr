'use client'

import { motion } from 'framer-motion'
import { Play, User, Star, Book, Wallet } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useTelegram } from '../hooks/useTelegram'

interface MainMenuProps {
  onNavigate: (page: 'game' | 'profile' | 'rating' | 'rules' | 'wallet') => void
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
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#232b3e] to-[#1e3c72] animate-gradient-move">
      {/* Wallet button top right */}
      <motion.button
        onClick={() => onNavigate('wallet')}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="fixed top-6 right-6 z-20 bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow-2xl rounded-full p-4 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-white/30"
        style={{ boxShadow: '0 4px 32px 0 #ffd70080' }}
        aria-label="Кошелек"
      >
        <Wallet size={32} className="text-white drop-shadow-lg" />
      </motion.button>

      {/* Animated background particles (optional) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Можно добавить animated SVG или canvas particles */}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">
        {/* Logo and heading */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10 mt-16"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="mb-4"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-4xl font-extrabold text-white drop-shadow-lg">P</span>
            </div>
          </motion.div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-700 bg-clip-text text-transparent mb-2 animate-gradient-text">
            P.I.D.R.
          </h1>
          <p className="text-blue-100 text-lg tracking-wide drop-shadow">Карточная игра нового поколения</p>
        </motion.div>

        {/* Main 4 buttons */}
        <div className="grid grid-cols-2 gap-6 w-full mb-10">
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: '0 0 32px #0ea5e9' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('game')}
            className="flex flex-col items-center justify-center py-8 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-700 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-white/10 hover:shadow-blue-400/40 animate-glow"
          >
            <Play size={40} className="mb-2 drop-shadow" />
            Играть
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: '0 0 32px #f59e42' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center justify-center py-8 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-white/10 hover:shadow-yellow-400/40 animate-glow"
          >
            <User size={40} className="mb-2 drop-shadow" />
            Профиль
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: '0 0 32px #fbbf24' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('rating')}
            className="flex flex-col items-center justify-center py-8 rounded-2xl bg-gradient-to-br from-pink-500 via-yellow-400 to-orange-400 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-white/10 hover:shadow-pink-400/40 animate-glow"
          >
            <Star size={40} className="mb-2 drop-shadow" />
            Рейтинг
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: '0 0 32px #38bdf8' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('rules')}
            className="flex flex-col items-center justify-center py-8 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-700 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-white/10 hover:shadow-cyan-400/40 animate-glow"
          >
            <Book size={40} className="mb-2 drop-shadow" />
            Правила
          </motion.button>
        </div>

        {/* Footer or tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-blue-200 drop-shadow">Погрузись в мир карточных баталий и стань легендой!</p>
        </motion.div>
      </div>
    </div>
  )
}

// Tailwind custom animations (add to your global CSS or tailwind.config.js):
// .animate-gradient-move { background-size: 200% 200%; animation: gradientMove 8s ease-in-out infinite; }
// @keyframes gradientMove { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
// .animate-gradient-text { background-size: 200% 200%; animation: gradientText 4s ease-in-out infinite; }
// @keyframes gradientText { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
// .animate-glow { box-shadow: 0 0 32px 0 #0ea5e9cc, 0 0 8px 0 #fff2; }