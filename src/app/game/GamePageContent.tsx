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

// Правильное позиционирование игроков вокруг овального стола
const getCirclePosition = (index: number, total: number): { top: string; left: string } => {
  // Угол для каждого игрока (начинаем снизу и идем по часовой стрелке)
  const angle = (index * 360) / total + 270; // +270 чтобы первый игрок был внизу
  const radians = (angle * Math.PI) / 180;
  
  // Максимально широкое расположение игроков для идеальной видимости
  const horizontalRadius = 75; // Процент от ширины (увеличено с 65 до 75)
  const verticalRadius = 60;   // Процент от высоты (увеличено с 52 до 60)
  
  // Вычисляем позицию относительно центра стола
  const x = 50 + horizontalRadius * Math.cos(radians); // 50% это центр
  const y = 50 + verticalRadius * Math.sin(radians);
  
  return {
    left: `${Math.max(5, Math.min(95, x))}%`, // Расширили границы с 8-92 до 5-95
    top: `${Math.max(5, Math.min(90, y))}%`   // Расширили границы с 8-85 до 5-90
  };
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
    selectedHandCard, revealedDeckCard,
    startGame, endGame, 
    drawCard, makeMove, onDeckClick,
    selectHandCard, playSelectedCard
  } = useGameStore();

  const searchParams = useSearchParams();
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [dealt, setDealt] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);

  // Получаем текущего игрока (пользователя)
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);

  // Автоматический запуск игры при загрузке страницы
  useEffect(() => {
    if (!gameInitialized) {
      const tableParam = searchParams.get('table');
      const aiParam = searchParams.get('ai');
      const modeParam = searchParams.get('mode');
      const testParam = searchParams.get('test');
      
      if (tableParam) {
        // Если есть параметры URL - автозапуск
        const playerCount = parseInt(tableParam);
        const withAI = aiParam === '1';
        const gameMode = modeParam || 'classic';
        const testMode = testParam === '1';
        
        console.log(`🎮 Автозапуск игры: ${playerCount} игроков, ИИ: ${withAI}, режим: ${gameMode}, тест: ${testMode}`);
        
        setPlayerCount(playerCount);
        startGame('multiplayer', playerCount);
        setGameInitialized(true);
        setDealt(false);
      } else {
        // Если нет параметров - просто инициализируем
        setGameInitialized(true);
      }
    }
  }, [searchParams, gameInitialized, startGame]);

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
    setGameInitialized(true);
  };

  const handleResetGame = () => {
    endGame();
    setDealt(false);
    setGameInitialized(false);
  };

  const canDrawCard = turnPhase === 'deck_card_revealed' && currentPlayer?.id === currentPlayerId;
  const canClickDeck = turnPhase === 'showing_deck_hint' && currentPlayer?.id === currentPlayerId;
  const waitingForTarget = turnPhase === 'waiting_target_selection';

  return (
    <div className={styles.gameContainer}>
      {/* Заголовок игры - только во время игры */}
      {isGameActive && (
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
      )}

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
              
              {/* Открытая карта из колоды (слева от колоды) */}
              {revealedDeckCard && (
                <div className={styles.revealedCardContainer}>
                  <div className={styles.revealedCard}>
                    <Image 
                      src={revealedDeckCard.image ? `/img/cards/${revealedDeckCard.image}` : '/img/cards/back.png'} 
                      alt="revealed card" 
                      width={60} 
                      height={90}
                      className={styles.revealedCardImage}
                    />
                  </div>
                  {turnPhase === 'waiting_deck_action' && (
                    <div className={styles.deckActions}>
                      <div className={styles.actionHint}>Выберите действие:</div>
                      {availableTargets.length > 0 && (
                        <div className={styles.targetHint}>🎯 Выберите игрока</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Колода и кнопка добора */}
              <div className={styles.dropZone}>
                <div 
                  className={styles.deckStack}
                  onClick={() => {
                    if (canClickDeck) {
                      onDeckClick();
                    } else if (canDrawCard) {
                      drawCard();
                    }
                  }}
                  style={{
                    cursor: (canDrawCard || canClickDeck) ? 'pointer' : 'default',
                    opacity: (canDrawCard || canClickDeck) ? 1 : 0.7
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
              {gameStage === 1 && canClickDeck && (
                <div className={styles.centralButtonContainer}>
                  <button 
                    className={styles.centralButton}
                    onClick={() => onDeckClick()}
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
                const isCurrentPlayerCard = p.id === currentPlayerId && turnPhase === 'analyzing_hand' && availableTargets.length > 0;
                const isClickableTarget = isTargetAvailable && (turnPhase === 'waiting_target_selection' || turnPhase === 'waiting_deck_action');
                const isClickableOwnCard = isCurrentPlayerCard;

                return (
                  <div
                    key={p.id}
                    className={`${styles.playerSeat} ${isCurrentPlayer ? styles.currentPlayerSeat : ''} ${isCurrentTurn ? styles.playerTurn : ''} ${isTargetAvailable ? styles.highlightedTarget : ''}`}
                    style={{
                      position: 'absolute',
                      left: position.left,
                      top: position.top,
                      transform: 'translateX(-50%)', // Центрируем горизонтально
                    }}
                  >
                    {/* Аватар и имя по центру */}
                    <div className={styles.avatarWrap}>
                      <Image src={p.avatar || USER_AVATAR} alt="avatar" width={22} height={22} className={styles.avatar} />
                      <span className={styles.playerName}>{p.name}</span>
                      {isCurrentPlayer && <span style={{color:'#6366f1',marginLeft:4,fontWeight:700}}>⬤</span>}
                      {isTargetAvailable && <span style={{color:'#22c55e',marginLeft:4}}>🎯</span>}
                    </div>
                    
                    {/* Контейнер для пеньков и открытой карты */}
                    <div className={styles.cardsContainer}>
                      {/* Пеньки (подложка) */}
                      {p.penki && p.penki.length > 0 && (
                        <div className={styles.penkiRow}>
                          {p.penki.map((penkiCard, pi) => {
                            // Определяем направление для пеньков тоже
                            const playerPosition = getCirclePosition(playerIndex, players.length);
                            const isLeftSide = parseFloat(playerPosition.left) < 50;
                            const penkiOffset = isLeftSide ? pi * 10 : -pi * 10;
                            
                            return (
                            <div
                              key={penkiCard.id}
                              className={styles.penkiCard}
                              style={{ 
                                left: `${penkiOffset}px`,
                                zIndex: pi + 1
                              }}
                              title={`Пенёк ${pi + 1} (активируется в 3-й стадии)`}
                            >
                              <Image
                                src="/img/cards/back.png"
                                alt="penki"
                                width={55}
                                height={80}
                                style={{ 
                                  borderRadius: '8px',
                                  opacity: 0.8
                                }}
                              />
                            </div>
                          );
                          })}
                        </div>
                      )}
                      
                      {/* Открытая карта поверх пеньков */}
                      {p.cards.length > 0 && (
                        <div className={styles.activeCardContainer}>
                          {p.cards.map((card, ci) => {
                            const isTopCard = ci === p.cards.length - 1;
                            // Определяем направление стекинга карт в зависимости от позиции игрока
                            const playerPosition = getCirclePosition(playerIndex, players.length);
                            const isLeftSide = parseFloat(playerPosition.left) < 50; // Левая половина экрана
                            const cardOffset = isLeftSide ? ci * 6 : -ci * 6; // Левые игроки - вправо, правые - влево
                            
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
                                  left: `${cardOffset}px`,
                                  zIndex: ci + 10 // Поверх пеньков
                                }}
                              >
                                <div
                                  className={`${styles.cardOnPenki} ${card.open ? styles.open : styles.closed} ${(isClickableTarget || isClickableOwnCard) && isTopCard ? styles.targetCard : ''}`}
                                  style={{ 
                                    cursor: (isClickableTarget || isClickableOwnCard) && isTopCard ? 'pointer' : 'default',
                                    transform: (isClickableTarget || isClickableOwnCard) && isTopCard ? 'scale(1.05)' : 'scale(1)'
                                  }}
                                  onClick={() => {
                                    if (isTopCard) {
                                      if (isClickableOwnCard) {
                                        // Клик по своей карте - переключаемся в режим выбора цели
                                        // Добавим новый метод в gameStore
                                        makeMove('initiate_move');
                                      } else if (isClickableTarget) {
                                        // Клик по карте соперника - делаем ход
                                        makeMove(p.id);
                                      }
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
                                    width={60}
                                    height={85}
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

          {/* Контейнер карт игрока внизу - только во время игры */}
          {isGameActive && currentPlayer && currentPlayer.cards.length > 0 && (
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
                        // Разрешаем клики только во 2-й стадии
                        if (isSelectableStage2 && gameStage === 2) {
                          selectHandCard(card);
                        }
                      }}
                    >
                      <div style={{ width: '100%', height: '100%' }}>
                        <div style={{
                          position: 'absolute',
                          width: '70px',
                          height: '105px',
                          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                          borderRadius: '10px',
                          zIndex: -1,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(99, 102, 241, 0.3)'
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