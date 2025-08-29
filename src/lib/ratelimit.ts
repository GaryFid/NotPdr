import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from 'next/server';

// Создаем Redis клиент (может быть заменен на другой provider)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'redis://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Создаем rate limiter
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 запросов в 10 секунд
  analytics: true,
});

// Получаем ID для rate limiting из запроса
export function getRateLimitId(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || '127.0.0.1';
  
  // Можно также использовать user ID если доступен
  const auth = req.headers.get('authorization');
  if (auth) {
    const token = auth.replace('Bearer ', '');
    return `user:${token.slice(-8)}`; // Последние 8 символов токена
  }
  
  return `ip:${ip}`;
}