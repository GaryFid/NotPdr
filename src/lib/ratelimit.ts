import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '../../lib/redis'
import { NextRequest } from 'next/server'

// Mock ratelimit если Redis не настроен
class MockRatelimit {
  async limit(key: string) {
    return { success: true, limit: 20, remaining: 19, reset: Date.now() + 60000 };
  }
}

export const ratelimit = (redis && typeof redis.incr === 'function')
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
    })
  : new MockRatelimit() as any

export function getRateLimitId(req: NextRequest, fallback: string = 'anonymous'): string {
  const auth = req.headers.get('authorization') || ''
  const forwarded = req.headers.get('x-forwarded-for') || ''
  const ip = (forwarded.split(',')[0] || '').trim()
  if (auth) return `auth:${auth.slice(0, 50)}`
  if (ip) return `ip:${ip}`
  return fallback
} 