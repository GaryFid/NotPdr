import { usePathname, useRouter } from 'next/navigation';
import { FaGamepad, FaUsers, FaUser, FaWallet, FaBook } from 'react-icons/fa';
import { motion } from 'framer-motion';

const NAV = [
  { label: 'Меню', icon: <FaGamepad />, href: '/', color: '#ff6b6b' },
  { label: 'Друзья', icon: <FaUsers />, href: '/friends', color: '#4ecdc4' },
  { label: 'Профиль', icon: <FaUser />, href: '/profile', color: '#45b7d1' },
  { label: 'Кошелёк', icon: <FaWallet />, href: '/wallet', color: '#ffd93d' },
  { label: 'Правила', icon: <FaBook />, href: '/rules', color: '#6c5ce7' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    // Добавляем вибрацию для Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    router.push(href);
  };

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Glassmorphism background */}
      <div className="backdrop-blur-xl bg-gradient-to-t from-[#0f2027]/95 via-[#232b3e]/90 to-[#2c5364]/80 border-t border-white/10 shadow-2xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#232b3e]/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Navigation content */}
        <div className="relative flex justify-around items-center px-2 py-3 max-w-md mx-auto">
          {NAV.map((item, index) => {
            const isActive = pathname === item.href;
            
            return (
              <motion.button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group min-w-[60px] focus:outline-none ${isActive ? 'shadow-xl scale-105' : 'hover:scale-105'}`}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.08 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ zIndex: isActive ? 2 : 1 }}
              >
                {/* Active background indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0 rounded-2xl shadow-2xl border-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color}cc, #232b3e 80%)`,
                      borderColor: `${item.color}`
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {/* Hover background */}
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Icon container */}
                <div className="relative z-10">
                  <motion.div
                    className="text-xl mb-1 transition-all duration-300"
                    style={{ 
                      color: isActive ? item.color : '#b0c4de',
                      filter: isActive ? 'drop-shadow(0 0 12px currentColor)' : 'none'
                    }}
                    animate={{ 
                      scale: isActive ? 1.15 : 1,
                      rotateY: isActive ? [0, 360] : 0
                    }}
                    transition={{ 
                      scale: { duration: 0.3 },
                      rotateY: { duration: 0.6, ease: "easeInOut" }
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  {/* Label */}
                  <motion.span
                    className="text-xs font-bold transition-all duration-300 tracking-wide"
                    style={{ 
                      color: isActive ? item.color : '#b0c4de',
                      textShadow: isActive ? `0 0 12px ${item.color}80` : 'none'
                    }}
                    animate={{ 
                      fontWeight: isActive ? 700 : 400,
                      letterSpacing: isActive ? '0.5px' : '0px'
                    }}
                  >
                    {item.label}
                  </motion.span>
                </div>
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
                {/* Ripple effect on tap */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ backgroundColor: item.color, opacity: 0.08 }}
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ 
                    scale: 1.5, 
                    opacity: [0, 0.3, 0],
                    transition: { duration: 0.4 }
                  }}
                />
              </motion.button>
            );
          })}
        </div>
        {/* Bottom safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-gradient-to-t from-[#0f2027]/60 to-transparent" />
      </div>

      {/* Floating active indicator line */}
      <motion.div
        className="absolute top-0 left-0 h-0.5 rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${NAV.find(item => item.href === pathname)?.color || '#fff'}, transparent)`,
          width: `${100 / NAV.length}%`,
          left: `${(NAV.findIndex(item => item.href === pathname) * 100) / NAV.length}%`
        }}
        layoutId="activeIndicator"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    </motion.nav>
  );
}