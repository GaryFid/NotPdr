# 💰 **Полный гайд по интеграции платежных систем для P.I.D.R. Game**

## 📋 **Содержание**
1. [Обзор платежных систем](#overview)
2. [Криптовалютные кошельки](#crypto-wallets)
3. [Традиционные платежные системы](#traditional-payments)
4. [Telegram Payments](#telegram-payments)
5. [Интеграция с API](#api-integration)
6. [Безопасность и соответствие](#security)
7. [Пошаговая реализация](#implementation)

---

## 🎯 **Обзор платежных систем** {#overview}

### **Рекомендуемая архитектура:**
- **Основные:** Криптовалютные кошельки (TON, ETH, SOL)
- **Дополнительные:** Telegram Stars, банковские карты
- **Региональные:** ЮMoney, QIWI, WebMoney (для России/СНГ)

### **Курсы обмена:**
- **500 игровых монет = 1 USDT (~80₽)**
- Автоматический пересчет курсов через API

---

## 🔐 **Криптовалютные кошельки** {#crypto-wallets}

### **1. TON (The Open Network)**

#### **Подключение:**
```bash
npm install @tonconnect/ui-react @tonconnect/sdk
```

#### **Конфигурация:**
```typescript
// tonconnect-manifest.json
{
  "url": "https://your-game.vercel.app",
  "name": "P.I.D.R. Game",
  "iconUrl": "https://your-game.vercel.app/icon-512.png",
  "termsOfUseUrl": "https://your-game.vercel.app/terms",
  "privacyPolicyUrl": "https://your-game.vercel.app/privacy"
}
```

#### **Переменные окружения:**
```env
NEXT_PUBLIC_TON_MANIFEST_URL=https://your-game.vercel.app/tonconnect-manifest.json
```

#### **Реализация:**
```typescript
// Уже реализовано в src/lib/wallets/ton-connector.ts
import { TonConnectUI } from '@tonconnect/ui-react';

const tonConnectUI = new TonConnectUI({
  manifestUrl: process.env.NEXT_PUBLIC_TON_MANIFEST_URL,
  buttonRootId: 'ton-connect-button'
});
```

### **2. Ethereum (ETH) + ERC-20 токены**

#### **Подключение:**
```bash
npm install ethers wagmi @rainbow-me/rainbowkit
```

#### **Поддерживаемые токены:**
- **ETH** (основная валюта)
- **USDT** (Tether)
- **USDC** (USD Coin)
- **DAI** (MakerDAO)

#### **Конфигурация:**
```typescript
// src/lib/wallets/ethereum-config.ts
import { mainnet, polygon, arbitrum } from 'wagmi/chains';

export const supportedChains = [mainnet, polygon, arbitrum];
export const tokenContracts = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86a33E6441B8C8C0fC6F0d6e5C56d3bC4b8C0',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
};
```

### **3. Solana (SOL) + SPL токены**

#### **Подключение:**
```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/web3.js
```

#### **Поддерживаемые кошельки:**
- **Phantom** (основной)
- **Solflare**
- **Slope**
- **Sollet**

#### **Конфигурация:**
```typescript
// src/lib/wallets/solana-config.ts
import { clusterApiUrl } from '@solana/web3.js';

export const SOLANA_NETWORK = process.env.NODE_ENV === 'production' 
  ? 'mainnet-beta' 
  : 'devnet';

export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
  clusterApiUrl(SOLANA_NETWORK);
```

---

## 💳 **Традиционные платежные системы** {#traditional-payments}

### **1. Stripe (международные карты)**

#### **Подключение:**
```bash
npm install stripe @stripe/stripe-js
```

#### **Переменные окружения:**
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### **Поддерживаемые методы:**
- Visa, MasterCard, American Express
- Apple Pay, Google Pay
- SEPA (Европа)
- iDEAL (Нидерланды)

### **2. ЮMoney (Яндекс.Деньги)**

#### **Для российского рынка:**
```bash
npm install yoomoney-sdk
```

#### **Переменные окружения:**
```env
YOOMONEY_SHOP_ID=your_shop_id
YOOMONEY_SECRET_KEY=your_secret_key
```

#### **Поддерживаемые методы:**
- Банковские карты (Visa, MasterCard, МИР)
- Яндекс.Деньги кошелек
- Сбербанк Онлайн
- Альфа-Клик
- WebMoney

### **3. QIWI Wallet**

#### **Подключение:**
```bash
npm install qiwi-sdk
```

#### **Переменные окружения:**
```env
QIWI_SECRET_KEY=your_secret_key
QIWI_PUBLIC_KEY=your_public_key
```

### **4. PayPal (международные платежи)**

#### **Подключение:**
```bash
npm install @paypal/react-paypal-js
```

#### **Переменные окружения:**
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

---

## ⭐ **Telegram Payments** {#telegram-payments}

### **1. Telegram Stars (рекомендуется)**

#### **Преимущества:**
- Нативная интеграция с Telegram
- Низкие комиссии (30% Telegram)
- Простая реализация
- Автоматическая обработка платежей

#### **Реализация:**
```typescript
// src/lib/telegram-payments.ts
import { WebApp } from '@twa-dev/types';

export const initTelegramPayment = (amount: number) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    tg.showPopup({
      title: 'Покупка монет',
      message: `Купить ${amount * 500} игровых монет за ${amount} Stars?`,
      buttons: [
        { type: 'ok', text: 'Купить' },
        { type: 'cancel' }
      ]
    }, (buttonId) => {
      if (buttonId === 'ok') {
        // Инициируем платеж через Stars
        tg.openInvoice(`https://t.me/invoice/${generateInvoiceId()}`);
      }
    });
  }
};
```

### **2. Telegram Bot Payments**

#### **Поддерживаемые провайдеры:**
- **Stripe** (международные карты)
- **ЮKassa** (Россия)
- **LiqPay** (Украина)
- **Payme** (Узбекистан)

#### **Настройка бота:**
```typescript
// src/lib/telegram-bot-payments.ts
export const createInvoice = async (
  userId: number,
  amount: number,
  description: string
) => {
  const invoice = {
    title: 'Покупка игровых монет',
    description,
    payload: `user_${userId}_coins_${amount * 500}`,
    provider_token: process.env.TELEGRAM_PAYMENT_TOKEN,
    currency: 'RUB',
    prices: [{
      label: 'Игровые монеты',
      amount: amount * 8000 // 80 рублей = 8000 копеек
    }]
  };
  
  return bot.createInvoiceLink(invoice);
};
```

---

## 🔧 **Интеграция с API** {#api-integration}

### **Структура API роутов:**

```
src/app/api/
├── payments/
│   ├── crypto/
│   │   ├── ton/route.ts          # TON платежи
│   │   ├── ethereum/route.ts     # Ethereum платежи
│   │   └── solana/route.ts       # Solana платежи
│   ├── traditional/
│   │   ├── stripe/route.ts       # Stripe
│   │   ├── yoomoney/route.ts     # ЮMoney
│   │   └── qiwi/route.ts         # QIWI
│   ├── telegram/
│   │   ├── stars/route.ts        # Telegram Stars
│   │   └── invoice/route.ts      # Bot Payments
│   └── webhooks/
│       ├── stripe/route.ts       # Stripe webhooks
│       ├── yoomoney/route.ts     # ЮMoney webhooks
│       └── telegram/route.ts     # Telegram webhooks
```

### **Пример API роута для обработки платежей:**

```typescript
// src/app/api/payments/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, paymentMethod, amount, currency } = await req.json();
    
    // Создаем запись транзакции
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        payment_method: paymentMethod,
        amount_fiat: amount,
        currency,
        amount_coins: calculateGameCoins(amount, currency),
        status: 'pending'
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Инициируем платеж в зависимости от метода
    let paymentResult;
    switch (paymentMethod) {
      case 'stripe':
        paymentResult = await processStripePayment(transaction);
        break;
      case 'ton':
        paymentResult = await processTONPayment(transaction);
        break;
      case 'telegram_stars':
        paymentResult = await processTelegramStarsPayment(transaction);
        break;
      default:
        throw new Error('Unsupported payment method');
    }
    
    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      payment_url: paymentResult.payment_url
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🛡️ **Безопасность и соответствие** {#security}

### **1. Обязательные меры безопасности:**

#### **Webhook подписи:**
```typescript
// Проверка подписи Stripe
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

// Проверка подписи Telegram
const secretToken = crypto
  .createHmac('sha256', process.env.BOT_TOKEN)
  .update(req.body)
  .digest('hex');
```

#### **Rate limiting:**
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 запросов в минуту
});

export const checkPaymentRateLimit = async (userId: string) => {
  const { success } = await ratelimit.limit(`payment:${userId}`);
  return success;
};
```

### **2. Соответствие требованиям:**

#### **PCI DSS (для карточных платежей):**
- Используйте только сертифицированные провайдеры (Stripe, Square)
- Никогда не храните данные карт на своих серверах
- Используйте HTTPS для всех платежных операций

#### **AML/KYC (для криптовалют):**
- Мониторинг подозрительных транзакций
- Блокировка адресов из санкционных списков
- Логирование всех операций

#### **GDPR/Персональные данные:**
- Минимизация сбора данных
- Шифрование чувствительной информации
- Право на удаление данных

---

## 🚀 **Пошаговая реализация** {#implementation}

### **Этап 1: Базовая настройка (1-2 дня)**

1. **Настройка Supabase таблиц:**
```sql
-- Таблица транзакций
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  amount_fiat DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  amount_coins INTEGER NOT NULL,
  transaction_hash VARCHAR(255),
  payment_provider_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Индексы
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
```

2. **Настройка переменных окружения:**
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# TON
NEXT_PUBLIC_TON_MANIFEST_URL=https://your-domain.com/tonconnect-manifest.json

# Telegram
BOT_TOKEN=your_bot_token
TELEGRAM_PAYMENT_TOKEN=your_payment_token

# ЮMoney
YOOMONEY_SHOP_ID=your_shop_id
YOOMONEY_SECRET_KEY=your_secret_key

# QIWI
QIWI_SECRET_KEY=your_secret_key
QIWI_PUBLIC_KEY=your_public_key
```

### **Этап 2: Криптовалютные кошельки (2-3 дня)**

1. **TON Integration:**
   - ✅ Уже реализовано в `src/lib/wallets/ton-connector.ts`
   - Добавить обработку платежей
   - Настроить webhook для подтверждения транзакций

2. **Ethereum Integration:**
   - Настроить Wagmi + RainbowKit
   - Добавить поддержку USDT/USDC
   - Реализовать мониторинг транзакций

3. **Solana Integration:**
   - Настроить Phantom Wallet
   - Добавить поддержку SPL токенов
   - Реализовать подтверждение платежей

### **Этап 3: Telegram Payments (1-2 дня)**

1. **Telegram Stars:**
   - Настроить в @BotFather
   - Реализовать создание invoice
   - Обработка successful_payment

2. **Bot Payments:**
   - Настроить payment provider
   - Создать invoice API
   - Webhook обработка

### **Этап 4: Традиционные платежи (3-4 дня)**

1. **Stripe:**
   - Payment Intents API
   - Webhook обработка
   - Возвраты и споры

2. **ЮMoney:**
   - Форма оплаты
   - Уведомления о платежах
   - Возвраты

3. **QIWI:**
   - Выставление счетов
   - Проверка статуса
   - Webhook уведомления

### **Этап 5: UI/UX (2-3 дня)**

1. **Компонент выбора способа оплаты:**
```typescript
// src/components/PaymentMethodSelector.tsx
export const PaymentMethodSelector = () => {
  return (
    <VStack gap={4}>
      <Text fontSize="xl" fontWeight="bold">Выберите способ оплаты</Text>
      
      {/* Криптовалюты */}
      <VStack gap={2}>
        <Text fontWeight="semibold">Криптовалюты</Text>
        <HStack gap={3}>
          <PaymentButton icon={<TonIcon />} name="TON" />
          <PaymentButton icon={<EthIcon />} name="Ethereum" />
          <PaymentButton icon={<SolIcon />} name="Solana" />
        </HStack>
      </VStack>
      
      {/* Telegram */}
      <VStack gap={2}>
        <Text fontWeight="semibold">Telegram</Text>
        <HStack gap={3}>
          <PaymentButton icon={<StarIcon />} name="Telegram Stars" />
          <PaymentButton icon={<TelegramIcon />} name="Bot Payments" />
        </HStack>
      </VStack>
      
      {/* Карты */}
      <VStack gap={2}>
        <Text fontWeight="semibold">Банковские карты</Text>
        <HStack gap={3}>
          <PaymentButton icon={<StripeIcon />} name="Stripe" />
          <PaymentButton icon={<YooMoneyIcon />} name="ЮMoney" />
        </HStack>
      </VStack>
    </VStack>
  );
};
```

2. **История транзакций:**
   - ✅ Уже реализовано в `WalletManager`
   - Добавить фильтры по методам оплаты
   - Статусы транзакций

### **Этап 6: Тестирование (2-3 дня)**

1. **Тестовые платежи:**
   - Каждый метод оплаты
   - Успешные и неуспешные сценарии
   - Webhook обработка

2. **Нагрузочное тестирование:**
   - Одновременные платежи
   - Rate limiting
   - База данных производительность

---

## 📊 **Рекомендуемые комиссии и лимиты**

| Метод оплаты | Комиссия | Мин. сумма | Макс. сумма | Время обработки |
|--------------|----------|------------|-------------|-----------------|
| **TON** | 1-2% | $1 | $10,000 | 1-5 мин |
| **Ethereum** | 2-5% | $5 | $50,000 | 5-30 мин |
| **Solana** | 1-3% | $1 | $25,000 | 1-10 мин |
| **Telegram Stars** | 30% (Telegram) | $0.5 | $1,000 | Мгновенно |
| **Stripe** | 2.9% + $0.30 | $0.50 | $999,999 | Мгновенно |
| **ЮMoney** | 3-5% | ₽50 | ₽500,000 | 1-24 часа |
| **QIWI** | 2-4% | ₽10 | ₽100,000 | 1-24 часа |

---

## 🎯 **Приоритетность внедрения**

### **Высокий приоритет (реализовать первыми):**
1. **TON Wallet** - основная криптовалюта для Telegram игр
2. **Telegram Stars** - нативная интеграция с Telegram
3. **Ethereum + USDT** - популярность и стабильность

### **Средний приоритет:**
4. **Solana** - низкие комиссии, быстрые транзакции
5. **Stripe** - международные пользователи
6. **ЮMoney** - российский рынок

### **Низкий приоритет:**
7. **QIWI** - дополнительный охват России/СНГ
8. **PayPal** - международные пользователи (альтернатива Stripe)

---

## ⚠️ **Важные замечания**

1. **Соблюдение законодательства:**
   - Разные страны имеют разные требования к платежам
   - Консультируйтесь с юристами по финансовому праву
   - Учитывайте налогообложение криптовалютных операций

2. **Мониторинг и аналитика:**
   - Отслеживайте конверсию по каждому методу
   - Анализируйте отказы и причины
   - A/B тестируйте UI платежных форм

3. **Техническая поддержка:**
   - Готовьтесь к вопросам по платежам
   - Документируйте процедуры возвратов
   - Создайте FAQ по платежам

4. **Резервное копирование:**
   - Регулярно бэкапьте данные транзакций
   - Храните логи всех платежных операций
   - Имейте план восстановления после сбоев

---

## 📞 **Контакты для настройки**

### **Криптовалютные сервисы:**
- **TON:** https://docs.ton.org/develop/dapps/payment-processing
- **Ethereum:** https://ethereum.org/developers/
- **Solana:** https://docs.solana.com/developing/clients

### **Традиционные платежи:**
- **Stripe:** https://stripe.com/docs
- **ЮMoney:** https://yoomoney.ru/docs/
- **QIWI:** https://developer.qiwi.com/

### **Telegram:**
- **Bot Payments:** https://core.telegram.org/bots/payments
- **Stars:** https://core.telegram.org/bots/payments#stars

---

**Успешной интеграции! 🚀💰**
