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
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-[#0a1833] via-[#0e223f] to-[#1e3c72]">
      {/* Верхний бар */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#0a1833] to-[#13294b] border-b border-[#222b3e]" style={{minHeight: 56}}>
        <button onClick={() => window.history.back()} className="px-3 py-1 rounded-lg border border-red-400 text-red-200 font-semibold text-base hover:bg-red-400/10 transition-all">Назад</button>
        <span className="text-2xl font-extrabold text-[#ffd700] tracking-widest text-center flex-1" style={{letterSpacing: 2}}>P.I.D.R.</span>
        <button onClick={() => onNavigate('menu')} className="flex items-center gap-2 px-3 py-1 rounded-lg border border-blue-400 text-blue-200 font-semibold text-base hover:bg-blue-400/10 transition-all">
          <Menu size={24} />
          <img src="/img/ton-icon.svg" alt="TON" className="w-6 h-6" />
        </button>
      </div>
      {/* Баланс */}
      <div className="w-full flex justify-center mt-6 mb-4">
        <div className="bg-[#ffd700] text-[#222] rounded-xl shadow-lg px-8 py-6 flex flex-col items-center" style={{minWidth: 260}}>
          <span className="text-4xl font-extrabold">{balance}</span>
          <span className="text-lg font-semibold mt-1">монет</span>
        </div>
      </div>
      {/* Быстрые действия */}
      <div className="w-full max-w-md px-4">
        <div className="text-gray-400 font-bold text-lg mb-3 mt-2 tracking-wide">БЫСТРЫЕ ДЕЙСТВИЯ</div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate('game')} className="action-card">
            <Play size={32} className="text-red-400 mb-2" />
            <span className="font-bold text-lg text-white">ИГРАТЬ</span>
          </button>
          <button onClick={() => onNavigate('invite')} className="action-card">
            <UserPlus size={32} className="text-red-400 mb-2" />
            <span className="font-bold text-lg text-white">ПРИГЛАСИТЬ</span>
          </button>
          <button onClick={() => onNavigate('shop')} className="action-card">
            <Store size={32} className="text-red-400 mb-2" />
            <span className="font-bold text-lg text-white">МАГАЗИН</span>
          </button>
          <button onClick={() => onNavigate('profile')} className="action-card">
            <User size={32} className="text-red-400 mb-2" />
            <span className="font-bold text-lg text-white">ПРОФИЛЬ</span>
          </button>
        </div>
      </div>
      {/* Нижний отступ */}
      <div className="flex-1" />
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