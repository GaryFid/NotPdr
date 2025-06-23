'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy, FaArrowUp, FaArrowDown, FaCog, FaUser } from 'react-icons/fa';

export default function RatingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <button className="flex items-center gap-2 text-white hover:text-[#ffd700]" onClick={() => history.back()}>
          <FaArrowLeft /> <span className="hidden sm:inline">Назад</span>
        </button>
        <h1 className="text-lg font-bold text-[#ffd700]">Рейтинг</h1>
        <div></div>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Рейтинг */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-[#232b3e] rounded-xl p-6 mt-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl font-bold text-[#ffd700]">2350</div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Текущий рейтинг</div>
              <div className="inline-block bg-[#ffd700]/10 border border-[#ffd700] rounded-2xl px-3 py-1 text-xs text-[#ffd700] font-bold mb-2"><FaTrophy className="inline mr-1" />Золотой игрок</div>
              <div className="w-full h-2 bg-[#232b3e] rounded mt-2 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#ffd700] to-[#ffa500] rounded" style={{width:'23.5%'}}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span><span>2500</span><span>5000</span><span>7500</span><span>10000</span>
              </div>
            </div>
          </div>
        </motion.section>
        {/* История игр */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">История игр</h2>
          <div className="space-y-3">
            <div className="bg-[#232b3e] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Рейтинговая игра</div>
                <div className="text-xs text-gray-400">24 марта 2024, 15:30</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold">+25</span>
                <FaArrowUp className="text-green-400" />
              </div>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Рейтинговая игра</div>
                <div className="text-xs text-gray-400">24 марта 2024, 14:15</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">-15</span>
                <FaArrowDown className="text-red-400" />
              </div>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Рейтинговая игра</div>
                <div className="text-xs text-gray-400">24 марта 2024, 12:45</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold">+30</span>
                <FaArrowUp className="text-green-400" />
              </div>
            </div>
          </div>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 