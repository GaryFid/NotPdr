'use client'
import BottomNav from '../../components/BottomNav';
import { motion } from 'framer-motion';
import { FaMoon, FaPalette, FaVolumeUp, FaBell, FaUser, FaTrash, FaStore, FaGamepad, FaCog } from 'react-icons/fa';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181f2a] to-[#232b3e] pb-20">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#232b3e] bg-[#181f2a] sticky top-0 z-20">
        <div></div>
        <h1 className="text-lg font-bold text-[#ffd700]">Настройки</h1>
        <div></div>
      </header>
      <main className="max-w-lg mx-auto px-2">
        {/* Внешний вид */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-[#232b3e] rounded-xl p-4 mt-6 mb-4">
          <h2 className="text-[#ffd700] font-semibold text-base mb-2">Внешний вид</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaMoon className="text-xl text-[#ffd700]" />
                <div>
                  <div className="font-semibold text-white">Тёмная тема</div>
                  <div className="text-xs text-gray-400">Изменить цветовую схему приложения</div>
                </div>
              </div>
              <input type="checkbox" className="toggle toggle-accent" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaPalette className="text-xl text-[#ffd700]" />
                <div>
                  <div className="font-semibold text-white">Цветовая схема</div>
                  <div className="text-xs text-gray-400">Выберите основной цвет интерфейса</div>
                </div>
              </div>
              <select className="rounded-lg bg-[#181f2a] text-white px-2 py-1">
                <option>Синий</option>
                <option>Зелёный</option>
                <option>Фиолетовый</option>
                <option>Оранжевый</option>
              </select>
            </div>
          </div>
        </motion.section>
        {/* Игровой процесс */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-[#232b3e] rounded-xl p-4 mb-4">
          <h2 className="text-[#ffd700] font-semibold text-base mb-2">Игровой процесс</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaVolumeUp className="text-xl text-[#ffd700]" />
                <div>
                  <div className="font-semibold text-white">Звуковые эффекты</div>
                  <div className="text-xs text-gray-400">Включить звуки в игре</div>
                </div>
              </div>
              <input type="checkbox" className="toggle toggle-accent" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaBell className="text-xl text-[#ffd700]" />
                <div>
                  <div className="font-semibold text-white">Уведомления</div>
                  <div className="text-xs text-gray-400">Получать уведомления о ходе игры</div>
                </div>
              </div>
              <input type="checkbox" className="toggle toggle-accent" defaultChecked />
            </div>
          </div>
        </motion.section>
        {/* Аккаунт */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="bg-[#232b3e] rounded-xl p-4 mb-4">
          <h2 className="text-[#ffd700] font-semibold text-base mb-2">Аккаунт</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUser className="text-xl text-[#ffd700]" />
                <div>
                  <div className="font-semibold text-white">Изменить никнейм</div>
                  <div className="text-xs text-gray-400">Текущий никнейм: Игрок #1</div>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[#ffd700] text-[#232b3e] font-bold hover:bg-yellow-400 transition">Изменить</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaTrash className="text-xl text-[#ffd700]" />
                <div>
                  <div className="font-semibold text-white">Удалить аккаунт</div>
                  <div className="text-xs text-gray-400">Это действие нельзя отменить</div>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition">Удалить</button>
            </div>
          </div>
        </motion.section>
      </main>
      <BottomNav />
    </div>
  );
} 