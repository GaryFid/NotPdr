import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getRateLimitId } from '../../../../lib/ratelimit';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;

const RegisterSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчеркивания'),
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать как минимум одну строчную букву, одну заглавную букву и одну цифру')
});

export async function POST(req: NextRequest) {
  // Rate limiting
  const id = getRateLimitId(req);
  const { success } = await checkRateLimit(`register:${id}`);
  if (!success) {
    return NextResponse.json({ success: false, message: 'Слишком много попыток регистрации' }, { status: 429 });
  }

  if (!JWT_SECRET) {
    return NextResponse.json({ success: false, message: 'Server misconfigured: JWT secret missing' }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(err => err.message).join(', ');
    return NextResponse.json({ success: false, message: errors }, { status: 400 });
  }

  const { username, email, password } = parsed.data;

  try {
    // Проверяем, существует ли уже пользователь с таким username или email
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`username.eq.${username},email.eq.${email}`);

    if (checkError) {
      return NextResponse.json({ success: false, message: 'Ошибка проверки пользователя' }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        return NextResponse.json({ success: false, message: 'Пользователь с таким логином уже существует' }, { status: 409 });
      }
      if (existingUser.email === email) {
        return NextResponse.json({ success: false, message: 'Пользователь с таким email уже существует' }, { status: 409 });
      }
    }

    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Генерируем уникальный реферальный код
    let referralCode: string | null = null;
    let exists = true;
    while (exists) {
      referralCode = generateReferralCode();
      const { data: refUsers } = await supabase
        .from('users')
        .select('id')
        .eq('referralCode', referralCode)
        .limit(1);
      exists = !!(refUsers && refUsers[0]);
    }

    // Создаем пользователя
    const { data: newUsers, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          firstName: username, // По умолчанию используем username как firstName
          lastName: null,
          avatar: null,
          authType: 'local',
          registrationDate: new Date().toISOString(),
          rating: 1000,
          gamesPlayed: 0,
          gamesWon: 0,
          coins: 0,
          referralCode,
        }
      ])
      .select('id, username, email, firstName, lastName, avatar, referralCode, rating, coins');

    if (insertError) {
      console.error('Insert error:', insertError);
      if (insertError.code === '23505') { // unique violation
        return NextResponse.json({ success: false, message: 'Пользователь уже существует' }, { status: 409 });
      }
      return NextResponse.json({ success: false, message: 'Ошибка создания пользователя' }, { status: 500 });
    }

    const user = newUsers && newUsers[0];
    if (!user) {
      return NextResponse.json({ success: false, message: 'Ошибка создания пользователя' }, { status: 500 });
    }

    // Создаем запись в user_status
    await supabase
      .from('user_status')
      .upsert({
        user_id: user.id,
        status: 'online',
        last_seen: new Date().toISOString()
      });

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        authType: 'local'
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // Никогда не возвращаем пароль
    const { password: _omit, ...safeUser } = user;

    return NextResponse.json({ 
      success: true, 
      token, 
      user: safeUser,
      message: 'Аккаунт успешно создан!'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
