import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const APP_URL = process.env.APP_URL || '';
export const BASE_URL = process.env.BASE_URL || ''; 