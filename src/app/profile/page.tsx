'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy, FaMedal, FaPlus, FaMinus, FaUser } from 'react-icons/fa';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <button className="flex items-center gap-2 text-white hover:text-[#ffd700]" onClick={() => history.back()}>
          <FaArrowLeft /> <span className="hidden sm:inline">Назад</span>
        </button>
        <h1 className="text-lg font-bold text-[#ffd700]">Профиль</h1>
        <div style={{width: 24}}></div>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Профиль игрока */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-[#232b3e] rounded-xl p-8 flex flex-col items-center text-center mt-6">
          <img src="/img/default-avatar.png" alt="Аватар" className="w-28 h-28 rounded-full border-4 border-[#ffd700] mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">Игрок</h2>
          <p className="text-gray-400">Онлайн</p>
        </motion.div>
        {/* Статистика */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">Статистика</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#232b3e] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#ffd700]">1234</div>
              <div className="text-xs text-gray-400">Рейтинг</div>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">42</div>
              <div className="text-xs text-gray-400">Игр сыграно</div>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">65%</div>
              <div className="text-xs text-gray-400">Процент побед</div>
            </div>
          </div>
        </motion.section>
        {/* Достижения */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">Достижения</h2>
          <div className="space-y-3">
            <div className="bg-[#232b3e] rounded-xl p-4 flex items-center gap-4">
              <FaTrophy className="text-2xl text-[#ffd700]" />
              <div>
                <div className="font-semibold text-white">Первая победа</div>
                <div className="text-xs text-gray-400">Выиграйте свою первую игру</div>
              </div>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 flex items-center gap-4">
              <FaMedal className="text-2xl text-blue-400" />
              <div>
                <div className="font-semibold text-white">Ветеран</div>
                <div className="text-xs text-gray-400">Сыграйте 100 игр</div>
              </div>
            </div>
          </div>
        </motion.section>
        {/* История игр */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">Последние игры</h2>
          <div className="space-y-3">
            <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-white">Игра #42</div>
                <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#ffd700] to-[#ffb900] text-[#232b3e] text-xs font-bold">Победа</div>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <FaPlus /> <span>25 очков</span>
              </div>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-white">Игра #41</div>
                <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#232b3e] to-[#ffd700] text-white text-xs font-bold">Поражение</div>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <FaMinus /> <span>15 очков</span>
              </div>
            </div>
          </div>
        </motion.section>
        {/* Настройки */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.5}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">Настройки</h2>
          <div className="bg-[#232b3e] rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">Имя пользователя</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg bg-[#181f2a] text-white outline-none focus:ring-2 focus:ring-[#ffd700]" value="Игрок" placeholder="Введите имя" />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Уведомления</label>
              <div className="flex gap-2 mt-2">
                <button className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition">Включить</button>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#232b3e] to-[#ffd700] text-white hover:from-yellow-400 hover:to-yellow-300 transition">Выключить</button>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 