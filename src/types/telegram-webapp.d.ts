// Типы для Telegram WebApp API

export interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser;
  chat?: any;
  // ... другие поля, если нужны
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  ready(): void;
  close(): void;
  expand(): void;
  isExpanded: boolean;
  sendData(data: string): void;
  colorScheme?: 'light' | 'dark';
  // ... другие методы и свойства
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
} 