/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 't.me'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },
  // Разрешаем внешние подключения для WebSocket
  async rewrites() {
    return [
      {
        source: '/api/socket/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/socket/:path*`,
      },
    ];
  },
  // Настройки для production
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    // Фиксы для WebSocket клиента
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
