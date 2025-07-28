'use client'
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import BottomNav from '../../components/BottomNav';
import styles from './GameTable.module.css';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type { Player, Card } from '../../types/game';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

const CARD_IMAGES = [
  '2_of_clubs.png','2_of_diamonds.png','2_of_hearts.png','2_of_spades.png',
  '3_of_clubs.png','3_of_diamonds.png','3_of_hearts.png','3_of_spades.png',
  '4_of_clubs.png','4_of_diamonds.png','4_of_hearts.png','4_of_spades.png',
  '5_of_clubs.png','5_of_diamonds.png','5_of_hearts.png','5_of_spades.png',
  '6_of_clubs.png','6_of_diamonds.png','6_of_hearts.png','6_of_spades.png',
  '7_of_clubs.png','7_of_diamonds.png','7_of_hearts.png','7_of_spades.png',
  '8_of_clubs.png','8_of_diamonds.png','8_of_hearts.png','8_of_spades.png',
  '9_of_clubs.png','9_of_diamonds.png','9_of_hearts.png','9_of_spades.png',
  '10_of_clubs.png','10_of_diamonds.png','10_of_hearts.png','10_of_spades.png',
  'ace_of_clubs.png','ace_of_diamonds.png','ace_of_hearts.png','ace_of_spades.png',
  'jack_of_clubs.png','jack_of_diamonds.png','jack_of_hearts.png','jack_of_spades.png',
  'king_of_clubs.png','king_of_diamonds.png','king_of_hearts.png','king_of_spades.png',
  'queen_of_clubs.png','queen_of_diamonds.png','queen_of_hearts.png','queen_of_spades.png',
];
const CARD_BACK = 'back.png';
const BOT_NAMES = ['Petr','Ivan','Albert','Ignat','Robert','Alex','Sergey','Dmitry','Oleg'];
const BOT_AVATAR = '/img/player-avatar.svg';
const USER_AVATAR = '/img/player-avatar.svg';

function getPlayers(count: number, userName = 'Вы'): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: i === 0 ? userName : BOT_NAMES[i-1] || `AI${i}`,
    avatar: i === 0 ? USER_AVATAR : BOT_AVATAR,
    cards: [
      { id: `c${i}a`, image: CARD_BACK, open: false },
      { id: `c${i}b`, image: CARD_BACK, open: false },
      { id: `c${i}c`, image: `/img/cards/${CARD_IMAGES[(i*3)%CARD_IMAGES.length]}`, open: true },
    ],
    isUser: i === 0,
  }));
}

// Универсальная функция для позиционирования игроков по овалу стола
const getCirclePosition = (index: number, total: number): { top: string; left: string } => {
  // Фиксированные позиции для разного количества игроков
  const positions = {
    2: [
      { left: '50%', top: '15%' }, // Верх
      { left: '50%', top: '75%' }  // Низ
    ],
    3: [
      { left: '50%', top: '12%' }, // Верх
      { left: '75%', top: '60%' }, // Право
      { left: '25%', top: '60%' }  // Лево
    ],
    4: [
      { left: '50%', top: '10%' }, // Верх
      { left: '80%', top: '50%' }, // Право
      { left: '50%', top: '75%' }, // Низ (пользователь)
      { left: '20%', top: '50%' }  // Лево
    ],
    5: [
      { left: '50%', top: '8%' },  // Верх
      { left: '78%', top: '35%' }, // Право-верх
      { left: '70%', top: '70%' }, // Право-низ
      { left: '30%', top: '70%' }, // Лево-низ
      { left: '22%', top: '35%' }  // Лево-верх
    ],
    6: [
      { left: '50%', top: '6%' },  // Верх
      { left: '82%', top: '30%' }, // Право-верх
      { left: '82%', top: '70%' }, // Право-низ
      { left: '50%', top: '80%' }, // Низ
      { left: '18%', top: '70%' }, // Лево-низ
      { left: '18%', top: '30%' }  // Лево-верх
    ]
  };

  const totalPositions = positions[total as keyof typeof positions] || positions[4];
  return totalPositions[index] || { left: '50%', top: '50%' };
};

function getFirstPlayerIdx(players: Player[]): number {
  for (let i = 0; i < players.length; i++) {
    if (players[i].isUser) return i;
  }
  return 0;
}

interface GamePageContentProps {
  initialPlayerCount?: number;
}

