'use client'

import { motion } from 'framer-motion'
import { Play, User, Star, Book, Wallet, UserPlus, Store, Menu } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useTelegram } from '../hooks/useTelegram'

interface MainMenuProps {
  onNavigate: (page: 'game' | 'invite' | 'shop' | 'profile' | 'menu') => void
  balance?: number
}

export function MainMenu({ onNavigate, balance = 1000 }: MainMenuProps) {
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
    <div className="main-menu-container">
      <div className="main-menu-inner">
        {/* Верхний бар */}
        <div className="menu-header">
          <button onClick={() => window.history.back()} className="px-3 py-1 rounded-lg border border-red-400 text-red-200 font-semibold text-base hover:bg-red-400/10 transition-all">Назад</button>
          <span className="menu-title">P.I.D.R.</span>
          <button onClick={() => onNavigate('menu')} className="flex items-center gap-2 px-3 py-1 rounded-lg border border-blue-400 text-blue-200 font-semibold text-base hover:bg-blue-400/10 transition-all">
            <Menu size={24} />
            <img src="/img/ton-icon.svg" alt="TON" className="w-6 h-6" />
          </button>
        </div>
        {/* Баланс */}
        <div className="menu-balance-card">
          <div className="menu-balance-amount">{balance}</div>
          <div className="menu-balance-label">монет</div>
        </div>
        {/* Быстрые действия */}
        <div className="menu-actions-title">БЫСТРЫЕ ДЕЙСТВИЯ</div>
        <div className="menu-actions-grid">
          <button onClick={() => onNavigate('game')} className="menu-action-card">
            <Play className="menu-action-icon" />
            <span className="menu-action-label">ИГРАТЬ</span>
          </button>
          <button onClick={() => onNavigate('invite')} className="menu-action-card">
            <UserPlus className="menu-action-icon" />
            <span className="menu-action-label">ПРИГЛАСИТЬ</span>
          </button>
          <button onClick={() => onNavigate('shop')} className="menu-action-card">
            <Store className="menu-action-icon" />
            <span className="menu-action-label">МАГАЗИН</span>
          </button>
          <button onClick={() => onNavigate('profile')} className="menu-action-card">
            <User className="menu-action-icon" />
            <span className="menu-action-label">ПРОФИЛЬ</span>
          </button>
        </div>
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