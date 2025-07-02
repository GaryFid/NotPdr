import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const coins = [
  {
    name: 'TON',
    icon: '/img/ton-icon.svg',
    value: 12345.6789,
  },
  {
    name: 'Trump',
    icon: '/img/trump-icon.svg',
    value: 9876.5432,
  },
  {
    name: 'Solana',
    icon: '/img/solana-icon.svg',
    value: 23456.7890,
  },
  {
    name: 'Jetton',
    icon: '/img/jetton-icon.svg',
    value: 10000.0001,
  },
];

function formatCrypto(val: number) {
  return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default function BottomNav() {
  const [open, setOpen] = useState(false);

  const handleBurgerClick = () => {
    setOpen(!open);
    // Здесь можно открыть боковое меню или модалку
    console.log('Открыть бургер-меню');
  };

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="backdrop-blur-xl bg-gradient-to-t from-[#0f2027]/95 via-[#232b3e]/90 to-[#2c5364]/80 border-t border-white/10 shadow-2xl">
        <div className="relative flex justify-between items-center px-4 py-3 max-w-md mx-auto">
          {/* Бургер-меню */}
          <button
            onClick={handleBurgerClick}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none"
            aria-label="Открыть меню"
          >
            {/* SVG бургер-иконка */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="6" width="28" height="3" rx="1.5" fill="#ffd700"/>
              <rect y="13" width="28" height="3" rx="1.5" fill="#ffd700"/>
              <rect y="20" width="28" height="3" rx="1.5" fill="#ffd700"/>
            </svg>
            <span className="text-base font-bold text-[#ffd700]">Меню</span>
          </button>
          {/* Баланс криптомонет с иконками */}
          <div className="flex items-center gap-4 px-2 py-2 rounded-2xl bg-[#232b3e]/80 border border-[#ffd700] shadow-lg overflow-x-auto">
            {coins.map((coin) => (
              <div key={coin.name} className="flex items-center gap-1 min-w-[90px]">
                <Image src={coin.icon} alt={coin.name} width={24} height={24} />
                <span className="text-sm font-bold text-[#ffd700] tabular-nums">{formatCrypto(coin.value)}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-gradient-to-t from-[#0f2027]/60 to-transparent" />
      </div>
    </motion.nav>
  );
}