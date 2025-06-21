'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    readonly isProgressVisible: boolean
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  close(): void
  sendData(data: string): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramContextType {
  webApp: TelegramWebApp | null
  user: TelegramUser | null
  isReady: boolean
  showMainButton: (text: string, callback: () => void) => void
  hideMainButton: () => void
  showBackButton: (callback: () => void) => void
  hideBackButton: () => void
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void
  showAlert: (message: string) => void
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void
  sendData: (data: any) => void
  close: () => void
}

const TelegramContext = createContext<TelegramContextType | null>(null)

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      setWebApp(tg)
      setIsReady(true)

      // Настройка темы
      document.documentElement.style.setProperty('--tg-bg-color', tg.backgroundColor)
      document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#000000')
      
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark')
      }
    } else {
      // Для разработки без Telegram
      setIsReady(true)
    }
  }, [])

  const showMainButton = (text: string, callback: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text)
      webApp.MainButton.show()
      webApp.MainButton.onClick(callback)
    }
  }

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide()
    }
  }

  const showBackButton = (callback: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.show()
      webApp.BackButton.onClick(callback)
    }
  }

  const hideBackButton = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide()
    }
  }

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (webApp?.HapticFeedback) {
      if (['success', 'warning', 'error'].includes(type)) {
        webApp.HapticFeedback.notificationOccurred(type as 'success' | 'warning' | 'error')
      } else {
        webApp.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy')
      }
    }
  }

  const showAlert = (message: string) => {
    if (webApp?.showAlert) {
      webApp.showAlert(message)
    } else {
      alert(message)
    }
  }

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (webApp?.showConfirm) {
      webApp.showConfirm(message, callback)
    } else {
      callback(confirm(message))
    }
  }

  const sendData = (data: any) => {
    if (webApp?.sendData) {
      webApp.sendData(JSON.stringify(data))
    }
  }

  const close = () => {
    if (webApp?.close) {
      webApp.close()
    }
  }

  const value: TelegramContextType = {
    webApp,
    user: webApp?.initDataUnsafe?.user || null,
    isReady,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    showAlert,
    showConfirm,
    sendData,
    close,
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider')
  }
  return context
}