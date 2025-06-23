'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy, FaUser, FaGamepad } from 'react-icons/fa';

const tables = [
  { id: 1, host: 'Игрок #1', players: '4/6' },
  { id: 2, host: 'Игрок #2', players: '5/7' },
];

export default function TablesListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      <div className="text-2xl font-extrabold text-[#ffd700] text-center py-8 shadow-lg rounded-b-3xl bg-gradient-to-r from-[#ffd700] to-[#ffb900] mb-4">P.I.D.R.</div>
      <main className="max-w-lg mx-auto px-2">
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-[#232b3e] rounded-2xl p-6 mt-4 mb-4 shadow-xl">
          <h2 className="text-[#ffd700] font-bold text-xl mb-4 text-center">Доступные столы</h2>
          {tables.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Нет доступных столов</div>
          ) : (
            tables.map(table => (
              <div key={table.id} className="flex items-center justify-between bg-gradient-to-r from-[#ff4d4f] to-[#ffd700] rounded-xl p-4 mb-4 shadow-md">
                <div>
                  <div className="font-bold text-white text-lg">{table.host}</div>
                  <div className="text-[#ffd700] text-sm font-semibold">{table.players} игроков</div>
                </div>
                <button className="px-6 py-2 rounded-2xl bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition">Присоединиться</button>
              </div>
            ))
          )}
          <button className="block mx-auto mt-6 px-8 py-2 rounded-2xl bg-gradient-to-r from-[#ff4d4f] to-[#ffd700] text-white font-bold hover:from-[#ff4d4f]/80 hover:to-[#ffd700]/80 transition" onClick={()=>history.back()}>
            ← Назад
          </button>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 