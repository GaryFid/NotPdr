import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// ВРЕМЕННОЕ ХРАНИЛИЩЕ ПОЛЬЗОВАТЕЛЕЙ (работает без Supabase)
const users = new Map();
let userIdCounter = 1;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-demo-12345678901234567890';

const LocalAuthSchema = z.object({
  type: z.literal('local'),
  username: z.string().min(1).max(64),
  password: z.string().min(6).max(128),
});

const TelegramAuthSchema = z.object({
  type: z.literal('telegram'),
  id: z.union([z.string(), z.number()]),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  photo_url: z.string().optional(),
  initData: z.string().optional(),
});

export async function POST(req: NextRequest) {
  console.log('🚀 РАБОЧИЙ Auth API вызван');
  
  let body: any;
  try {
    body = await req.json();
    console.log('📝 Данные запроса:', JSON.stringify(body, null, 2));
  } catch (error) {
    console.error('❌ Ошибка парсинга JSON:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Неверный формат JSON' 
    }, { status: 400 });
  }

  if (!body || typeof body.type !== 'string') {
    console.error('❌ Неверное тело запроса:', body);
    return NextResponse.json({ 
      success: false, 
      message: 'Неверный формат запроса' 
    }, { status: 400 });
  }

  // 1. Локальная авторизация
  if (body.type === 'local') {
    console.log('👤 Локальная авторизация');
    
    const parsed = LocalAuthSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Ошибка валидации локальных данных:', parsed.error);
      return NextResponse.json({ 
        success: false, 
        message: 'Неверные данные для входа' 
      }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const userKey = `local_${username}`;
    
    // Проверяем существует ли пользователь
    let user = users.get(userKey);
    
    if (!user) {
      // Создаем нового пользователя
      user = {
        id: `user_${userIdCounter++}`,
        username,
        firstName: username,
        lastName: '',
        avatar: null,
        authType: 'local',
        coins: 1000,
        rating: 1000,
        gamesPlayed: 0,
        gamesWon: 0,
        referralCode: 'LOCAL' + Date.now().toString().slice(-4),
        createdAt: new Date().toISOString()
      };
      users.set(userKey, user);
      console.log('✅ Создан новый локальный пользователь:', user.username);
    } else {
      console.log('✅ Найден существующий пользователь:', user.username);
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        type: 'local'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        coins: user.coins,
        rating: user.rating,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        referralCode: user.referralCode
      },
      message: 'Успешный вход!'
    });
  }

  // 2. Авторизация через Telegram WebApp
  if (body.type === 'telegram') {
    console.log('📱 Telegram авторизация');
    
    const parsed = TelegramAuthSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Ошибка валидации Telegram данных:', parsed.error);
      return NextResponse.json({ 
        success: false, 
        message: 'Неверные Telegram данные' 
      }, { status: 400 });
    }

    const { id, username, first_name, last_name, photo_url } = parsed.data;
    console.log('👤 Данные пользователя Telegram:', { id, username, first_name, last_name });

    const idStr = id.toString();
    const userKey = `telegram_${idStr}`;
    
    // Проверяем существует ли пользователь
    let user = users.get(userKey);
    
    if (!user) {
      // Создаем нового пользователя
      user = {
        id: `user_${userIdCounter++}`,
        telegramId: idStr,
        username: username || first_name || `user${idStr}`,
        firstName: first_name || '',
        lastName: last_name || '',
        avatar: photo_url,
        authType: 'telegram',
        coins: 1000,
        rating: 1000,
        gamesPlayed: 0,
        gamesWon: 0,
        referralCode: 'TG' + Date.now().toString().slice(-4),
        createdAt: new Date().toISOString()
      };
      users.set(userKey, user);
      console.log('✅ Создан новый Telegram пользователь:', user.username);
    } else {
      console.log('✅ Найден существующий Telegram пользователь:', user.username);
      
      // Обновляем данные пользователя
      user.firstName = first_name || user.firstName;
      user.lastName = last_name || user.lastName;
      user.avatar = photo_url || user.avatar;
      users.set(userKey, user);
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { 
        userId: user.id, 
        telegramId: user.telegramId,
        username: user.username,
        type: 'telegram'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        coins: user.coins,
        rating: user.rating,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        referralCode: user.referralCode
      },
      message: 'Успешный Telegram вход!'
    });
  }

  return NextResponse.json({ 
    success: false, 
    message: 'Неизвестный тип авторизации' 
  }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    status: 'РАБОЧИЙ Auth API работает!',
    timestamp: new Date().toISOString(),
    usersCount: users.size,
    message: 'Система авторизации готова к работе'
  });
}