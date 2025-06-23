'use client'

import { useEffect } from 'react'
import { TelegramProvider } from '../hooks/use_telegram_hook'
import { ThemeProvider } from '../context/theme_context'
import type { TelegramWebApp } from '../hooks/use_telegram_hook'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Инициализация CSS переменных для Telegram
    const root = document.documentElement
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp as TelegramWebApp
      
      // Применяем цвета темы Telegram
      if (tg.themeParams) {
        root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff')
        root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000')
        root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999')
        root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#0ea5e9')
        root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#0ea5e9')
        root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff')
      }

      // Настройка цветов игры
      root.style.setProperty('--game-bg', tg.themeParams?.bg_color || '#f8fafc')
      root.style.setProperty('--card-bg', '#ffffff')
      root.style.setProperty('--text-color', tg.themeParams?.text_color || '#1e293b')
      root.style.setProperty('--accent-color', '#0ea5e9')
    }
  }, [])

  return (
    <TelegramProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </TelegramProvider>
  )
}