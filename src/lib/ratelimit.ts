import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '../../lib/redis'
import { NextRequest } from 'next/server'

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
})

export function getRateLimitId(req: NextRequest, fallback: string = 'anonymous'): string {
  const auth = req.headers.get('authorization') || ''
  const forwarded = req.headers.get('x-forwarded-for') || ''
  const ip = (forwarded.split(',')[0] || '').trim()
  if (auth) return `auth:${auth.slice(0, 50)}`
  if (ip) return `ip:${ip}`
  return fallback
} 