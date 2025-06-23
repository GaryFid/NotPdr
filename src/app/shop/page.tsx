'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPalette, FaMagic, FaBolt, FaGift, FaCoins } from 'react-icons/fa';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <button className="flex items-center gap-2 text-white hover:text-[#ffd700]" onClick={() => history.back()}>
          <FaArrowLeft /> <span className="hidden sm:inline">Назад</span>
        </button>
        <h1 className="text-lg font-bold text-[#ffd700]">Магазин</h1>
        <div className="flex items-center gap-2 text-[#ffd700] font-bold"><FaCoins /> 1000</div>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Категории */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="flex gap-2 overflow-x-auto py-4">
          <button className="px-4 py-2 rounded-lg bg-[#232b3e] text-white font-bold hover:bg-[#ffd700] hover:text-[#232b3e] transition">Все</button>
          <button className="px-4 py-2 rounded-lg bg-[#232b3e] text-white font-bold hover:bg-[#ffd700] hover:text-[#232b3e] transition">Скины</button>
          <button className="px-4 py-2 rounded-lg bg-[#232b3e] text-white font-bold hover:bg-[#ffd700] hover:text-[#232b3e] transition">Эффекты</button>
          <button className="px-4 py-2 rounded-lg bg-[#232b3e] text-white font-bold hover:bg-[#ffd700] hover:text-[#232b3e] transition">Бустеры</button>
        </motion.div>
        {/* Товары */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Скин */}
          <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col items-center">
            <div className="h-24 w-full flex items-center justify-center rounded-t-xl bg-gradient-to-r from-[#ffd700] to-[#ffb900] mb-2"><FaPalette className="text-3xl text-white" /></div>
            <div className="w-full">
              <h3 className="text-white font-semibold mb-1">Золотой скин</h3>
              <p className="text-xs text-gray-400 mb-2">Эксклюзивный золотой скин для вашего профиля</p>
              <div className="flex items-center gap-2 font-bold mb-2"><FaCoins className="text-[#ffd700]" /> 500</div>
              <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition mt-2">Купить</button>
            </div>
          </div>
          {/* Эффект */}
          <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col items-center">
            <div className="h-24 w-full flex items-center justify-center rounded-t-xl bg-gradient-to-r from-[#ff4d4f] to-[#ffd700] mb-2"><FaMagic className="text-3xl text-white" /></div>
            <div className="w-full">
              <h3 className="text-white font-semibold mb-1">Огненный след</h3>
              <p className="text-xs text-gray-400 mb-2">Оставляйте огненный след при движении</p>
              <div className="flex items-center gap-2 font-bold mb-2"><FaCoins className="text-[#ffd700]" /> 300</div>
              <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition mt-2">Купить</button>
            </div>
          </div>
          {/* Бустер */}
          <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col items-center">
            <div className="h-24 w-full flex items-center justify-center rounded-t-xl bg-gradient-to-r from-[#232b3e] to-[#ffd700] mb-2"><FaBolt className="text-3xl text-white" /></div>
            <div className="w-full">
              <h3 className="text-white font-semibold mb-1">Ускоритель опыта</h3>
              <p className="text-xs text-gray-400 mb-2">x2 опыта на следующие 5 игр</p>
              <div className="flex items-center gap-2 font-bold mb-2"><FaCoins className="text-[#ffd700]" /> 200</div>
              <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition mt-2">Купить</button>
            </div>
          </div>
        </motion.section>
        {/* Специальные предложения */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="mb-8">
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">Специальные предложения</h2>
          <div className="bg-[#232b3e] rounded-xl p-4 flex items-center gap-4">
            <div className="h-20 w-20 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ffd700] to-[#ffb900]"><FaGift className="text-3xl text-white" /></div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Набор новичка</h3>
              <p className="text-xs text-gray-400 mb-2">Получите стартовый набор со скидкой 50%</p>
              <div className="flex items-center gap-2 font-bold mb-2"><span className="line-through text-gray-400">1000</span><FaCoins className="text-[#ffd700]" /> 500</div>
              <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition mt-2">Купить</button>
            </div>
          </div>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 