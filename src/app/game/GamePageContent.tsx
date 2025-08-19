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
    selectedHandCard, revealedDeckCard, tableStack, trumpSuit,
    startGame, endGame, 
    drawCard, makeMove, onDeckClick, placeCardOnSelfByRules,
    selectHandCard, playSelectedCard, takeTableCards
  } = useGameStore();

  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [dealt, setDealt] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [previousGameStage, setPreviousGameStage] = useState(gameStage);

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

  // Отслеживаем изменения стадии игры для анимации пеньков
  useEffect(() => {
    if (gameStage !== previousGameStage) {
      setPreviousGameStage(gameStage);
    }
  }, [gameStage, previousGameStage]);
  
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
        trumpSuit // Козырь из gameStore (определяется автоматически)
      };
      
      const decision = await ai.makeDecisionWithDelay(gameState);
      
      // Выполняем решение ИИ с учетом стадии игры
      if (gameStage === 1) {
        // В 1-й стадии ИИ должен следовать алгоритму: анализ руки → колода → анализ карты из колоды
        switch (decision.action) {
          case 'place_on_target':
            if (decision.targetPlayerId !== undefined && makeMove) {
              makeMove(decision.targetPlayerId.toString());
            }
            break;
          case 'draw_card':
            // В 1-й стадии ИИ кликает по колоде только если не может ходить из руки
            if (onDeckClick) onDeckClick();
            break;
          default:
            console.log('ИИ не может сделать ход в 1-й стадии');
            break;
        }
      } else if (gameStage === 2) {
        // Во 2-й стадии AI использует систему selectHandCard + playSelectedCard
        switch (decision.action) {
          case 'play_card':
            if (decision.cardToPlay && selectHandCard) {
              // Найдем карту в руке игрока и выберем её
              const currentPlayer = players.find(p => p.id === currentPlayerId);
              if (currentPlayer) {
                const cardInHand = currentPlayer.cards.find(c => 
                  c.image === decision.cardToPlay?.image && c.open
                );
                if (cardInHand) {
                  console.log(`🤖 [AI Stage2] Выбираем карту: ${cardInHand.image}`);
                  selectHandCard(cardInHand);
                  // Через 1 секунду играем карту
                  setTimeout(() => {
                    console.log(`🤖 [AI Stage2] Играем выбранную карту`);
                    playSelectedCard();
                  }, 1000);
                }
              }
            }
            break;
          case 'draw_card':
            // Во 2-й стадии это значит "взять карты со стола"
            if (takeTableCards) {
              console.log(`🤖 [AI Stage2] Берем карты со стола`);
              takeTableCards();
            }
            break;
        }
      } else {
        // В 3-й стадии используем обычную логику
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
        }
      }
    };
    
    // Запускаем ход ИИ с небольшой задержкой
    const timeoutId = setTimeout(makeAIMove, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentPlayerId, isGameActive, players, gameStage, aiPlayers]);
  
  // Инициализация игры из gameStore
  useEffect(() => {
    if (!gameInitialized) {
      if (isGameActive && players.length > 0) {
        // Игра уже запущена через gameStore - просто инициализируем интерфейс
        console.log(`🎮 Игра P.I.D.R. запущена: ${players.length} игроков`);
        setPlayerCount(players.length);
        setGameInitialized(true);
        setDealt(false);
      } else {
        // Игра не активна - просто инициализируем интерфейс
        console.log('🎮 Ожидание запуска игры...');
        setGameInitialized(true);
      }
    }
  }, [gameInitialized, isGameActive, players.length]);

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



  const canDrawCard = turnPhase === 'deck_card_revealed' && currentPlayer?.id === currentPlayerId;
  const canClickDeck = turnPhase === 'showing_deck_hint' && currentPlayer?.id === currentPlayerId;
  const waitingForTarget = turnPhase === 'waiting_target_selection';
  
  // УДАЛЕНО: Логика canBeatTopCard и shouldShowTakeButton - кнопка "Взять карту" теперь постоянная во 2-й стадии

  // Показываем заглушку если игра не активна
  if (!isGameActive) {
    return (
      <div className={styles.gameContainer}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: '#e2e8f0',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>P.I.D.R. Game</h2>
          <p style={{ marginBottom: '30px', opacity: 0.7 }}>
            Игра не запущена. Вернитесь в главное меню и настройте игру.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ← Назад в меню
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      {/* Заголовок игры - только во время игры */}
      {isGameActive && (
        <div className={styles.gameHeader}>
          <div className={styles.stageInfo}>
            {gameStage >= 2 && trumpSuit && (
              <span className={styles.trumpIcon}>
                {trumpSuit === 'hearts' ? '♥️' : 
                 trumpSuit === 'diamonds' ? '♦️' : 
                 trumpSuit === 'clubs' ? '♣️' : 
                 trumpSuit === 'spades' ? '♠️' : ''}
              </span>
            )}
            Стадия {gameStage}
          </div>
          <div className={styles.deckInfo}>
            Колода: {deck.length}
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
                
                {/* В 1-й стадии нет кнопки "Взять карту" - только клик по колоде */}
                {canDrawCard && gameStage > 1 && (
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
                  
                  {/* Кнопка "взять нижнюю карту" перенесена в контейнер руки игрока */}
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
                
                // Дополнительная проверка для фазы waiting_deck_action когда можно положить карту на себя по правилам
                const canPlaceOnSelfInDeckAction = p.id === currentPlayerId && 
                                                   turnPhase === 'waiting_deck_action' && 
                                                   useGameStore.getState().canPlaceOnSelfByRules;
                
                const isClickableTarget = isTargetAvailable && (turnPhase === 'waiting_target_selection' || turnPhase === 'waiting_deck_action');
                const isClickableOwnCard = isCurrentPlayerCard || canPlaceOnSelfInDeckAction;
                
                // ОТЛАДКА: Логи кликабельности карт
                if (p.id === currentPlayerId) {
                  console.log(`🎯 [GamePageContent] Анализ кликабельности карты игрока ${p.name}:`);
                  console.log(`🎯 [GamePageContent] - p.id: ${p.id}, currentPlayerId: ${currentPlayerId}, совпадает: ${p.id === currentPlayerId}`);
                  console.log(`🎯 [GamePageContent] - turnPhase: ${turnPhase}`);
                  console.log(`🎯 [GamePageContent] - availableTargets: [${availableTargets.join(', ')}], длина: ${availableTargets.length}`);
                  console.log(`🎯 [GamePageContent] - isCurrentPlayerCard: ${isCurrentPlayerCard}`);
                  console.log(`🎯 [GamePageContent] - canPlaceOnSelfInDeckAction: ${canPlaceOnSelfInDeckAction}`);
                  console.log(`🎯 [GamePageContent] - isClickableOwnCard: ${isClickableOwnCard}`);
                }
                
                if (isTargetAvailable) {
                  console.log(`🎯 [GamePageContent] Анализ кликабельности ЦЕЛИ ${p.name} (индекс ${playerIndex}):`);
                  console.log(`🎯 [GamePageContent] - isTargetAvailable: ${isTargetAvailable}`);
                  console.log(`🎯 [GamePageContent] - turnPhase: ${turnPhase}`);
                  console.log(`🎯 [GamePageContent] - isClickableTarget: ${isClickableTarget}`);
                }

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
                      {/* Пеньки (подложка) - показываем только на 3-й стадии */}
                      {/* Пеньки - это скрытые карты, которые активируются только на 3-й стадии игры */}
                      {/* Они имеют нормальный размер (не увеличены в 2 раза) и плавно появляются/исчезают */}
                      <AnimatePresence mode="wait">
                        {p.penki && p.penki.length > 0 && gameStage === 3 && (
                          <motion.div 
                            key="penki-visible"
                            className={styles.penkiRow}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          >
                            {p.penki.map((penkiCard, pi) => {
                              // Определяем направление для пеньков тоже
                              const playerPosition = getCirclePosition(playerIndex, players.length);
                              const isLeftSide = parseFloat(playerPosition.left) < 50;
                              const penkiOffset = isLeftSide ? pi * 10 : -pi * 10;
                              
                              return (
                              <motion.div
                                key={penkiCard.id}
                                className={`${styles.penkiCard} ${styles.visible}`}
                                style={{ 
                                  left: `${penkiOffset}px`,
                                  zIndex: pi + 1
                                }}
                                title={`Пенёк ${pi + 1} (активируется в 3-й стадии)`}
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                transition={{ 
                                  duration: 0.4,
                                  delay: pi * 0.1 
                                }}
                              >
                                <Image
                                  src="/img/cards/back.png"
                                  alt="penki"
                                  width={isSmallMobile ? 28 : isMobile ? 32 : 35} /* Уменьшено до нормального размера */
                                  height={isSmallMobile ? 40 : isMobile ? 46 : 52} /* Уменьшено до нормального размера */
                                  style={{ 
                                    borderRadius: '8px',
                                    opacity: 0.8
                                  }}
                                />
                              </motion.div>
                            );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Открытая карта поверх пеньков */}
                      {p.cards.length > 0 && (
                        <div className={styles.activeCardContainer}>
                          {p.cards.slice(-3).map((card, ci) => { // Показываем только последние 3 карты
                            const visibleCards = p.cards.slice(-3);
                            const isTopCard = ci === visibleCards.length - 1; // Последняя из видимых карт
                            
                            // ОТЛАДКА: Логи для isTopCard
                            if (p.id === currentPlayerId) {
                              console.log(`🎯 [GamePageContent] Карта ${ci} игрока ${p.name}: isTopCard = ${isTopCard}, visibleCards.length = ${visibleCards.length}`);
                            }
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
                                    console.log(`🎯 [GamePageContent] КЛИК по карте ${p.name}, isTopCard: ${isTopCard}`);
                                    console.log(`🎯 [GamePageContent] - isClickableOwnCard: ${isClickableOwnCard}, isClickableTarget: ${isClickableTarget}`);
                                    if (isTopCard) {
                                      if (isClickableOwnCard) {
                                        // Проверяем что именно можно делать с картой
                                        if (canPlaceOnSelfInDeckAction) {
                                          console.log(`✅ [GamePageContent] Клик по своей карте - кладем карту из колоды на себя по правилам`);
                                          placeCardOnSelfByRules();
                                        } else if (isCurrentPlayerCard) {
                                          console.log(`✅ [GamePageContent] Клик по своей карте - вызываем makeMove('initiate_move')`);
                                          makeMove('initiate_move');
                                        }
                                      } else if (isClickableTarget) {
                                        console.log(`✅ [GamePageContent] Клик по карте соперника - вызываем makeMove(${p.id})`);
                                        // Клик по карте соперника - делаем ход
                                        makeMove(p.id);
                                      } else {
                                        console.log(`❌ [GamePageContent] Карта не кликабельна`);
                                      }
                                    } else {
                                      console.log(`❌ [GamePageContent] Клик не по верхней карте`);
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

          {/* Контейнер карт игрока внизу - только во 2-й и 3-й стадиях */}
          {isGameActive && currentPlayer && currentPlayer.cards.length > 0 && gameStage >= 2 && (
            <div className={styles.playerHand}>
              <div className={styles.handTitle}>
                {stage2TurnPhase === 'selecting_card' ? '🎯 ВЫБЕРИТЕ КАРТУ' : '🎴 Ваши карты'} ({currentPlayer.cards.length})
                
                {/* Кнопка "Взять карту" - постоянная во 2-й стадии */}
                {gameStage === 2 && tableStack.length > 0 && currentPlayer?.id === currentPlayerId && (
                  <button 
                    className={styles.takeCardFromTableButton}
                    onClick={() => {
                      console.log('🃏 [GamePageContent] Взять нижнюю карту со стола');
                      takeTableCards();
                    }}
                    style={{
                      marginLeft: '15px',
                      padding: '8px 16px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = '#b91c1c'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = '#dc2626'}
                  >
                    📥 Взять карту
                  </button>
                )}
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

          {/* Бургер меню */}
          <div className={styles.gameControls}>
            <div className={styles.burgerMenu}>
              <button className={styles.burgerButton}>
                <div className={styles.burgerLines}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
              <div className={styles.burgerDropdown}>
                <button onClick={() => window.history.back()} className={styles.menuItem}>
                  ← Назад
                </button>
                <button onClick={() => window.location.reload()} className={styles.menuItem}>
                  🔄 Обновить
                </button>
                <button onClick={() => console.log('Чат открыт')} className={styles.menuItem}>
                  💬 Чат
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}