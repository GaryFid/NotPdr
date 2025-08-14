'use client'
import { useState } from 'react';
import { ArrowLeft, Play, Users, Zap, Settings } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useRouter } from 'next/navigation';

export default function GameSetupPage() {
  const [selectedPlayers, setSelectedPlayers] = useState(5);
  const [selectedMode, setSelectedMode] = useState('classic');
  const [addBots, setAddBots] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const { startGame: startGameInStore } = useGameStore();
  const router = useRouter();

  const playerOptions = [5, 6, 7, 8, 9];
  const modes = [
    { key: 'classic', icon: Users, label: 'Классический.' },
    { key: 'quick', icon: Zap, label: 'Быстрая' },
    { key: 'custom', icon: Settings, label: 'Своя' },
  ];

  const startGame = async () => {
    try {
      console.log('🎮 Начинаем запуск игры...');
      console.log('Параметры:', { selectedPlayers, selectedMode, addBots, testMode });
      
      setIsStarting(true);
      
      // Проверяем что startGameInStore существует
      if (!startGameInStore) {
        throw new Error('startGameInStore не найден в gameStore');
      }
      
      console.log('🎮 Вызываем startGameInStore...');
      // Запускаем игру через gameStore с вашими правилами P.I.D.R.
      await startGameInStore('single', selectedPlayers);
      
      console.log('🎮 Игра успешно запущена, переходим на /game...');
      // Переходим на страницу игры через Next.js router
      router.push('/game');
      
    } catch (error) {
      console.error('🚨 ОШИБКА ЗАПУСКА ИГРЫ:', error);
      console.error('Stack trace:', (error as Error).stack);
      setIsStarting(false);
      
      // Более детальное сообщение об ошибке
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Ошибка запуска игры: ${errorMessage}\n\nПроверьте консоль браузера для подробностей.`);
    }
  };

  return (
    <div className="main-menu-container">
      {/* Эффект свечения как в главном меню */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(255, 215, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      <div className="main-menu-inner">
        {/* Верхний бар */}
        <div className="menu-header">
          <button 
            onClick={() => window.history.back()} 
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
              color: '#e2e8f0',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="menu-title">Настройка игры</span>
          <div style={{ width: '40px' }} />
        </div>

        {/* Выбор количества игроков */}
        <div style={{ marginTop: '32px', marginBottom: '24px' }}>
          <div className="menu-actions-title">ВЫБЕРИТЕ СТОЛ</div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px', 
            marginTop: '12px' 
          }}>
            {playerOptions.map(count => (
              <button 
                key={count}
                onClick={() => setSelectedPlayers(count)}
                className={selectedPlayers === count ? 'menu-balance-card' : 'menu-action-card'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 12px',
                  aspectRatio: '1',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  position: 'relative',
                  transform: selectedPlayers === count ? 'scale(1.05)' : 'scale(1)',
                  color: selectedPlayers === count ? '#0f172a' : '#e2e8f0',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                  {count}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.8 }}>
                  игроков
                </div>
                {selectedPlayers === count && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px'
                  }}>
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Режим игры */}
        <div style={{ marginBottom: '24px' }}>
          <div className="menu-actions-title">РЕЖИМ ИГРЫ</div>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '12px' 
          }}>
            {modes.map(mode => {
              const IconComponent = mode.icon;
              return (
                <button 
                  key={mode.key}
                  onClick={() => setSelectedMode(mode.key)}
                  className={selectedMode === mode.key ? 'menu-balance-card' : 'menu-action-card'}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transform: selectedMode === mode.key ? 'scale(1.05)' : 'scale(1)',
                    color: selectedMode === mode.key ? '#0f172a' : '#e2e8f0',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <IconComponent size={24} style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.9rem' }}>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Дополнительные настройки */}
        <div style={{ marginBottom: '32px' }}>
          <div className="menu-actions-title">ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ</div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            marginTop: '12px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#e2e8f0',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            >
              <input 
                type="checkbox" 
                checked={addBots} 
                onChange={(e) => setAddBots(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px',
                  accentColor: '#22c55e',
                  cursor: 'pointer'
                }} 
              />
              Добавить ботов
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#e2e8f0',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            >
              <input 
                type="checkbox" 
                checked={testMode} 
                onChange={(e) => setTestMode(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px',
                  accentColor: '#22c55e',
                  cursor: 'pointer'
                }} 
              />
              Тестовый режим
            </label>
          </div>
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={startGame}
            disabled={isStarting}
            style={{
              background: isStarting 
                ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '16px',
              padding: '16px 24px',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isStarting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
              opacity: isStarting ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!isStarting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(34, 197, 94, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!isStarting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.3)';
              }
            }}
          >
            <Play size={20} />
            {isStarting ? 'Запуск игры P.I.D.R...' : `Играть P.I.D.R. (${selectedPlayers} игроков)`}
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%)',
                color: '#ffd700',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                borderRadius: '16px',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)';
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%)';
                e.currentTarget.style.color = '#ffd700';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              + Создать стол
            </button>
            <button
              onClick={() => window.history.back()}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                color: '#e2e8f0',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '16px',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              ← Присоединиться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 