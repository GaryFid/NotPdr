import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import SideMenu from './SideMenu';

const mainCoin = {
  name: 'TON',
  icon: '/img/ton-icon.svg',
  value: 12345.6789,
};

function formatCrypto(val: number) {
  return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default function BottomNav() {
  const [open, setOpen] = useState(false);

  const handleWalletClick = () => {
    setOpen(true);
  };
  const handleCloseMenu = () => {
    setOpen(false);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="backdrop-blur-xl bg-gradient-to-t from-[#181c2a]/95 via-[#232b3e]/90 to-[#0f2027]/80 border-t border-white/10 shadow-2xl">
          <div className="relative flex justify-center items-center px-4 py-3 max-w-md mx-auto gap-4">
            {/* Кошелек-бургер */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWalletClick}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#232b3e] hover:bg-[#232b3e]/80 border-2 border-[#ffd700] shadow-xl transition-all duration-200 focus:outline-none"
              aria-label="Открыть кошелек"
              style={{ minWidth: 120 }}
            >
              {/* SVG иконка кошелька */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="24" height="16" rx="6" fill="#ffd700" stroke="#fff" strokeWidth="2"/>
                <rect x="8" y="12" width="16" height="8" rx="4" fill="#232b3e" />
                <circle cx="24" cy="16" r="2" fill="#ffd700" />
              </svg>
              <span className="text-lg font-bold text-[#ffd700]">Кошелек</span>
            </motion.button>
            {/* Баланс монеты */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#232b3e]/80 border border-[#ffd700] shadow-lg"
            >
              <Image src={mainCoin.icon} alt={mainCoin.name} width={28} height={28} />
              <span className="text-xl font-bold text-[#ffd700] tabular-nums">{formatCrypto(mainCoin.value)}</span>
            </motion.div>
          </div>
          {/* Bottom safe area for iOS */}
          <div className="h-safe-area-inset-bottom bg-gradient-to-t from-[#181c2a]/60 to-transparent" />
        </div>
      </motion.nav>
      <SideMenu isOpen={open} onClose={handleCloseMenu} />
    </>
  );
}