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
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1833] via-[#0e223f] to-[#1e3c72] animate-gradient-move">
      {/* Animated SVG blobs background */}
      <svg className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-40 blur-2xl z-0" viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="300" r="300" fill="url(#blue)" />
        <defs>
          <radialGradient id="blue" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0a1833" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <svg className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-30 blur-2xl z-0" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="200" fill="url(#gold)" />
        <defs>
          <radialGradient id="gold" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop stopColor="#ffd700" />
            <stop offset="1" stopColor="#0a1833" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      {/* Wallet button top right */}
      <motion.button
        onClick={() => onNavigate('wallet')}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="fixed top-6 right-6 z-20 glass-wallet shadow-2xl rounded-full p-4 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-yellow-400/60"
        style={{ boxShadow: '0 4px 32px 0 #ffd70080' }}
        aria-label="Кошелек"
      >
        <Wallet size={32} className="text-yellow-400 drop-shadow-lg" />
      </motion.button>
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
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-700 via-green-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-4xl font-extrabold text-white drop-shadow-lg">P</span>
            </div>
          </motion.div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 bg-clip-text text-transparent mb-2 animate-gradient-text neon-text">
            P.I.D.R.
          </h1>
          <p className="text-blue-100 text-lg tracking-wide drop-shadow animate-fade-in">Карточная игра нового поколения</p>
        </motion.div>
        {/* Main 4 buttons grid */}
        <div className="grid grid-cols-2 gap-8 w-full mb-10">
          <motion.button
            whileHover={{ scale: 1.09, boxShadow: '0 0 32px #38bdf8' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('game')}
            className="glass-btn flex flex-col items-center justify-center py-10 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-400 to-cyan-400 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-blue-400/30 hover:shadow-blue-400/40 animate-glow"
          >
            <Play size={44} className="mb-2 drop-shadow" />
            Играть
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.09, boxShadow: '0 0 32px #22c55e' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('profile')}
            className="glass-btn flex flex-col items-center justify-center py-10 rounded-3xl bg-gradient-to-br from-green-500 via-blue-400 to-green-700 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-green-400/30 hover:shadow-green-400/40 animate-glow"
          >
            <User size={44} className="mb-2 drop-shadow" />
            Профиль
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.09, boxShadow: '0 0 32px #ffd700' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('rating')}
            className="glass-btn flex flex-col items-center justify-center py-10 rounded-3xl bg-gradient-to-br from-yellow-400 via-red-400 to-yellow-600 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-yellow-400/30 hover:shadow-yellow-400/40 animate-glow"
          >
            <Star size={44} className="mb-2 drop-shadow" />
            Рейтинг
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.09, boxShadow: '0 0 32px #ef4444' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('rules')}
            className="glass-btn flex flex-col items-center justify-center py-10 rounded-3xl bg-gradient-to-br from-red-500 via-yellow-400 to-blue-400 shadow-xl text-white font-bold text-xl transition-all duration-200 border-2 border-red-400/30 hover:shadow-red-400/40 animate-glow"
          >
            <Book size={44} className="mb-2 drop-shadow" />
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
          <p className="text-md text-blue-200 drop-shadow animate-fade-in">Погрузись в мир карточных баталий и стань легендой!</p>
        </motion.div>
      </div>
    </div>
  )
}

// Добавь в style.css:
// .glass-btn { background: rgba(30,40,80,0.35); backdrop-filter: blur(16px); border: 1.5px solid rgba(255,255,255,0.08); }
// .glass-wallet { background: rgba(30,40,80,0.55); backdrop-filter: blur(18px); border: 2.5px solid #ffd70044; }
// .neon-text { text-shadow: 0 0 8px #38bdf8, 0 0 24px #38bdf8, 0 0 2px #fff; }
// .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1) both; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: none; } }

// Tailwind custom animations (add to your global CSS or tailwind.config.js):
// .animate-gradient-move { background-size: 200% 200%; animation: gradientMove 8s ease-in-out infinite; }
// @keyframes gradientMove { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
// .animate-gradient-text { background-size: 200% 200%; animation: gradientText 4s ease-in-out infinite; }
// @keyframes gradientText { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
// .animate-glow { box-shadow: 0 0 32px 0 #0ea5e9cc, 0 0 8px 0 #fff2; }