import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const coins = [
  { name: 'TON', icon: '/img/ton-icon.svg', value: 12345.6789 },
  { name: 'Trump', icon: '/img/trump-icon.svg', value: 9876.5432 },
  { name: 'Solana', icon: '/img/solana-icon.svg', value: 23456.7890 },
  { name: 'Jetton', icon: '/img/jetton-icon.svg', value: 10000.0001 },
];

function formatCrypto(val: number) {
  return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default function SideMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Side menu */}
          <motion.aside
            className="fixed top-0 left-0 h-full w-[320px] max-w-[90vw] bg-gradient-to-b from-[#181c2a] via-[#232b3e] to-[#0f2027] shadow-2xl z-[101] flex flex-col"
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#ffd700]/20">
              <span className="text-2xl font-extrabold text-[#ffd700] tracking-widest">Кошелек</span>
              <button onClick={onClose} className="text-[#ffd700] text-2xl font-bold hover:text-yellow-400 transition-all">×</button>
            </div>
            {/* Coins list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-4 text-lg font-bold text-[#ffd700]">Ваши монеты</div>
              <div className="flex flex-col gap-3">
                {coins.map((coin) => (
                  <div key={coin.name} className="flex items-center gap-3 p-3 rounded-xl bg-[#232b3e] shadow-md">
                    <Image src={coin.icon} alt={coin.name} width={32} height={32} />
                    <span className="font-bold text-lg text-[#ffd700]">{coin.name}</span>
                    <span className="ml-auto font-semibold text-md text-[#ffd700] tabular-nums">{formatCrypto(coin.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-3 px-6 pb-6">
              <button className="w-full py-3 rounded-xl bg-[#ffd700] text-[#232b3e] font-bold text-lg shadow-md hover:bg-yellow-400 transition-all">Пополнить</button>
              <button className="w-full py-3 rounded-xl border-2 border-[#ffd700] text-[#ffd700] font-bold text-lg shadow-md hover:bg-[#ffd700]/10 transition-all">Вывести</button>
              <button className="w-full py-3 rounded-xl bg-transparent text-[#ffd700] font-bold text-lg hover:bg-[#ffd700]/10 transition-all">История</button>
              <button className="w-full py-3 rounded-xl bg-transparent text-[#ffd700] font-bold text-lg hover:bg-[#ffd700]/10 transition-all" onClick={onClose}>Закрыть меню</button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
} 