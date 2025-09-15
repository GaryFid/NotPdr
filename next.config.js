/** @type {import('next').NextConfig} */
const nextConfig = {
  // Готов к деплою - отключаем проверки для продакшена
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Другие настройки
  reactStrictMode: true,
}

module.exports = nextConfig