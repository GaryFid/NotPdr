import { usePathname, useRouter } from 'next/navigation';
import { FaGamepad, FaUsers, FaUser, FaWallet, FaBook } from 'react-icons/fa';

const NAV = [
  { label: 'Меню', icon: <FaGamepad />, href: '/' },
  { label: 'Друзья', icon: <FaUsers />, href: '/friends' },
  { label: 'Профиль', icon: <FaUser />, href: '/profile' },
  { label: 'Кошелёк', icon: <FaWallet />, href: '/wallet' },
  { label: 'Правила', icon: <FaBook />, href: '/rules' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181f2a] border-t border-[#ff4d4f] flex justify-around items-center h-16 z-50 shadow-xl">
      {NAV.map((item) => (
        <button
          key={item.href}
          onClick={() => router.push(item.href)}
          className={`flex flex-col items-center flex-1 h-full justify-center transition-all duration-200 ${pathname === item.href ? 'text-[#ff4d4f] scale-110' : 'text-white hover:text-[#ffd700]'}`}
        >
          <span className="text-xl mb-1">{item.icon}</span>
          <span className="text-xs font-semibold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
