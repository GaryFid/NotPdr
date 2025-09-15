import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyTelegramInitData } from '../../../lib/telegram';
import { checkRateLimit, getRateLimitId } from '../../../lib/ratelimit';
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
  initData: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // Rate limiting
  try {
    const id = getRateLimitId(req);
    const { success } = await checkRateLimit(`auth:${id}`);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }
  } catch (error) {
    console.warn('Rate limiting unavailable:', error);
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

  if (!body || typeof body.type !== 'string') {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }

  // 1. Локальная авторизация
  if (body.type === 'local') {
    const parsed = LocalAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 });
    }

    const { username, password } = parsed.data;

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, password, firstName, lastName, avatar, coins, rating, gamesPlayed, gamesWon, referralCode')
        .eq('username', username)
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
      }

      const user = users && users[0];
      if (!user || !user.password) {
        return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ success: false, message: 'Неверный пароль' }, { status: 401 });
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

      // Обновляем статус пользователя
      await supabase
        .from('user_status')
        .upsert({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString()
        });

      // Никогда не возвращаем password
      const { password: _omit, ...safeUser } = user;
      return NextResponse.json({ success: true, token, user: safeUser });
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
  }

  // 2. Авторизация через Telegram WebApp
  if (body.type === 'telegram') {
    const parsed = TelegramAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid Telegram payload' }, { status: 400 });
    }

    const { id, username, first_name, last_name, photo_url, initData } = parsed.data;

    // Проверка Telegram данных
    if (BOT_TOKEN && initData) {
      try {
        if (!verifyTelegramInitData(initData, BOT_TOKEN)) {
          return NextResponse.json({ success: false, message: 'Invalid Telegram init data' }, { status: 401 });
        }
      } catch (error) {
        console.error('Telegram verification error:', error);
        return NextResponse.json({ success: false, message: 'Telegram verification failed' }, { status: 401 });
      }
    } else {
      console.warn('BOT_TOKEN not configured, skipping Telegram verification');
    }

    const idStr = id.toString();

    try {

      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, firstName, lastName, avatar, telegramId, referralCode, coins, rating, gamesPlayed, gamesWon')
        .eq('telegramId', idStr)
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
      }

    let user = users && users[0];
    if (!user) {
      // Генерация уникального referralCode
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

      const { data: newUsers, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            telegramId: idStr,
            username: username || first_name || 'Игрок',
            firstName: first_name,
            lastName: last_name,
            avatar: photo_url,
            authType: 'telegram',
            registrationDate: new Date().toISOString(),
            rating: 1000,
            gamesPlayed: 0,
            gamesWon: 0,
            referralCode,
          }
        ])
        .select('id, username, firstName, lastName, avatar, telegramId, referralCode, coins, rating, gamesPlayed, gamesWon');

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({ success: false, message: 'Registration error' }, { status: 500 });
      }

      user = newUsers && newUsers[0];
    } else {
      // Обновим данные если изменились
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: username || first_name || 'Игрок',
          firstName: first_name,
          lastName: last_name,
          avatar: photo_url,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ success: false, message: 'Update error' }, { status: 500 });
      }
    }

    // Обновляем статус пользователя
    await supabase
      .from('user_status')
      .upsert({
        user_id: user.id,
        status: 'online',
        last_seen: new Date().toISOString()
      });

    const token = jwt.sign({ userId: user.id, telegramId: user.telegramId }, JWT_SECRET, { expiresIn: '30d' });
    return NextResponse.json({ success: true, token, user });
    
    } catch (error) {
      console.error('Telegram auth error:', error);
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: 'Unknown auth type' }, { status: 400 });
}

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
} 