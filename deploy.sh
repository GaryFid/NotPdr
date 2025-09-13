#!/bin/bash

# 🚀 P.I.D.R. Мультиплеер Деплой Скрипт

echo "🎮 P.I.D.R. Мультиплеер - Деплой"
echo "================================="

# Проверка наличия Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo "📦 Устанавливаем Railway CLI..."
    npm install -g @railway/cli
fi

# Проверка авторизации Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Авторизация в Railway..."
    railway login
fi

echo "🚀 Деплой backend на Railway..."
cd server
railway up

echo "✅ Backend деплоен!"
echo "📋 Скопируйте URL из Railway Dashboard"
echo "🔧 Обновите переменные в Vercel:"
echo "   NEXT_PUBLIC_WS_URL=wss://your-railway-url.railway.app"
echo "   NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app"

echo "🎉 Готово! Мультиплеер P.I.D.R. развернут!"
