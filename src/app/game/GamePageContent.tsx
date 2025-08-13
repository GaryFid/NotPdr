'use client'
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import BottomNav from '../../components/BottomNav';
import styles from './GameTable.module.css';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type { Player, Card } from '../../types/game';
import type { Card as StoreCard } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { AIPlayer, AIDifficulty } from '@/lib/game/ai-player';

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

// Идеальное позиционирование игроков вокруг овального стола
const getCirclePosition = (index: number, total: number): { top: string; left: string } => {
  // Равномерное распределение по овальной траектории, игрок 0 внизу
  const baseAngle = 270; // чтобы первый был снизу
  const step = 360 / Math.max(total, 1);
  const microBuffer = total >= 9 ? 2.5 : total === 8 ? 2 : total === 7 ? 1.5 : 0; // небольшой зазор между соседями
  const angle = baseAngle + index * (step - microBuffer);
  const radians = (angle * Math.PI) / 180;

  // Радиусы стола (визуальный овал)
  const n = Math.max(total, 1);
  const scale = Math.min(1.5, 1 + Math.max(0, n - 4) * 0.09);
  const rTableX = 34 * scale;
  const rTableY = 28 * scale;

  // Орбита сидений — всегда за пределами стола (УВЕЛИЧЕНО для отдаления от колоды)
  const seatMargin = 16 + Math.max(0, n - 5) * 3; // больше игроков — больше отступ (было 8 + n*2)
  const rSeatX = rTableX + seatMargin;
  const rSeatY = rTableY + seatMargin;

  const x = 50 + rSeatX * Math.cos(radians);
  const y = 50 + rSeatY * Math.sin(radians);

  return {
    left: `${x}%`,
    top: `${y}%`,
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
    selectedHandCard, revealedDeckCard, tableStack,
    startGame, endGame, 
    drawCard, makeMove, onDeckClick,
    selectHandCard, playSelectedCard
  } = useGameStore();

  const searchParams = useSearchParams();
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [dealt, setDealt] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);

  // Динамические масштабы для 5–9 игроков: меньше стол, чуть меньше сиденья, больше расстояние
  const tableScale = useMemo(() => {
    const n = players.length || playerCount;
    if (n >= 9) return 0.78;
    if (n === 8) return 0.82;
    if (n === 7) return 0.86;
    if (n === 6) return 0.9;
    return 0.95; // 5 и меньше
  }, [players.length, playerCount]);

  const seatScale = useMemo(() => {
    const n = players.length || playerCount;
    if (n >= 9) return 0.82;
    if (n === 8) return 0.86;
    if (n === 7) return 0.9;
    if (n === 6) return 0.94;
    return 1; // 5 и меньше
  }, [players.length, playerCount]);

  // Получаем текущего игрока (пользователя)
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
  
  // Создаем экземпляры ИИ для ботов
  const [aiPlayers, setAiPlayers] = useState<Map<number, AIPlayer>>(new Map());
  
  // Детектируем размер экрана для адаптивности
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Инициализация ИИ игроков
  useEffect(() => {
    const newAiPlayers = new Map<number, AIPlayer>();
    players.forEach(player => {
      if (player.isBot) {
        const playerId = typeof player.id === 'string' ? parseInt(player.id) : player.id;
        newAiPlayers.set(playerId, new AIPlayer(playerId, player.difficulty || 'medium'));
      }
    });
    setAiPlayers(newAiPlayers);
  }, [players]);
  
  // Обработка ходов ИИ
  useEffect(() => {
    if (!isGameActive || !currentPlayerId) return;
    
    const currentPlayer = players.find(p => p.id === currentPlayerId);
    if (!currentPlayer || !currentPlayer.isBot) return;
    
    const playerIdNum = typeof currentPlayerId === 'string' ? parseInt(currentPlayerId) : currentPlayerId;
    const ai = aiPlayers.get(playerIdNum);
    if (!ai) return;
    
    // Задержка перед ходом ИИ для реалистичности
    const makeAIMove = async () => {
      const gameState = {
        players,
        currentPlayer: currentPlayerId,
        gameStage,
        deck,
        availableTargets,
        revealedDeckCard,
        tableStack,
        trumpSuit: null // TODO: добавить определение козыря
      };
      
      const decision = await ai.makeDecisionWithDelay(gameState);
      
      // Выполняем решение ИИ
      switch (decision.action) {
        case 'draw_card':
          if (drawCard) drawCard();
          break;
        case 'place_on_target':
          if (decision.targetPlayerId !== undefined && makeMove) {
            makeMove(decision.targetPlayerId.toString());
          }
          break;
        case 'place_on_self':
          if (playSelectedCard) playSelectedCard();
          break;
        case 'play_card':
          // TODO: преобразовать Card в StoreCard для selectHandCard
          if (decision.cardToPlay && playSelectedCard) {
            // Пока просто вызываем playSelectedCard
            playSelectedCard();
          }
          break;
      }
    };
    
    // Запускаем ход ИИ с небольшой задержкой
    const timeoutId = setTimeout(makeAIMove, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentPlayerId, isGameActive, players, gameStage, aiPlayers]);
  
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
            <div className={styles.tableCenter} style={{ transform: `translate(-50%, -50%) scale(${tableScale})` }}>
              
              {/* Открытая карта из колоды (слева от колоды) */}
              {revealedDeckCard && (
                <div className={styles.revealedCardContainer}>
                  <div className={styles.revealedCard}>
                    <div 
                      className={styles.cardBackdrop} 
                      style={{ 
                        width: isSmallMobile ? 65 : isMobile ? 72 : 80, 
                        height: isSmallMobile ? 97 : isMobile ? 108 : 120,
                        background: 'white',
                        borderRadius: '8px',
                        position: 'absolute',
                        zIndex: -1
                      }} 
                    />
                    <Image 
                      src={revealedDeckCard.image ? `/img/cards/${revealedDeckCard.image}` : '/img/cards/back.png'} 
                      alt="revealed card" 
                      width={isSmallMobile ? 65 : isMobile ? 72 : 80} 
                      height={isSmallMobile ? 97 : isMobile ? 108 : 120}
                      className={styles.revealedCardImage}
                    />
                  </div>
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
                      width={isSmallMobile ? 56 : isMobile ? 63 : 70} 
                      height={isSmallMobile ? 80 : isMobile ? 90 : 100}
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

              {/* Стопка карт на столе (Stage 2) */}
              {Array.isArray(tableStack) && tableStack.length > 0 && (
                <div className={styles.tableStack}>
                  <div className={styles.tableLabel}>Стол: {tableStack.length}</div>
                  {tableStack.map((c, idx) => {
                    const isTop = idx === tableStack.length - 1;
                    const size = c.open ? { w: 110, h: 156 } : { w: 90, h: 128 };
                    return (
                      <div
                        key={c.id ?? idx}
                        className={`${styles.tableCard} ${isTop ? styles.tableCardTop : ''}`}
                        style={{
                          transform: `translate(${idx * 8}px, ${-idx * 2}px) rotate(${(idx % 5) - 2}deg)`
                        }}
                        title={c.open && c.image ? c.image : 'Карта на столе'}
                      >
                        <Image
                          src={c.open && c.image ? `/img/cards/${c.image}` : '/img/cards/back.png'}
                          alt={c.open ? 'table card' : 'back'}
                          width={size.w}
                          height={size.h}
                          className={styles.tableCardImage}
                          draggable={false}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

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
                      transform: `translate(-50%, -50%) scale(${seatScale})`, // Центр + масштаб под кол-во игроков
                    }}
                  >
                    {/* Аватар и имя по центру */}
                    <div className={styles.avatarWrap}>
                      <div className={styles.avatarContainer}>
                        {p.avatar && p.avatar.startsWith('data:') ? (
                          // SVG аватар
                          <div 
                            className={styles.avatar}
                            style={{
                              width: isSmallMobile ? 38 : isMobile ? 45 : 55,
                              height: isSmallMobile ? 38 : isMobile ? 45 : 55,
                              borderRadius: '50%',
                              backgroundImage: `url(${p.avatar})`,
                              backgroundSize: 'cover',
                              border: isCurrentPlayer ? '4px solid #ffd700' : '2px solid rgba(255,255,255,0.3)',
                              boxShadow: isCurrentPlayer ? '0 0 20px #ffd700, 0 0 40px rgba(255,215,0,0.3)' : 'none',
                              animation: isCurrentPlayer ? 'pulse 2s infinite' : 'none'
                            }}
                          />
                        ) : (
                          // Обычное изображение
                          <Image 
                            src={p.avatar || '/img/player-avatar.svg'} 
                            alt="avatar" 
                            width={isSmallMobile ? 38 : isMobile ? 45 : 55} 
                            height={isSmallMobile ? 38 : isMobile ? 45 : 55} 
                            className={styles.avatar}
                            style={{
                              borderRadius: '50%',
                              border: isCurrentPlayer ? '4px solid #ffd700' : '2px solid rgba(255,255,255,0.3)',
                              boxShadow: isCurrentPlayer ? '0 0 20px #ffd700, 0 0 40px rgba(255,215,0,0.3)' : 'none',
                              animation: isCurrentPlayer ? 'pulse 2s infinite' : 'none'
                            }}
                          />
                        )}
                        {p.isBot && (
                          <div className={styles.botBadge} title={`AI (${p.difficulty || 'medium'})`}>
                            🤖
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span 
                          className={styles.playerName} 
                          style={{ 
                            fontSize: isSmallMobile ? '11px' : isMobile ? '12px' : '14px', 
                            fontWeight: 600,
                            color: isCurrentPlayer ? '#ffd700' : 'white',
                            textShadow: isCurrentPlayer ? '0 0 10px #ffd700' : 'none',
                            display: 'block'
                          }}
                        >
                          {p.name}
                          {isCurrentPlayer && <span style={{ marginLeft: 4 }}>👑</span>}
                        </span>
                        {p.cards.length > 3 && (
                          <span 
                            style={{ 
                              fontSize: '11px', 
                              color: '#94a3b8',
                              display: 'block',
                              marginTop: '2px'
                            }}
                          >
                            +{p.cards.length - 3} карт
                          </span>
                        )}
                      </div>
                      {isTargetAvailable && <span style={{color:'#ffd700',marginLeft:4}}>🎯</span>}
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
                                width={isSmallMobile ? 44 : isMobile ? 50 : 55}
                                height={isSmallMobile ? 64 : isMobile ? 72 : 80}
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
                          {p.cards.slice(-3).map((card, ci) => { // Показываем только последние 3 карты
                            const isTopCard = ci === 2; // Топ карта теперь всегда третья
                            // Определяем направление стекинга карт в зависимости от позиции игрока
                            const playerPosition = getCirclePosition(playerIndex, players.length);
                            const isLeftSide = parseFloat(playerPosition.left) < 50; // Левая половина экрана
                            const spacing = isSmallMobile ? 12 : isMobile ? 13 : 15;
                            const cardOffset = isLeftSide ? ci * spacing : -ci * spacing;
                            
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
                                    transform: (isClickableTarget || isClickableOwnCard) && isTopCard ? 'scale(1.05)' : 'scale(1)',
                                    width: card.open ? 105 : 70,
                                    height: card.open ? 157 : 105,
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
                                    width={card.open ? 
                                      (isSmallMobile ? 84 : isMobile ? 95 : 105) : 
                                      (isSmallMobile ? 56 : isMobile ? 63 : 70)
                                    }
                                    height={card.open ? 
                                      (isSmallMobile ? 126 : isMobile ? 142 : 157) : 
                                      (isSmallMobile ? 84 : isMobile ? 95 : 105)
                                    }
                                    draggable={false}
                                    style={{
                                      borderRadius: 0,
                                      transition: 'all 0.3s ease-in-out'
                                    }}
                                  />
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
                  const baseStep = 10;
                  const mobileSteps = {
                    open: isSmallMobile ? 18 : isMobile ? 21 : 25,
                    closed: isSmallMobile ? 14 : isMobile ? 16 : 18
                  };
                  const step = card.open ? mobileSteps.open : mobileSteps.closed;
                  const cardOffset = index * step;
                  const mobileCardSizes = {
                    open: isSmallMobile ? { w: 70, h: 105 } : isMobile ? { w: 77, h: 115 } : { w: 84, h: 126 },
                    closed: isSmallMobile ? { w: 58, h: 87 } : isMobile ? { w: 64, h: 96 } : { w: 70, h: 105 }
                  };
                  const size = card.open ? mobileCardSizes.open : mobileCardSizes.closed;
                  
                  return (
                    <div 
                      key={card.id} 
                      className={`${styles.handCard} ${card.open ? styles.open : styles.closed} ${isSelectableStage2 ? styles.playable : ''}`}
                      style={{ 
                        position: 'absolute',
                        left: `${cardOffset}px`,
                        top: isSelected ? '-10px' : '0px',
                        zIndex: index + 1,
                        transform: isSelected ? 'scale(1.07)' : 'scale(1)',
                        filter: isSelected ? 'drop-shadow(0 0 10px #00ff00)' : 'none',
                        transition: 'all 0.2s ease-in-out',
                        width: `${size.w}px`,
                        height: `${size.h}px`,
                      }}
                      onClick={() => {
                        // Разрешаем клики только во 2-й стадии
                        if (isSelectableStage2 && gameStage === 2) {
                          selectHandCard(card);
                        }
                      }}
                    >
                      <div className={styles.cardBase} style={{ width: '100%', height: '100%' }}>
                        <Image
                          src={card.open && card.image ? `/img/cards/${card.image}` : `/img/cards/back.png`}
                          alt={card.open ? 'card' : 'back'}
                          width={size.w}
                          height={size.h}
                          draggable={false}
                          priority
                          style={{ 
                            borderRadius: 0,
                            boxShadow: card.open ? '0 2px 10px rgba(0, 0, 0, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.5)'
                          }}
                        />
                      </div>
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