import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Создаем mock Redis если переменные не заданы (для сборки)
class MockRedis {
  async get(key: string) { return null; }
  async set(key: string, value: any, options?: any) { return 'OK'; }
  async del(key: string) { return 1; }
  async expire(key: string, seconds: number) { return 1; }
  async incr(key: string) { return 1; }
  async decr(key: string) { return 1; }
}

// Проверяем, что оба параметра существуют и не пустые
const isRedisConfigured = url && token && 
  url !== '<!-- ВСТАВЬ_СЮДА -->' && 
  !url.includes('your-redis') &&
  url.startsWith('https://') &&
  token.length > 10;

export const redis = isRedisConfigured 
  ? new Redis({ url, token })
  : new MockRedis() as any;

export const APP_URL = process.env.APP_URL || '';
export const BASE_URL = process.env.BASE_URL || ''; 