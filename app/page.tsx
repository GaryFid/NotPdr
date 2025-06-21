import React from "react";

export default function Home() {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.ready();
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
      <div className="bg-black bg-opacity-60 rounded-xl p-8 shadow-2xl flex flex-col items-center">
        <img src="/img/trump-icon.svg" alt="Pidr Game" className="w-24 h-24 mb-6 animate-bounce" />
        <h1 className="text-5xl font-extrabold mb-4 text-center drop-shadow-lg">PIDR GAME</h1>
        <p className="text-lg mb-6 text-center max-w-xl">
          Добро пожаловать в карточную игру нового поколения! <br />
          Интеграция с <span className="font-bold text-blue-400">Telegram WebApp</span>, рейтинг, магазин, друзья и многое другое.
        </p>
        <a href="https://t.me/YOUR_BOT_USERNAME/webapp" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition mb-2 shadow">
          Открыть в Telegram
        </a>
        <span className="text-xs text-gray-400">(Работает только внутри Telegram)</span>
      </div>
      <footer className="mt-10 text-gray-500 text-sm">&copy; {new Date().getFullYear()} Pidr Game</footer>
    </main>
  );
} 