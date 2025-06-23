'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaChess, FaBolt, FaCog, FaCheck, FaPlus } from 'react-icons/fa';
import { useState } from 'react';

const tables = [4,5,6,7,8,9];
const modes = [
  { key: 'classic', icon: <FaChess />, label: 'Классический' },
  { key: 'quick', icon: <FaBolt />, label: 'Быстрый' },
  { key: 'custom', icon: <FaCog />, label: 'Свой' },
];

export default function GameSetupPage() {
  const [selectedTable, setSelectedTable] = useState(4);
  const [selectedMode, setSelectedMode] = useState('classic');
  const [addBots, setAddBots] = useState(false);
  const [testMode, setTestMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <button className="flex items-center gap-2 text-white hover:text-[#ffd700]" onClick={() => history.back()}>
          <FaArrowLeft />
        </button>
        <h1 className="text-lg font-bold text-[#ffd700]">Настройка игры</h1>
        <div style={{width: 32}}></div>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Выбор стола */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="mt-6 mb-4">
          <h2 className="text-[#ffd700] font-semibold text-base mb-2">Выберите стол</h2>
          <div className="grid grid-cols-3 gap-4">
            {tables.map(n => (
              <button key={n} onClick={()=>setSelectedTable(n)} className={`relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all duration-200 ${selectedTable===n?'bg-[#ffd700] text-[#232b3e] scale-105 shadow-xl':'bg-[#232b3e] text-white hover:bg-[#ffd700]/30'}`}>
                <span className="text-3xl font-bold">{n}</span>
                <span className="text-xs mt-1">{n} игроков</span>
                {selectedTable===n && <span className="absolute top-2 right-2 bg-white text-[#ffd700] rounded-full p-1"><FaCheck /></span>}
              </button>
            ))}
          </div>
        </motion.section>
        {/* Режимы игры */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="mb-4">
          <h2 className="text-[#ffd700] font-semibold text-base mb-2">Режим игры</h2>
          <div className="flex gap-4">
            {modes.map(mode => (
              <button key={mode.key} onClick={()=>setSelectedMode(mode.key)} className={`flex flex-col items-center justify-center flex-1 rounded-xl p-4 transition-all duration-200 ${selectedMode===mode.key?'bg-[#ffd700] text-[#232b3e] scale-105 shadow-xl':'bg-[#232b3e] text-white hover:bg-[#ffd700]/30'}`}>
                <span className="text-2xl mb-1">{mode.icon}</span>
                <span className="text-xs font-bold">{mode.label}</span>
              </button>
            ))}
          </div>
        </motion.section>
        {/* Дополнительные настройки */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="mb-4">
          <h2 className="text-[#ffd700] font-semibold text-base mb-2">Дополнительные настройки</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={addBots} onChange={e=>setAddBots(e.target.checked)} className="accent-[#ffd700] w-5 h-5" />
              <span className="text-white">Добавить ботов</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={testMode} onChange={e=>setTestMode(e.target.checked)} className="accent-[#ffd700] w-5 h-5" />
              <span className="text-white">Режим тестирования с ИИ</span>
            </label>
          </div>
        </motion.section>
        {/* Кнопки */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}} className="flex gap-4 mb-8">
          <button className="flex-1 px-4 py-3 rounded-xl bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2"><FaPlus />Создать стол</button>
          <button className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#232b3e] to-[#ffd700] text-white font-bold hover:from-yellow-400 hover:to-yellow-300 transition flex items-center justify-center gap-2"><FaArrowLeft />Присоединиться</button>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 