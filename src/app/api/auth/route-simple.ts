// ПРОСТОЙ API авторизации БЕЗ SessionManager (временно)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;

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
  console.log('🚀 SIMPLE Auth API вызван (без SessionManager)');

  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET не найден');
    return NextResponse.json({ 
      success: false, 
      message: 'JWT_SECRET не настроен' 
    }, { status: 500 });
  }

  // Проверяем обязательное наличие Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ БАЗА ДАННЫХ НЕ НАСТРОЕНА!');
    return NextResponse.json({
      success: false,
      message: 'База данных не настроена',
      error: 'DATABASE_NOT_CONFIGURED'
    }, { status: 500 });
  }

  try {
    const body = await req.json();

    if (!body || typeof body.type !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'Неверный формат запроса' 
      }, { status: 400 });
    }

    // 1. Локальная авторизация
    if (body.type === 'local') {
      const parsed = LocalAuthSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ 
          success: false, 
          message: 'Неверные данные для входа' 
        }, { status: 400 });
      }

      const { username, password } = parsed.data;

      console.log('🔍 Поиск пользователя в БД:', username);

      const { data: users, error } = await supabase
        .from('_pidr_users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .limit(1);

      if (error) {
        console.error('❌ Ошибка поиска в БД:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка базы данных' 
        }, { status: 500 });
      }

      if (!users || users.length === 0) {
        console.warn('⚠️ Пользователь не найден в БД:', username);
        return NextResponse.json({ 
          success: false, 
          message: 'Пользователь не найден. Зарегистрируйтесь сначала.' 
        }, { status: 401 });
      }

      const user = users[0];

      // TODO: Добавить проверку пароля
      console.log('⚠️ Проверка пароля пропущена (в разработке)');

      // Создаем ПРОСТОЙ JWT токен без сессий
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          type: 'local'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Обновляем статус пользователя
      await supabase
        .from('_pidr_user_status')
        .upsert({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      console.log('✅ Успешная локальная авторизация из БД:', user.username);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatar: user.avatar_url,
          coins: user.coins || 1000,
          rating: user.rating || 1000,
          gamesPlayed: user.games_played || 0,
          gamesWon: user.games_won || 0,
          referralCode: user.referral_code
        },
        message: 'Успешный вход из базы данных!'
      });
    }

    // 2. Telegram авторизация
    if (body.type === 'telegram') {
      const parsed = TelegramAuthSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ 
          success: false, 
          message: 'Неверные Telegram данные' 
        }, { status: 400 });
      }

      const { id, username, first_name, last_name, photo_url } = parsed.data;
      const telegramId = id.toString();

      console.log('🔍 Поиск Telegram пользователя в БД:', telegramId);

      let { data: users, error: findError } = await supabase
        .from('_pidr_users')
        .select('*')
        .eq('telegram_id', telegramId);

      if (findError) {
        console.error('❌ Ошибка поиска Telegram пользователя:', findError);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка поиска в базе данных' 
        }, { status: 500 });
      }

      let user;

      if (!users || users.length === 0) {
        console.log('👤 Создаем нового Telegram пользователя в БД');

        const newUserData = {
          telegram_id: telegramId,
          username: username || first_name || `user${telegramId}`,
          first_name: first_name || '',
          last_name: last_name || '',
          avatar_url: photo_url || null,
          coins: 1000,
          rating: 1000,
          games_played: 0,
          games_won: 0,
          referral_code: 'TG' + Date.now().toString().slice(-4),
          created_at: new Date().toISOString()
        };

        const { data: newUser, error: createError } = await supabase
          .from('_pidr_users')
          .insert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error('❌ Ошибка создания Telegram пользователя в БД:', createError);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка создания пользователя в базе данных' 
          }, { status: 500 });
        }

        user = newUser;
        console.log('✅ Новый Telegram пользователь создан в БД:', user.username);

      } else {
        user = users[0];
        
        // Обновляем данные пользователя если изменились
        const updateData: any = {};
        if (first_name && first_name !== user.first_name) updateData.first_name = first_name;
        if (last_name && last_name !== user.last_name) updateData.last_name = last_name;
        if (photo_url && photo_url !== user.avatar_url) updateData.avatar_url = photo_url;
        if (username && username !== user.username) updateData.username = username;

        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('_pidr_users')
            .update(updateData)
            .eq('id', user.id);

          if (!updateError) {
            Object.assign(user, updateData);
            console.log('✅ Данные Telegram пользователя обновлены в БД');
          }
        }

        console.log('✅ Найден существующий Telegram пользователь в БД:', user.username);
      }

      // Создаем ПРОСТОЙ JWT токен без сессий
      const token = jwt.sign(
        { 
          userId: user.id, 
          telegramId: user.telegram_id,
          username: user.username,
          type: 'telegram'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Обновляем статус пользователя
      await supabase
        .from('_pidr_user_status')
        .upsert({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      console.log('✅ Успешная Telegram авторизация в БД:', user.username);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatar: user.avatar_url,
          coins: user.coins || 1000,
          rating: user.rating || 1000,
          gamesPlayed: user.games_played || 0,
          gamesWon: user.games_won || 0,
          referralCode: user.referral_code
        },
        message: 'Успешный Telegram вход в базу данных!'
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Неподдерживаемый тип авторизации' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка сервера при авторизации' 
    }, { status: 500 });
  }
}
