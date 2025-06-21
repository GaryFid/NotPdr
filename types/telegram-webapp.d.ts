// Типы для Telegram WebApp API

interface TelegramWebAppUser {
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

interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser;
  chat?: any;
  // ... другие поля, если нужны
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  ready(): void;
  close(): void;
  expand(): void;
  isExpanded: boolean;
  sendData(data: string): void;
  // ... другие методы и свойства
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
} 