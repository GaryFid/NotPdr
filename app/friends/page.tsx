import React, { useEffect } from "react";

export default function Friends() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.ready();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Шапка */}
      <header className="flex items-center px-4 py-3 bg-black bg-opacity-60 shadow">
        <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left" />
          <span>Назад</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">Друзья</h1>
        <button className="p-2 text-blue-400 hover:text-blue-300">
          <i className="fas fa-user-plus" />
        </button>
      </header>

      <main className="flex-1 p-4 max-w-xl mx-auto w-full">
        {/* Поиск */}
        <div className="relative mb-6">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Поиск друзей..." className="pl-12 pr-4 py-2 rounded-lg bg-gray-800 w-full text-white focus:outline-none" />
        </div>

        {/* Онлайн */}
        <h2 className="text-lg font-semibold mb-2">Онлайн</h2>
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          {[1,2].map(i => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-700 last:border-b-0">
              <img src="/img/default-avatar.png" alt="Аватар" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-semibold">Игрок #{i}</div>
                <div className={i === 1 ? "text-green-400 text-sm" : "text-gray-400 text-sm"}>{i === 1 ? "В игре" : "В сети"}</div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold">Играть</button>
            </div>
          ))}
        </div>

        {/* Все друзья */}
        <h2 className="text-lg font-semibold mb-2">Все друзья</h2>
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          {[3,4].map(i => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-700 last:border-b-0">
              <img src="/img/default-avatar.png" alt="Аватар" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-semibold">Игрок #{i}</div>
                <div className="text-gray-400 text-sm">{i === 3 ? "Был(а) 2 часа назад" : "Был(а) вчера"}</div>
              </div>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 rounded-lg text-black font-semibold">Профиль</button>
            </div>
          ))}
        </div>

        {/* Запросы в друзья */}
        <h2 className="text-lg font-semibold mb-2">Запросы в друзья</h2>
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 py-3">
            <img src="/img/default-avatar.png" alt="Аватар" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <div className="font-semibold">Игрок #5</div>
              <div className="text-gray-400 text-sm">Хочет добавить вас в друзья</div>
            </div>
            <div className="flex gap-2">
              <button className="bg-green-500 hover:bg-green-600 p-2 rounded-full"><i className="fas fa-check" /></button>
              <button className="bg-red-500 hover:bg-red-600 p-2 rounded-full"><i className="fas fa-times" /></button>
            </div>
          </div>
        </div>

        {/* Рекомендации */}
        <h2 className="text-lg font-semibold mb-2">Возможные друзья</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[6,7].map(i => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center">
              <img src="/img/default-avatar.png" alt="Аватар" className="w-20 h-20 rounded-full object-cover mb-3" />
              <h3 className="font-semibold mb-1">Игрок #{i}</h3>
              <p className="text-gray-400 text-sm mb-3">{i === 6 ? "3 общих друга" : "1 общий друг"}</p>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold w-full">Добавить</button>
            </div>
          ))}
        </div>
      </main>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 flex justify-around py-2 z-50">
        <a href="/" className="flex flex-col items-center text-blue-400">
          <i className="fas fa-gamepad text-xl" />
          <span className="text-xs">Меню</span>
        </a>
        <a href="/friends" className="flex flex-col items-center text-yellow-400">
          <i className="fas fa-users text-xl" />
          <span className="text-xs">Друзья</span>
        </a>
        <a href="/profile" className="flex flex-col items-center text-blue-400">
          <i className="fas fa-user text-xl" />
          <span className="text-xs">Профиль</span>
        </a>
        <a href="/wallet" className="flex flex-col items-center text-blue-400">
          <i className="fas fa-wallet text-xl" />
          <span className="text-xs">Кошелек</span>
        </a>
        <a href="/rules" className="flex flex-col items-center text-blue-400">
          <i className="fas fa-book text-xl" />
          <span className="text-xs">Правила</span>
        </a>
      </nav>
    </div>
  );
} 