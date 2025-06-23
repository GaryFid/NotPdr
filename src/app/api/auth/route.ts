import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const BOT_USERNAME = process.env.BOT_USERNAME || '';
const APP_URL = process.env.APP_URL || '';
const BASE_URL = process.env.BASE_URL || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 1. Локальная авторизация
  if (body.type === 'local') {
    const { username, password } = body;
    const user = await prisma.user.findUnique({ where: { username } });
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

    let user = await prisma.user.findUnique({ where: { telegramId: id.toString() } });
    if (!user) {
      // Генерация уникального referralCode
      let referralCode: string | null = null;
      let exists = true;
      while (exists) {
        referralCode = generateReferralCode();
        exists = !!(await prisma.user.findUnique({ where: { referralCode } }));
      }
      user = await prisma.user.create({
        data: {
          telegramId: id.toString(),
          username: username || first_name || 'Игрок',
          firstName: first_name,
          lastName: last_name,
          avatar: photo_url,
          authType: 'telegram',
          registrationDate: new Date(),
          rating: 1000,
          gamesPlayed: 0,
          gamesWon: 0,
          referralCode,
        }
      });
    } else {
      // Обновим данные если изменились
      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: username || first_name || 'Игрок',
          firstName: first_name,
          lastName: last_name,
          avatar: photo_url,
        }
      });
    }
    const token = jwt.sign({ userId: user.id, telegramId: user.telegramId }, JWT_SECRET, { expiresIn: '30d' });
    return NextResponse.json({ success: true, token, user });
  }

  return NextResponse.json({ success: false, message: 'Unknown auth type' }, { status: 400 });
}

// Генерация реферального кода
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
} 