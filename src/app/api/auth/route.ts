import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 1. Локальная авторизация
  if (body.type === 'local') {
    const { username, password } = body;
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);
    const user = users && users[0];
    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Неверный пароль' }, { status: 401 });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    return NextResponse.json({ success: true, token, user });
  }

  // 2. Авторизация через Telegram WebApp
  if (body.type === 'telegram') {
    const { id, username, first_name, last_name, photo_url } = body;
    if (!id) return NextResponse.json({ success: false, message: 'No telegram id' }, { status: 400 });

    let { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('telegramId', id.toString())
      .limit(1);
    let user = users && users[0];
    if (!user) {
      // Генерация уникального referralCode
      let referralCode = null;
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
      const { data: newUsers } = await supabase
        .from('users')
        .insert([
          {
            telegramId: id.toString(),
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
        .select('*');
      user = newUsers && newUsers[0];
    } else {
      // Обновим данные если изменились
      await supabase
        .from('users')
        .update({
          username: username || first_name || 'Игрок',
          firstName: first_name,
          lastName: last_name,
          avatar: photo_url,
        })
        .eq('id', user.id);
    }
    const token = jwt.sign({ userId: user.id, telegramId: user.telegramId }, JWT_SECRET, { expiresIn: '30d' });
    return NextResponse.json({ success: true, token, user });
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