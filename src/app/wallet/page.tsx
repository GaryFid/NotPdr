'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCoins, FaPlus, FaGift, FaShoppingCart, FaStar, FaTelegram, FaShareAlt } from 'react-icons/fa';

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <button className="flex items-center gap-2 text-white hover:text-[#ffd700]" onClick={() => history.back()}>
          <FaArrowLeft /> <span className="hidden sm:inline">Назад</span>
        </button>
        <h1 className="text-lg font-bold text-[#ffd700]">Кошелёк</h1>
        <div style={{width: 24}}></div>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Баланс */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-[#232b3e] rounded-xl p-8 flex flex-col items-center text-center mt-6">
          <div className="text-sm text-gray-400 mb-2">Текущий баланс</div>
          <div className="text-4xl font-bold text-[#ffd700] flex items-center gap-2 mb-2"><FaCoins /> 1000</div>
          <button className="px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition flex items-center gap-2 mt-2"><FaPlus /> Пополнить</button>
        </motion.div>
        {/* История транзакций */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">История транзакций</h2>
          <div className="bg-[#232b3e] rounded-xl p-2 divide-y divide-[#232b3e]/60">
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#ff4d4f] to-[#ffd700] text-white"><FaShoppingCart /></div>
              <div className="flex-1">
                <div className="font-semibold text-white">Покупка скина</div>
                <div className="text-xs text-gray-400">2 часа назад</div>
              </div>
              <div className="text-red-400 font-bold flex items-center gap-1">-500 <FaCoins className="text-[#ffd700]" /></div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#ffd700] to-[#ffb900] text-white"><FaGift /></div>
              <div className="flex-1">
                <div className="font-semibold text-white">Бонус за победу</div>
                <div className="text-xs text-gray-400">5 часов назад</div>
              </div>
              <div className="text-green-400 font-bold flex items-center gap-1">+100 <FaCoins className="text-[#ffd700]" /></div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#232b3e] to-[#ffd700] text-white"><FaStar /></div>
              <div className="flex-1">
                <div className="font-semibold text-white">Достижение разблокировано</div>
                <div className="text-xs text-gray-400">1 день назад</div>
              </div>
              <div className="text-green-400 font-bold flex items-center gap-1">+250 <FaCoins className="text-[#ffd700]" /></div>
            </div>
          </div>
        </motion.section>
        {/* Способы пополнения */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}>
          <h2 className="text-[#ffd700] font-semibold text-base mt-8 mb-2">Способы пополнения</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col items-center text-center">
              <FaTelegram className="text-3xl text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Telegram Premium</h3>
              <p className="text-xs text-gray-400 mb-2">Получите +500 монет</p>
              <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition">Активировать</button>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col items-center text-center">
              <FaGift className="text-3xl text-[#ffd700] mb-2" />
              <h3 className="text-white font-semibold mb-1">Промокод</h3>
              <p className="text-xs text-gray-400 mb-2">Введите промокод</p>
              <input type="text" className="w-full px-3 py-2 rounded-lg bg-[#181f2a] text-white outline-none focus:ring-2 focus:ring-[#ffd700] mb-2" placeholder="PIDR2024" />
              <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition">Применить</button>
            </div>
            <div className="bg-[#232b3e] rounded-xl p-4 flex flex-col items-center text-center">
              <FaShareAlt className="text-3xl text-green-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Поделиться</h3>
              <p className="text-xs text-gray-400 mb-2">+100 монет за приглашение</p>
              <button className="w-full px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition">Пригласить</button>
            </div>
          </div>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 