export default function GamePageContent({ initialPlayerCount = 4 }: GamePageContentProps) {
  const { 
    isGameActive, gameStage, turnPhase, stage2TurnPhase,
    players, currentPlayerId, deck, availableTargets,
    selectedHandCard, 
    startGame, endGame, 
    drawCard, makeMove,
    selectHandCard, playSelectedCard
  } = useGameStore();

  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [dealt, setDealt] = useState(false);

  // Получаем текущего игрока (пользователя)
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);

  // Эффект для автоматической раздачи карт при старте игры
  useEffect(() => {
    if (isGameActive && !dealt) {
      setDealt(true);
    }
  }, [isGameActive, dealt]);

  // Запуск игры
  const handleStartGame = () => {
    startGame('multiplayer', playerCount);
    setDealt(false);
  };

  const handleResetGame = () => {
    endGame();
    setDealt(false);
  };

  const canDrawCard = turnPhase === 'deck_card_revealed' && currentPlayer?.id === currentPlayerId;
  const waitingForTarget = turnPhase === 'waiting_target_selection';

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <div className={styles.stageInfo}>
          Стадия {gameStage}
        </div>
        <div className={styles.deckInfo}>
          Колода: {deck.length}
        </div>
        <div className={styles.targetInfo}>
          Ходов: {players.length - currentPlayerIndex}
        </div>
      </div>

      {!isGameActive ? (
        <div className={styles.setupScreen}>
          <h2>Настройка игры P.I.D.R.</h2>
          <div className={styles.playerCountSelector}>
            <label>Количество игроков: {playerCount}</label>
            <input
              type="range"
              min="3"
              max="9"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className={styles.rangeSlider}
            />
          </div>
          <button onClick={handleStartGame} className={styles.startButton}>
            Начать игру
          </button>
        </div>
      ) : (
        <div className={styles.gameArea}>
          <div className={styles.tableBg}>
            <div className={styles.tableCenter}>
              
              {/* Колода и кнопка добора */}
              <div className={styles.dropZone}>
                <div 
                  className={styles.deckStack}
                  onClick={() => canDrawCard && drawCard()}
                  style={{
                    cursor: canDrawCard ? 'pointer' : 'default',
                    opacity: canDrawCard ? 1 : 0.7
                  }}
                >
                  {deck.length > 0 && (
                    <Image 
                      src="/img/cards/back.png" 
                      alt="deck" 
                      width={50} 
                      height={75}
                      className={styles.deckCard}
                    />
                  )}
                  <div className={styles.deckCount}>{deck.length}</div>
                </div>
                
                {canDrawCard && (
                  <button 
                    onClick={() => drawCard()}
                    className={styles.drawButton}
                  >
                    Взять карту
                  </button>
                )}
              </div>

              {/* Центральная кнопка "КЛИКНИ!" для 1-й стадии */}
              {gameStage === 1 && canDrawCard && (
                <div className={styles.centralButtonContainer}>
                  <button 
                    className={styles.centralButton}
                    onClick={() => drawCard()}
                    style={{
                      width: '50px',
                      height: '30px',
                      borderRadius: '10px',
                      fontSize: '10px'
                    }}
                  >
                    КЛИКНИ!
                  </button>
                  <div className={styles.deckCount}>{deck.length}</div>
                </div>
              )}

              {/* Игроки по кругу */}
              {players.map((p, playerIndex) => {
                const position = getCirclePosition(playerIndex, players.length);
                const isCurrentPlayer = p.id === currentPlayer?.id;
                const isCurrentTurn = p.id === players[currentPlayerIndex]?.id;
                const isTargetAvailable = availableTargets.includes(playerIndex);
                const isClickableTarget = isTargetAvailable && (turnPhase === 'waiting_target_selection');

                return (
                  <div
                    key={p.id}
                    className={`${styles.playerSeat} ${isCurrentPlayer ? styles.currentPlayerSeat : ''} ${isCurrentTurn ? styles.playerTurn : ''} ${isTargetAvailable ? styles.highlightedTarget : ''}`}
                    style={{
                      position: 'absolute',
                      left: position.left,
                      top: position.top,
                    }}
                  >
                    {/* Аватар и имя по центру */}
                    <div className={styles.avatarWrap}>
                      <Image src={p.avatar || USER_AVATAR} alt="avatar" width={45} height={45} className={styles.avatar} />
                      <span className={styles.playerName}>{p.name}</span>
                      {isCurrentPlayer && <span style={{color:'#6366f1',marginLeft:4,fontWeight:700}}>⬤</span>}
                      {isTargetAvailable && <span style={{color:'#22c55e',marginLeft:4}}>🎯</span>}
                    </div>
                    
                    {/* Контейнер для пеньков и открытой карты */}
                    <div className={styles.cardsContainer}>
                      {/* Пеньки (подложка) */}
                      {p.penki && p.penki.length > 0 && (
                        <div className={styles.penkiRow}>
                          {p.penki.map((penkiCard, pi) => (
                            <div
                              key={penkiCard.id}
                              className={styles.penkiCard}
                              style={{ 
                                left: `${pi * 10}px`,
                                zIndex: pi + 1
                              }}
                              title={`Пенёк ${pi + 1} (активируется в 3-й стадии)`}
                            >
                              <Image
                                src="/img/cards/back.png"
                                alt="penki"
                                width={45}
                                height={65}
                                style={{ 
                                  borderRadius: '8px',
                                  opacity: 0.8
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Открытая карта поверх пеньков */}
                      {p.cards.length > 0 && (
                        <div className={styles.activeCardContainer}>
                          {p.cards.map((card, ci) => {
                            const isTopCard = ci === p.cards.length - 1;
                            
                            return (
                              <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: -40, rotateY: -180, scale: 0.5 }}
                                animate={{ 
                                  opacity: dealt ? 1 : 0, 
                                  y: 0, 
                                  rotateY: 0, 
                                  scale: 1,
                                  transition: {
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15
                                  }
                                }}
                                exit={{ opacity: 0, y: 40, rotateY: 180, scale: 0.5 }}
                                transition={{ 
                                  delay: (playerIndex * 0.15) + (ci * 0.08), 
                                  duration: 0.6,
                                  type: "spring",
                                  stiffness: 150,
                                  damping: 12
                                }}
                                whileHover={{ 
                                  scale: isClickableTarget && isTopCard ? 1.15 : 1.05,
                                  rotateY: 5,
                                  z: 20
                                }}
                                style={{ 
                                  position: 'absolute',
                                  left: `${ci * 6}px`,
                                  zIndex: ci + 10 // Поверх пеньков
                                }}
                              >
                                <div
                                  className={`${styles.cardOnPenki} ${card.open ? styles.open : styles.closed} ${isClickableTarget && isTopCard ? styles.targetCard : ''}`}
                                  style={{ 
                                    cursor: isClickableTarget && isTopCard ? 'pointer' : 'default',
                                    transform: isClickableTarget && isTopCard ? 'scale(1.05)' : 'scale(1)'
                                  }}
                                  onClick={() => {
                                    if (isClickableTarget && isTopCard) {
                                      makeMove(p.id);
                                    }
                                  }}
                                >
                                  <Image
                                    src={
                                      // Во 2-й стадии карты других игроков всегда скрыты
                                      (gameStage as number) === 2 && p.id !== currentPlayerId ? 
                                        `/img/cards/back.png` :
                                      // В 1-й стадии показываем как обычно
                                      (card.open && card.image ? `/img/cards/${card.image}` : `/img/cards/back.png`)
                                    }
                                    alt={card.open ? 'card' : 'back'}
                                    width={45}
                                    height={65}
                                    draggable={false}
                                    style={{
                                      borderRadius: '8px',
                                      transition: 'all 0.3s ease-in-out'
                                    }}
                                  />
                                  
                                  {/* Отображение ранга карты */}
                                  {card.open && card.rank && (
                                    <div className={styles.cardRank}>
                                      {card.rank}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Контейнер карт игрока внизу */}
          {currentPlayer && currentPlayer.cards.length > 0 && (
            <div className={styles.playerHand}>
              <div className={styles.handTitle}>
                {stage2TurnPhase === 'selecting_card' ? '🎯 ВЫБЕРИТЕ КАРТУ' : '🎴 Ваши карты'} ({currentPlayer.cards.length})
              </div>
              <div className={styles.handCards}>
                {currentPlayer.cards.map((card, index) => {
                  const isSelectableStage2 = card.open && stage2TurnPhase === 'selecting_card';
                  const isSelected = selectedHandCard?.id === card.id;
                  const cardOffset = index * 10;
                  
                  return (
                    <div 
                      key={card.id} 
                      className={`${styles.handCard} ${card.open ? styles.open : styles.closed} ${isSelectableStage2 ? styles.playable : ''}`}
                      style={{ 
                        position: 'absolute',
                        left: `${cardOffset}px`,
                        top: isSelected ? '-8px' : '0px',
                        zIndex: index + 1,
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        filter: isSelected ? 'drop-shadow(0 0 8px #00ff00)' : 'none',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onClick={() => {
                        if (isSelectableStage2) {
                          selectHandCard(card);
                        }
                      }}
                    >
                      <div style={{ width: '100%', height: '100%' }}>
                        <div style={{
                          position: 'absolute',
                          width: '70px',
                          height: '105px',
                          background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
                          borderRadius: '10px',
                          zIndex: -1,
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                        }}></div>
                        <Image
                          src={card.open && card.image ? `/img/cards/${card.image}` : `/img/cards/back.png`}
                          alt={card.open ? 'card' : 'back'}
                          width={70}
                          height={105}
                          draggable={false}
                          priority
                          style={{ 
                            borderRadius: '10px',
                            boxShadow: card.open ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.5)'
                          }}
                        />
                      </div>
                      
                      {isSelectableStage2 && !isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '-20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#00ff00',
                          color: '#000',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}>
                          КЛИКНИ!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Кнопка сброса игры */}
          <div className={styles.gameControls}>
            <button onClick={handleResetGame} className={styles.resetButton}>
              Новая игра
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}