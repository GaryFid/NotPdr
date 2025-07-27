'use client'

import { motion } from 'framer-motion'
import { Play, User, Star, Book, Wallet, UserPlus, Store, Menu } from 'lucide-react'
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
    <div className="main-menu-container">
      <div className="main-menu-inner">
        {/* Верхний бар */}
        <div className="menu-header" style={{ position: 'relative' }}>
          <button onClick={() => window.history.back()} className="px-3 py-1 rounded-lg border border-red-400 text-red-200 font-semibold text-base hover:bg-red-400/10 transition-all">Назад</button>
          <span className="menu-title">P.I.D.R.</span>
          <button
            className="wallet-btn"
            onClick={() => setWalletOpen((v) => !v)}
            style={{ position: 'relative' }}
          >
            <Wallet className="wallet-icon" />
            <img src="/img/ton-icon.svg" alt="TON" className="w-6 h-6" />
          </button>
          {walletOpen && (
            <div className="wallet-dropdown fade-in">
              {coins.map((coin) => (
                <div className="wallet-coin" key={coin.name}>
                  <img src={coin.icon} alt={coin.name} className="wallet-coin-icon" />
                  <span className="wallet-coin-value">{coin.value}</span>
                  <span className="wallet-coin-name">{coin.name}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="wallet-action-btn wallet-action-btn--deposit">Пополнить</button>
                <button className="wallet-action-btn wallet-action-btn--withdraw">Вывод</button>
              </div>
            </div>
          )}
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