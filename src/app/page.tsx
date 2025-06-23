'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NAV = [
  { label: 'Меню', icon: '🎮', page: 'main' },
  { label: 'Друзья', icon: '👥', page: 'friends' },
  { label: 'Профиль', icon: '👤', page: 'profile' },
  { label: 'Кошелёк', icon: '💰', page: 'wallet' },
  { label: 'Правила', icon: '📖', page: 'rules' },
];

export default function Home() {
  const [page, setPage] = useState('main');
  const router = useRouter();

  // Для перехода на отдельные страницы Next.js
  const goTo = (p: string) => {
    setPage(p);
    if (p !== 'main') router.push('/' + p);
    else router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'inherit',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', padding: 16 }}>
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, letterSpacing: 2, color: '#ffd700', marginBottom: 8 }}>P.I.D.R.</div>
      </div>
      {/* Баланс */}
      <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', padding: 16 }}>
        <div style={{ background: '#ffd700', color: '#222', borderRadius: 16, padding: 32, fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 16, boxShadow: '0 4px 24px #0002' }}>
          1000
          <div style={{ fontSize: 18, fontWeight: 400, marginTop: 8 }}>монет</div>
        </div>
      </div>
      {/* Быстрые действия */}
      <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', padding: 16 }}>
        <div style={{ color: '#b0b0b0', fontWeight: 600, marginBottom: 12, fontSize: 16 }}>БЫСТРЫЕ ДЕЙСТВИЯ</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <button style={{ background: 'rgba(20,30,50,0.9)', border: '2px solid #ff4d4f', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 20, padding: 24, minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0003', cursor: 'pointer' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>▶️</span>
            Играть
          </button>
          <button style={{ background: 'rgba(20,30,50,0.9)', border: '2px solid #ff4d4f', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 20, padding: 24, minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0003', cursor: 'pointer' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>➕</span>
            Пригласить
          </button>
          <button style={{ background: 'rgba(20,30,50,0.9)', border: '2px solid #ff4d4f', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 20, padding: 24, minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0003', cursor: 'pointer', gridColumn: 'span 2' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🏪</span>
            Магазин
          </button>
        </div>
      </div>
      {/* Нижнее меню */}
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(20,30,50,0.98)',
        borderTop: '2px solid #ff4d4f',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 64,
        zIndex: 100,
      }}>
        {NAV.map((item) => (
          <button
            key={item.page}
            onClick={() => goTo(item.page)}
            style={{
              background: 'none',
              border: 'none',
              color: page === item.page ? '#ff4d4f' : '#fff',
              fontWeight: 700,
              fontSize: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              height: '100%',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <span style={{ fontSize: 12 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
