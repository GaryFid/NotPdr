'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import MultiplayerMenu from '../../components/MultiplayerMenu';
import MultiplayerLobby from '../../components/MultiplayerLobby';
import GamePageContent from '../game/GamePageContent';
import { useTelegram } from '../../hooks/useTelegram';
import { useGameStore } from '../../store/gameStore';

type MultiplayerView = 'menu' | 'lobby' | 'game';

interface RoomData {
  roomId: string;
  roomCode: string;
  maxPlayers: number;
  hostUserId: string;
  currentPlayers?: number;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { isGameActive, endGame } = useGameStore();
  
  const [currentView, setCurrentView] = useState<MultiplayerView>('menu');
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Автоматически переходим в игру если она активна
  useEffect(() => {
    if (isGameActive && currentView !== 'game') {
      setCurrentView('game');
    }
  }, [isGameActive]);

  // Создание комнаты
  const handleCreateRoom = (createdRoomData: RoomData) => {
    console.log('🏠 [MultiplayerPage] Создана комната:', createdRoomData);
    
    setRoomData(createdRoomData);
    setIsHost(true);
    setCurrentView('lobby');
  };

  // Присоединение к комнате
  const handleJoinRoom = (joinedRoomData: RoomData) => {
    console.log('🚪 [MultiplayerPage] Присоединились к комнате:', joinedRoomData);
    
    setRoomData(joinedRoomData);
    setIsHost(false);
    setCurrentView('lobby');
  };

  // Возвращение в главное меню
  const handleBackToMenu = () => {
    console.log('🔙 [MultiplayerPage] Возвращение в главное меню');
    router.push('/');
  };

  // Возвращение к выбору мультиплеера
  const handleBackToMultiplayerMenu = () => {
    console.log('🔙 [MultiplayerPage] Возвращение к выбору мультиплеера');
    
    setRoomData(null);
    setIsHost(false);
    setCurrentView('menu');
  };

  // Покидание лобби
  const handleLeaveLobby = () => {
    console.log('🚪 [MultiplayerPage] Покидание лобби');
    
    setRoomData(null);
    setIsHost(false);
    setCurrentView('menu');
  };

  // Начало игры
  const handleGameStart = (gameSettings: any) => {
    console.log('🚀 [MultiplayerPage] Начало мультиплеерной игры:', gameSettings);
    
    // Интегрируемся с gameStore для начала мультиплеерной игры
    const { startGame } = useGameStore.getState();
    
    // Конвертируем игроков лобби в формат gameStore
    const players = gameSettings.players.map((player: any, index: number) => ({
      id: player.userId,
      name: player.firstName || player.username || `Игрок ${index + 1}`,
      avatar: player.photoUrl || '/img/avatars/default.png',
      cards: [],
      penki: [],
      isUser: player.userId === user?.id?.toString(),
      isBot: player.isBot || false,
      difficulty: player.difficulty || 'medium'
    }));

    // Запускаем мультиплеерную игру
    startGame('multiplayer', players.length, {
      roomId: roomData?.roomId,
      roomCode: roomData?.roomCode,
      isHost,
      players
    });
    
    setCurrentView('game');
  };

  // Завершение игры
  const handleGameEnd = () => {
    console.log('🏁 [MultiplayerPage] Завершение мультиплеерной игры');
    
    endGame();
    
    // Возвращаемся в лобби после игры
    if (roomData) {
      setCurrentView('lobby');
    } else {
      setCurrentView('menu');
    }
  };

  return (
    <div className="multiplayer-page">
      {/* Заголовок с кнопкой назад */}
      {currentView !== 'game' && (
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            className="back-button"
            onClick={currentView === 'menu' ? handleBackToMenu : handleBackToMultiplayerMenu}
          >
            <ArrowLeft />
            <span>{currentView === 'menu' ? 'Главное меню' : 'Выбор режима'}</span>
          </button>
        </motion.div>
      )}

      {/* Контент */}
      <div className="page-content">
        <AnimatePresence mode="wait">
          {/* Меню выбора мультиплеера */}
          {currentView === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MultiplayerMenu
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onBack={handleBackToMenu}
              />
            </motion.div>
          )}

          {/* Лобби игры */}
          {currentView === 'lobby' && roomData && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <MultiplayerLobby
                roomId={roomData.roomId}
                roomCode={roomData.roomCode}
                isHost={isHost}
                onGameStart={handleGameStart}
                onLeaveRoom={handleLeaveLobby}
              />
            </motion.div>
          )}

          {/* Игра */}
          {currentView === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="multiplayer-game-container">
                {/* Индикатор мультиплеера */}
                <div className="multiplayer-indicator">
                  <div className="multiplayer-badge">
                    🌐 Онлайн игра
                  </div>
                  {roomData && (
                    <div className="room-info">
                      Комната: {roomData.roomCode}
                    </div>
                  )}
                </div>

                {/* Игровой компонент */}
                <GamePageContent 
                  initialPlayerCount={roomData?.maxPlayers || 9}
                  isMultiplayer={true}
                  multiplayerData={roomData ? {
                    roomId: roomData.roomId,
                    roomCode: roomData.roomCode,
                    isHost
                  } : undefined}
                  onGameEnd={handleGameEnd}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .multiplayer-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #e2e8f0;
        }

        .page-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .page-content {
          flex: 1;
          padding: 1rem;
        }

        .multiplayer-game-container {
          position: relative;
        }

        .multiplayer-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .multiplayer-badge {
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .room-info {
          padding: 0.25rem 0.75rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 15px;
          font-size: 0.75rem;
          backdrop-filter: blur(10px);
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 0.75rem;
          }
          
          .page-content {
            padding: 0.75rem;
          }

          .multiplayer-indicator {
            top: 0.5rem;
            right: 0.5rem;
          }

          .multiplayer-badge,
          .room-info {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
