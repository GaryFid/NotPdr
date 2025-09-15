import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyTelegramInitData } from '../../../lib/telegram';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;

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
  console.log('🚀 SUPABASE Auth API вызван');
  
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET не найден');
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка конфигурации сервера: JWT_SECRET отсутствует' 
    }, { status: 500 });
  }

  // Проверяем Supabase подключение
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase переменные не настроены');
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка конфигурации базы данных' 
    }, { status: 500 });
  }

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
    console.log('👤 Локальная авторизация через Supabase');
    
    const parsed = LocalAuthSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Ошибка валидации локальных данных:', parsed.error);
      return NextResponse.json({ 
        success: false, 
        message: 'Неверные данные для входа' 
      }, { status: 400 });
    }

    const { username, password } = parsed.data;

    try {
      console.log('🔍 Поиск пользователя в Supabase:', username);

      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, firstName, lastName, avatar, passwordHash, coins, rating, gamesPlayed, gamesWon, referralCode')
        .eq('username', username)
        .limit(1);

      if (error) {
        console.error('❌ Ошибка Supabase при поиске пользователя:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка подключения к базе данных',
          details: error.message 
        }, { status: 500 });
      }

      const user = users && users[0];
      if (!user) {
        console.log('❌ Пользователь не найден:', username);
        return NextResponse.json({ 
          success: false, 
          message: 'Пользователь не найден' 
        }, { status: 404 });
      }

      console.log('✅ Пользователь найден:', user.username);

      // Проверка пароля (если есть хэш)
      if (user.passwordHash) {
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          console.log('❌ Неверный пароль для:', username);
          return NextResponse.json({ 
            success: false, 
            message: 'Неверный пароль' 
          }, { status: 401 });
        }
      }

      // Обновление статуса пользователя
      try {
        await supabase
          .from('user_status')
          .upsert({
            user_id: user.id,
            status: 'online',
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (statusError) {
        console.warn('⚠️ Не удалось обновить статус пользователя:', statusError);
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

      console.log('✅ Успешная авторизация:', user.username);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          coins: user.coins || 1000,
          rating: user.rating || 1000,
          gamesPlayed: user.gamesPlayed || 0,
          gamesWon: user.gamesWon || 0,
          referralCode: user.referralCode
        },
        message: 'Успешный вход!'
      });

    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Ошибка сервера при авторизации' 
      }, { status: 500 });
    }
  }

  // 2. Авторизация через Telegram WebApp
  if (body.type === 'telegram') {
    console.log('📱 Telegram авторизация через Supabase');
    
    const parsed = TelegramAuthSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Ошибка валидации Telegram данных:', parsed.error);
      return NextResponse.json({ 
        success: false, 
        message: 'Неверные Telegram данные' 
      }, { status: 400 });
    }

    const { id, username, first_name, last_name, photo_url, initData } = parsed.data;
    console.log('👤 Данные пользователя Telegram:', { id, username, first_name, last_name });

    // Проверка Telegram данных (если есть BOT_TOKEN)
    if (BOT_TOKEN && initData && initData !== 'demo_init_data') {
      try {
        if (!verifyTelegramInitData(initData, BOT_TOKEN)) {
          console.error('❌ Неверные Telegram init данные');
          return NextResponse.json({ 
            success: false, 
            message: 'Неверные Telegram данные' 
          }, { status: 401 });
        }
      } catch (error) {
        console.error('❌ Ошибка проверки Telegram данных:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка проверки Telegram данных' 
        }, { status: 401 });
      }
    } else {
      console.warn('⚠️ BOT_TOKEN не настроен или демо режим, пропускаем проверку');
    }

    const idStr = id.toString();

    try {
      console.log('🔍 Поиск Telegram пользователя в Supabase:', idStr);

      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, firstName, lastName, avatar, telegramId, referralCode, coins, rating, gamesPlayed, gamesWon')
        .eq('telegramId', idStr)
        .limit(1);

      if (error) {
        console.error('❌ Ошибка Supabase при поиске Telegram пользователя:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка подключения к базе данных',
          details: error.message 
        }, { status: 500 });
      }

      let user = users && users[0];
      
      if (!user) {
        // Создание нового пользователя
        console.log('🆕 Создание нового Telegram пользователя');

        // Генерация уникального referralCode
        let referralCode = null;
        let attempts = 0;
        while (attempts < 5) {
          referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const { data: existingCode } = await supabase
            .from('users')
            .select('id')
            .eq('referralCode', referralCode)
            .limit(1);
          
          if (!existingCode || existingCode.length === 0) break;
          attempts++;
        }

        const newUserData = {
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
          referralCode: referralCode || 'TG' + Date.now().toString().slice(-4)
        };

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error('❌ Ошибка создания Telegram пользователя:', createError);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка создания пользователя',
            details: createError.message 
          }, { status: 500 });
        }

        user = newUser;
        console.log('✅ Создан новый Telegram пользователь:', user.username);

        // Создание статуса пользователя
        try {
          await supabase
            .from('user_status')
            .insert({
              user_id: user.id,
              status: 'online',
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (statusError) {
          console.warn('⚠️ Не удалось создать статус пользователя:', statusError);
        }
      } else {
        console.log('✅ Найден существующий Telegram пользователь:', user.username);
        
        // Обновление данных пользователя
        const updateData: any = {};
        if (first_name && first_name !== user.firstName) updateData.firstName = first_name;
        if (last_name && last_name !== user.lastName) updateData.lastName = last_name;
        if (photo_url && photo_url !== user.avatar) updateData.avatar = photo_url;

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);
          
          Object.assign(user, updateData);
        }

        // Обновление статуса
        try {
          await supabase
            .from('user_status')
            .upsert({
              user_id: user.id,
              status: 'online',
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (statusError) {
          console.warn('⚠️ Не удалось обновить статус пользователя:', statusError);
        }
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

      console.log('✅ Успешная Telegram авторизация:', user.username);

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

    } catch (error) {
      console.error('❌ Ошибка Telegram авторизации:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Ошибка сервера при Telegram авторизации' 
      }, { status: 500 });
    }
  }

  return NextResponse.json({ 
    success: false, 
    message: 'Неизвестный тип авторизации' 
  }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    status: 'SUPABASE Auth API работает!',
    timestamp: new Date().toISOString(),
    supabase: !!process.env.SUPABASE_URL,
    jwt: !!process.env.JWT_SECRET,
    bot: !!process.env.BOT_TOKEN
  });
}
