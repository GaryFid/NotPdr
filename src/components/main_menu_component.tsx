'use client'

import { motion } from 'framer-motion'
import { Play, User, Star, Book, Wallet, UserPlus, Store, Menu, Sparkles } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useTelegram } from '../hooks/useTelegram'
import { useState } from 'react'

const coins = [
  { name: 'TON', icon: '/img/ton-icon.svg', value: 12345.67 },
  { name: 'TRUMP', icon: '/img/trump-icon.svg', value: 9876.54 },
  { name: 'SOLANA', icon: '/img/solana-icon.svg', value: 23456.78 },
  { name: 'JETTON', icon: '/img/jetton-icon.svg', value: 10000.00 },
]

interface MainMenuProps {
  onNavigate: (page: 'game' | 'invite' | 'shop' | 'profile' | 'menu') => void
  balance?: number
}

export function MainMenu({ onNavigate, balance = 1000 }: MainMenuProps) {
  const { startGame, stats } = useGameStore()
  const { hapticFeedback, showMainButton, hideMainButton } = useTelegram()
  const [walletOpen, setWalletOpen] = useState(false)

  const handleStartSinglePlayer = () => {
    hapticFeedback('medium')
    startGame('single', 2)
  }

  const handleStartMultiplayer = () => {
    hapticFeedback('medium')
    startGame('multiplayer', 4)
  }

  return (
    <div className="neon-main-container">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            animate={{
              y: [-20, -100, -20],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="neon-main-inner">
        {/* Верхний бар с неоновым эффектом */}
        <motion.div 
          className="neon-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.button 
            onClick={() => window.history.back()} 
            className="neon-back-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Назад
          </motion.button>
          
          <motion.span 
            className="neon-title"
            animate={{
              textShadow: [
                "0 0 20px #ff0080, 0 0 40px #ff0080, 0 0 60px #ff0080",
                "0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff",
                "0 0 20px #39ff14, 0 0 40px #39ff14, 0 0 60px #39ff14",
                "0 0 20px #ff0080, 0 0 40px #ff0080, 0 0 60px #ff0080"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            P.I.D.R.
          </motion.span>
          
          <motion.button
            className="neon-wallet-btn"
            onClick={() => setWalletOpen((v) => !v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px #ffd700, 0 0 40px #ffd700",
                "0 0 20px #ff0080, 0 0 40px #ff0080",
                "0 0 20px #00ffff, 0 0 40px #00ffff",
                "0 0 20px #ffd700, 0 0 40px #ffd700"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Wallet className="wallet-icon" />
            <img src="/img/ton-icon.svg" alt="TON" className="w-6 h-6" />
          </motion.button>
          
          {walletOpen && (
            <motion.div 
              className="neon-wallet-dropdown"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {coins.map((coin, index) => (
                <motion.div 
                  className="neon-wallet-coin" 
                  key={coin.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <img src={coin.icon} alt={coin.name} className="wallet-coin-icon" />
                  <span className="neon-coin-value">{coin.value}</span>
                  <span className="neon-coin-name">{coin.name}</span>
                </motion.div>
              ))}
              <motion.div 
                style={{ display: 'flex', gap: 10, marginTop: 16 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button 
                  className="neon-wallet-action neon-wallet-deposit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Пополнить
                </motion.button>
                <motion.button 
                  className="neon-wallet-action neon-wallet-withdraw"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Вывод
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Баланс с пульсирующим эффектом */}
        <motion.div 
          className="neon-balance-card"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div 
            className="neon-balance-amount"
            animate={{
              textShadow: [
                "0 0 20px #ffd700, 0 0 40px #ffd700",
                "0 0 30px #ffd700, 0 0 60px #ffd700",
                "0 0 20px #ffd700, 0 0 40px #ffd700"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {balance}
          </motion.div>
          <div className="neon-balance-label">
            <Sparkles className="inline w-5 h-5 mr-2" />
            МОНЕТ
          </div>
        </motion.div>

        {/* Заголовок действий */}
        <motion.div 
          className="neon-actions-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          БЫСТРЫЕ ДЕЙСТВИЯ
        </motion.div>

        {/* Сетка действий с неоновыми эффектами */}
        <motion.div 
          className="neon-actions-grid"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button 
            onClick={() => onNavigate('game')} 
            className="neon-action-card neon-play"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px #ff0080, 0 0 40px #ff0080",
                "0 0 30px #ff0080, 0 0 60px #ff0080",
                "0 0 20px #ff0080, 0 0 40px #ff0080"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Play className="neon-action-icon" />
            <span className="neon-action-label">ИГРАТЬ</span>
          </motion.button>

          <motion.button 
            onClick={() => onNavigate('invite')} 
            className="neon-action-card neon-invite"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px #00ffff, 0 0 40px #00ffff",
                "0 0 30px #00ffff, 0 0 60px #00ffff",
                "0 0 20px #00ffff, 0 0 40px #00ffff"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <UserPlus className="neon-action-icon" />
            <span className="neon-action-label">ПРИГЛАСИТЬ</span>
          </motion.button>

          <motion.button 
            onClick={() => onNavigate('shop')} 
            className="neon-action-card neon-shop"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px #39ff14, 0 0 40px #39ff14",
                "0 0 30px #39ff14, 0 0 60px #39ff14",
                "0 0 20px #39ff14, 0 0 40px #39ff14"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <Store className="neon-action-icon" />
            <span className="neon-action-label">МАГАЗИН</span>
          </motion.button>

          <motion.button 
            onClick={() => onNavigate('profile')} 
            className="neon-action-card neon-profile"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px #ff6600, 0 0 40px #ff6600",
                "0 0 30px #ff6600, 0 0 60px #ff6600",
                "0 0 20px #ff6600, 0 0 40px #ff6600"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          >
            <User className="neon-action-icon" />
            <span className="neon-action-label">ПРОФИЛЬ</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

// Добавь в style.css:
// .action-card { background: #101c33; border: 2px solid #ff3b3b; border-radius: 18px; box-shadow: 0 2px 12px #0004; padding: 28px 0 18px 0; display: flex; flex-direction: column; align-items: center; transition: box-shadow .18s, border-color .18s, background .18s; }
// .action-card:hover { border-color: #ffd700; background: #182a4d; box-shadow: 0 4px 24px #ffd70044; }

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