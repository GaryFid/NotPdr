'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBook, FaChess, FaUsers, FaStar, FaCrown, FaExclamation, FaQuestion, FaListOl } from 'react-icons/fa';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <button className="flex items-center gap-2 text-white hover:text-[#ffd700]" onClick={() => history.back()}>
          <FaArrowLeft /> <span className="hidden sm:inline">Назад</span>
        </button>
        <h1 className="text-lg font-bold text-[#ffd700]">Правила</h1>
        <div style={{width: 24}}></div>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Заголовок */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-[#232b3e] rounded-xl p-4 mt-6 mb-4">
          <div className="flex items-center gap-2 text-[#ffd700] text-lg font-bold mb-2"><FaBook /> Правила игры</div>
        </motion.section>
        {/* Основные правила */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-[#232b3e] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-[#ffd700] font-semibold mb-2"><FaChess /> Основные правила</div>
          <div className="flex items-center gap-3 mb-2"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center"><FaUsers /></span><span className="font-semibold text-white">Количество игроков</span><span className="text-xs text-gray-400 ml-2">От 4 до 9 игроков</span></div>
          <div className="flex items-center gap-3 mb-2"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center"><FaStar /></span><span className="font-semibold text-white">Карты игрока</span><span className="text-xs text-gray-400 ml-2">У каждого игрока: 2 закрытые карты и 1 открытая</span></div>
          <div className="flex items-center gap-3"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center"><FaStar /></span><span className="font-semibold text-white">Цель игры</span><span className="text-xs text-gray-400 ml-2">Избавиться от всех карт на руках</span></div>
        </motion.section>
        {/* Стадии игры */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="bg-[#232b3e] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-[#ffd700] font-semibold mb-2"><FaListOl /> Стадии игры</div>
          <div className="flex items-center gap-3 mb-2"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center font-bold">1</span><span className="font-semibold text-white">Базовые правила</span></div>
          <ul className="ml-8 text-xs text-gray-400 list-disc mb-2">
            <li>Ход только верхней картой</li>
            <li>Карта должна быть на 1 ранг выше предыдущей</li>
            <li>Масти не важны</li>
          </ul>
          <div className="flex items-center gap-3 mb-2"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center font-bold">2</span><span className="font-semibold text-white">Расширенные правила</span></div>
          <ul className="ml-8 text-xs text-gray-400 list-disc">
            <li>Добавляются правила мастей</li>
            <li>Активируется механика "Последняя!"</li>
            <li>Доступна механика "Сколько карт?"</li>
          </ul>
        </motion.section>
        {/* Особые правила */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}} className="bg-[#232b3e] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-[#ffd700] font-semibold mb-2"><FaExclamation /> Особые правила</div>
          <div className="flex items-center gap-3 mb-2"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center"><FaCrown /></span><span className="font-semibold text-white">Правило двойки</span><span className="text-xs text-gray-400 ml-2">Карта "2" может побить только туз (A)</span></div>
          <div className="flex items-center gap-3 mb-2"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center"><FaExclamation /></span><span className="font-semibold text-white">Последняя!</span><span className="text-xs text-gray-400 ml-2">Игрок должен объявить, когда у него остается одна карта</span></div>
          <div className="flex items-center gap-3"><span className="bg-[#ffd700] text-[#232b3e] rounded-full w-6 h-6 flex items-center justify-center"><FaQuestion /></span><span className="font-semibold text-white">Сколько карт?</span><span className="text-xs text-gray-400 ml-2">Игроки могут спрашивать количество карт у других участников</span></div>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 