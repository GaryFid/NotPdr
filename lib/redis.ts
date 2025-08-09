import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error('Redis env vars missing: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
}

export const redis = new Redis({
  url,
  token,
});

export const APP_URL = process.env.APP_URL || '';
export const BASE_URL = process.env.BASE_URL || ''; 