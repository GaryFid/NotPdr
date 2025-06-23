import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../../lib/redis';
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

function generateGameId() {
  return Math.random().toString(36).substr(2, 9);
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { withAI = false } = await req.json();

  const gameId = generateGameId();
  const game = {
    id: gameId,
    status: 'waiting',
    players: [{ userId, isBot: false }],
    deck: [],
    discardPile: [],
    withAI,
    gameStage: 'init',
    currentPlayerId: userId,
    startTime: new Date().toISOString(),
    gameData: {},
  };
  await redis.set(`game:${gameId}`, JSON.stringify(game));

  return NextResponse.json({ success: true, game });
} 