'use client'

import { motion } from 'framer-motion'
import { Play, User, Star, Book, Wallet, UserPlus, Store, Menu, Link } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useTelegram } from '../hooks/useTelegram'
import { useWalletStore } from '../store/walletStore'
import { useState } from 'react'

const tokens = [
  { name: 'TON', symbol: 'TON', color: '#0088ff' },
  { name: 'SOLANA', symbol: 'SOL', color: '#9945ff' },
  { name: 'ETHEREUM', symbol: 'ETH', color: '#627eea' },
]

interface MainMenuProps {
  onNavigate: (page: 'game' | 'invite' | 'shop' | 'profile' | 'menu') => void
  balance?: number
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const { startGame, stats } = useGameStore()
  const { hapticFeedback } = useTelegram()
  const [menuOpen, setMenuOpen] = useState(false)
  const { 
    tonAddress, tonBalance, isTonConnected,
    solanaAddress, solanaBalance, isSolanaConnected,
    ethereumAddress, ethereumBalance, isEthereumConnected,
    connectTonWallet, connectSolanaWallet, connectEthereumWallet,
    disconnectTonWallet, disconnectSolanaWallet, disconnectEthereumWallet
  } = useWalletStore()

  const handleWalletAction = async (type: 'ton' | 'solana' | 'ethereum') => {
    hapticFeedback('medium')
    try {
      switch (type) {
        case 'ton':
          if (isTonConnected) {
            disconnectTonWallet()
          } else {
            await connectTonWallet()
          }
          break
        case 'solana':
          if (isSolanaConnected) {
            disconnectSolanaWallet()
          } else {
            await connectSolanaWallet()
          }
          break
        case 'ethereum':
          if (isEthereumConnected) {
            disconnectEthereumWallet()
          } else {
            await connectEthereumWallet()
          }
          break
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
    }
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
            onClick={() => setMenuOpen((v) => !v)}
            style={{ position: 'relative' }}
          >
            <Menu className="wallet-icon" />
          </button>
          {menuOpen && (
            <div className="wallet-dropdown fade-in">
              {tokens.map((token) => (
                <div className="wallet-token" key={token.name} style={{ borderColor: token.color }}>
                  <div className="wallet-token-header">
                    <div className="wallet-token-name" style={{ color: token.color }}>
                      {token.symbol}
                    </div>
                    <div className="wallet-token-status">
                      {token.name === 'TON' && isTonConnected && '🟢'}
                      {token.name === 'SOLANA' && isSolanaConnected && '🟢'}
                      {token.name === 'ETHEREUM' && isEthereumConnected && '🟢'}
                      {token.name === 'TON' && !isTonConnected && '🔴'}
                      {token.name === 'SOLANA' && !isSolanaConnected && '🔴'}
                      {token.name === 'ETHEREUM' && !isEthereumConnected && '🔴'}
                    </div>
                  </div>
                  <div className="wallet-token-balance">
                    {token.name === 'TON' ? tonBalance : 
                     token.name === 'SOLANA' ? solanaBalance :
                     token.name === 'ETHEREUM' ? ethereumBalance : '0.00'} {token.symbol}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Кнопки подключения кошельков */}
        <div className="wallet-connect-section">
          <div className="wallet-connect-title">ПОДКЛЮЧИТЬ КОШЕЛЕК</div>
          <div className="wallet-connect-grid">
            <button 
              onClick={() => handleWalletAction('ton')} 
              className="wallet-connect-btn ton-wallet"
            >
              <div className="wallet-connect-icon">💎</div>
              <div className="wallet-connect-label">
                {isTonConnected ? 'TON ✓' : 'TON Wallet'}
              </div>
              {isTonConnected && (
                <div className="wallet-connect-address">
                  {tonAddress?.slice(0, 8)}...{tonAddress?.slice(-6)}
                </div>
              )}
            </button>
            
            <button 
              onClick={() => handleWalletAction('solana')} 
              className="wallet-connect-btn solana-wallet"
            >
              <div className="wallet-connect-icon">⚡</div>
              <div className="wallet-connect-label">
                {isSolanaConnected ? 'Phantom ✓' : 'Phantom'}
              </div>
              {isSolanaConnected && (
                <div className="wallet-connect-address">
                  {solanaAddress?.slice(0, 8)}...{solanaAddress?.slice(-6)}
                </div>
              )}
            </button>
            
            <button 
              onClick={() => handleWalletAction('ethereum')} 
              className="wallet-connect-btn ethereum-wallet"
            >
              <div className="wallet-connect-icon">🦄</div>
              <div className="wallet-connect-label">
                {isEthereumConnected ? 'MetaMask ✓' : 'MetaMask'}
              </div>
              {isEthereumConnected && (
                <div className="wallet-connect-address">
                  {ethereumAddress?.slice(0, 8)}...{ethereumAddress?.slice(-6)}
                </div>
              )}
            </button>
          </div>
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