'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUserPlus, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <button className="flex items-center gap-2 text-white hover:text-[#ffd700]" onClick={() => history.back()}>
          <FaArrowLeft /> <span className="hidden sm:inline">Назад</span>
        </button>
        <h1 className="text-lg font-bold text-[#ffd700]">Друзья</h1>
        <button className="p-2 text-white hover:text-[#ffd700]">
          <FaUserPlus />
        </button>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Поиск */}
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="relative my-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Поиск друзей..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#232b3e] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#ffd700]" />
        </motion.div>
        {/* Онлайн */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-6 mb-2">Онлайн</h2>
          <div className="bg-[#232b3e] rounded-xl p-2 divide-y divide-[#232b3e]/60">
            {[1,2].map(i => (
              <div key={i} className="flex items-center gap-3 py-3">
                <img src="/img/default-avatar.png" alt="Аватар" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-white">Игрок #{i}</div>
                  <div className={`text-xs ${i===1?'text-green-400':'text-gray-400'}`}>{i===1?'В игре':'В сети'}</div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition">Играть</button>
              </div>
            ))}
          </div>
        </motion.section>
        {/* Все друзья */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-6 mb-2">Все друзья</h2>
          <div className="bg-[#232b3e] rounded-xl p-2 divide-y divide-[#232b3e]/60">
            {[3,4].map(i => (
              <div key={i} className="flex items-center gap-3 py-3">
                <img src="/img/default-avatar.png" alt="Аватар" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-white">Игрок #{i}</div>
                  <div className="text-xs text-gray-400">{i===3?'Был(а) 2 часа назад':'Был(а) вчера'}</div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ffd700] to-[#ffb900] text-[#232b3e] font-bold hover:from-yellow-400 hover:to-yellow-300 transition">Профиль</button>
              </div>
            ))}
          </div>
        </motion.section>
        {/* Запросы в друзья */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-6 mb-2">Запросы в друзья</h2>
          <div className="bg-[#232b3e] rounded-xl p-2">
            <div className="flex items-center gap-3 py-3">
              <img src="/img/default-avatar.png" alt="Аватар" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-white">Игрок #5</div>
                <div className="text-xs text-gray-400">Хочет добавить вас в друзья</div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"><FaCheck /></button>
                <button className="p-2 rounded-lg bg-gradient-to-r from-[#ffd700] to-[#ffb900] text-[#232b3e] hover:from-yellow-400 hover:to-yellow-300 transition"><FaTimes /></button>
              </div>
            </div>
          </div>
        </motion.section>
        {/* Рекомендации */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.5}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-6 mb-2">Возможные друзья</h2>
          <div className="grid grid-cols-2 gap-4">
            {[6,7].map(i => (
              <div key={i} className="bg-[#232b3e] rounded-xl p-4 flex flex-col items-center text-center">
                <img src="/img/default-avatar.png" alt="Аватар" className="w-20 h-20 rounded-full object-cover mb-3" />
                <h3 className="text-white font-semibold mb-1">Игрок #{i}</h3>
                <p className="text-xs text-gray-400 mb-2">{i===6?'3 общих друга':'1 общий друг'}</p>
                <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition">Добавить</button>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
}
