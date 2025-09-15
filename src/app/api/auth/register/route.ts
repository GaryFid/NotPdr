import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;

const RegisterSchema = z.object({
  username: z.string().min(3).max(64),
  email: z.string().email().optional(),
  password: z.string().min(6).max(128),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  console.log('🚀 SUPABASE Registration API вызван');
  
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET не найден');
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка конфигурации сервера: JWT_SECRET отсутствует' 
    }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
    console.log('📝 Данные регистрации:', JSON.stringify({ ...body, password: '[СКРЫТО]' }, null, 2));
  } catch (error) {
    console.error('❌ Ошибка парсинга JSON:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Неверный формат JSON' 
    }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    console.error('❌ Ошибка валидации данных регистрации:', parsed.error);
    return NextResponse.json({ 
      success: false, 
      message: 'Неверные данные для регистрации',
      errors: parsed.error.errors
    }, { status: 400 });
  }

  const { username, email, password, firstName, lastName } = parsed.data;

  try {
    console.log('🔍 Проверка существования пользователя:', username);

    // Проверяем не существует ли уже такой пользователь
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`username.eq.${username}${email ? `,email.eq.${email}` : ''}`)
      .limit(1);

    if (checkError) {
      console.error('❌ Ошибка Supabase при проверке пользователя:', checkError);
      return NextResponse.json({ 
        success: false, 
        message: 'Ошибка подключения к базе данных',
        details: checkError.message 
      }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.username === username) {
        console.log('❌ Пользователь с таким именем уже существует:', username);
        return NextResponse.json({ 
          success: false, 
          message: 'Пользователь с таким именем уже существует' 
        }, { status: 409 });
      }
      if (existing.email === email && email) {
        console.log('❌ Пользователь с таким email уже существует:', email);
        return NextResponse.json({ 
          success: false, 
          message: 'Пользователь с таким email уже существует' 
        }, { status: 409 });
      }
    }

    console.log('🔐 Хеширование пароля');
    const passwordHash = await bcrypt.hash(password, 12);

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

    console.log('👤 Создание нового пользователя в Supabase');

    const newUserData = {
      username,
      email: email || null,
      passwordHash,
      firstName: firstName || username,
      lastName: lastName || '',
      avatar: null,
      authType: 'local',
      coins: 1000,
      rating: 1000,
      gamesPlayed: 0,
      gamesWon: 0,
      referralCode: referralCode || 'REG' + Date.now().toString().slice(-4)
    };

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([newUserData])
      .select('id, username, email, firstName, lastName, avatar, coins, rating, gamesPlayed, gamesWon, referralCode')
      .single();

    if (createError) {
      console.error('❌ Ошибка создания пользователя:', createError);
      return NextResponse.json({ 
        success: false, 
        message: 'Ошибка создания пользователя',
        details: createError.message 
      }, { status: 500 });
    }

    console.log('✅ Пользователь создан:', newUser.username);

    // Создание статуса пользователя
    try {
      await supabase
        .from('user_status')
        .insert({
          user_id: newUser.id,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (statusError) {
      console.warn('⚠️ Не удалось создать статус пользователя:', statusError);
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        username: newUser.username,
        type: 'local'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Успешная регистрация:', newUser.username);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        avatar: newUser.avatar,
        coins: newUser.coins,
        rating: newUser.rating,
        gamesPlayed: newUser.gamesPlayed,
        gamesWon: newUser.gamesWon,
        referralCode: newUser.referralCode
      },
      message: 'Регистрация успешна!'
    });

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка сервера при регистрации' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'SUPABASE Registration API работает!',
    timestamp: new Date().toISOString(),
    supabase: !!process.env.SUPABASE_URL,
    jwt: !!process.env.JWT_SECRET
  });
}