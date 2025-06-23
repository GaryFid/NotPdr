import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const BOT_USERNAME = process.env.BOT_USERNAME || '';
const APP_URL = process.env.APP_URL || '';
const BASE_URL = process.env.BASE_URL || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';

function getUserIdFromRequest(req: NextRequest): number | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.userId;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { withAI = false } = await req.json();

  const game = await prisma.game.create({
    data: {
      status: 'waiting',
      players: JSON.stringify([{ userId, isBot: false }]),
      deck: JSON.stringify([]),
      discardPile: JSON.stringify([]),
      withAI,
      gameStage: 'init',
      currentPlayerId: userId,
      startTime: new Date(),
      gameData: JSON.stringify({}),
    }
  });

  return NextResponse.json({ success: true, game });
} 