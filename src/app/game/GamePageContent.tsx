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

function getCirclePosition(idx: number, total: number, radius = 200) {
  // Универсальное аккуратное размещение для любого количества игроков
  const angle = (2 * Math.PI * idx) / total - Math.PI / 2; // Начинаем сверху
  
  // Адаптивные радиусы в зависимости от количества игроков
  let radiusX: number, radiusY: number;
  
  if (total <= 4) {
    radiusX = 180;
    radiusY = 120;
  } else if (total <= 6) {
    radiusX = 200;
    radiusY = 140;
  } else if (total <= 8) {
    radiusX = 220;
    radiusY = 160;
  } else {
    radiusX = 240;
    radiusY = 180;
  }
  
  const offsetX = Math.cos(angle) * radiusX;
  const offsetY = Math.sin(angle) * radiusY;
  
  return {
    left: `calc(50% + ${offsetX}px - 80px)`,
    top: `calc(50% + ${offsetY}px - 80px)`,
  };
}

function getFirstPlayerIdx(players: Player[]): number {
  let maxRank = -1;
  let idx = 0;
  players.forEach((p, i) => {
    const openCard = p.cards.find(c => c.open);
    if (openCard) {
      const rank = getCardRank(openCard.image);
      // При одинаковых рангах ходит тот, кому ПЕРВОМУ упала старшая карта
      if (rank > maxRank) {
        maxRank = rank;
        idx = i;
      }
      // НЕ МЕНЯЕМ idx при равенстве рангов - остается первый найденный!
    }
  });
  return idx;
}

function Card({ image, draggable, onDragStart, onTouchStart, style }: {
  image: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={styles.card}
      draggable={draggable}
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
      style={style}
    >
      <Image
        src={'/img/cards/back@2x.png'}
        alt="back-underlay"
        width={96}
        height={144}
        className={styles.cardBackUnderlay}
        draggable={false}
        unoptimized
      />
      <Image
        src={`/img/cards/${image}`}
        alt="card"
        width={84}
        height={128}
        style={{ width: '100%', height: '100%' }}
        objectFit="contain"
        priority
      />
    </div>
  );
}

// Вспомогательная функция для получения ранга карты
function getCardRank(image: string): number {
  const name = image.replace('.png', '').replace('/img/cards/', '');
  if (name.startsWith('ace')) return 14;
  if (name.startsWith('king')) return 13;
  if (name.startsWith('queen')) return 12;
  if (name.startsWith('jack')) return 11;
  const match = name.match(/(\d+)_of/);
  return match ? parseInt(match[1], 10) : 0;
}

// Вспомогательная функция для генерации колоды и раздачи
function generateDeckAndDeal(playersCount: number, cardsPerPlayer: number) {
  const deck = [...CARD_IMAGES];
  // Перемешать
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const hands: string[][] = Array.from({ length: playersCount }, () => []);
  let deckIdx = 0;
  for (let c = 0; c < cardsPerPlayer; c++) {
    for (let p = 0; p < playersCount; p++) {
      hands[p].push(deck[deckIdx++]);
    }
  }
  return { hands, deck: deck.slice(deckIdx) };
}

export default function GamePageContent() {
  const params = useSearchParams();
  const playersCount = Math.max(4, Math.min(9, parseInt(params.get('table') || '6', 10)));
  
  // Используем новый game store
  const {
    players,
    gameStage,
    currentPlayerId,
    deck,
    availableTargets,
    canPlaceOnSelf,
    isGameActive,
    startGame,
    makeMove,
    placeCardOnSelf,
    processPlayerTurn,
    // Новые состояния для обновленной логики
    turnPhase,
    revealedDeckCard,
    canPlaceOnSelfByRules,
    trumpSuit,
    // Новые методы
    onDeckClick,
    placeCardOnSelfByRules,
    takeCardNotByRules,
    findAvailableTargetsForDeckCard,
    // Поля для 2-й стадии
    tableStack,
    selectedHandCard,
    stage2TurnPhase,
    roundInProgress,
    currentRoundInitiator,
    // Методы для 2-й стадии
    selectHandCard,
    playSelectedCard,
    canBeatCard,
    beatCard,
    takeTableCards,
    checkRoundComplete
  } = useGameStore();
  
  const [dealt, setDealt] = useState(false);
  const [draggedCard, setDraggedCard] = useState<{card: Card; playerIdx: number} | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  
  // Инициализируем игру при первой загрузке
  React.useEffect(() => {
    if (!isGameActive) {
      startGame('multiplayer', playersCount);
    }
  }, [isGameActive, playersCount, startGame]);
  const { dragProps, dropProps } = useDragAndDrop({
    onDrop: (card: Card, playerIdx: number) => {
      // Новая логика для P.I.D.R: проверяем доступные цели
      const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
      const targetPlayer = players[playerIdx];
      
      if (currentPlayerIndex >= 0 && targetPlayer && availableTargets.includes(playerIdx)) {
        makeMove(targetPlayer.id);
      }
      setDropZoneActive(false);
    },
    onDragStart: (card: Card, playerIdx: number) => {
      setDraggedCard({ card, playerIdx });
      setDropZoneActive(true);
    },
    onDragEnd: () => {
      setDraggedCard(null);
      setDropZoneActive(false);
    },
  });

  // Анимация раздачи: карты появляются по одной с задержкой
  React.useEffect(() => {
    if (!dealt) {
      let timeout = setTimeout(() => setDealt(true), players.length * 300 + 500);
      return () => clearTimeout(timeout);
    }
  }, [dealt, players.length]);

  // Находим индекс текущего игрока
  const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
  const currentPlayer = currentPlayerIndex >= 0 ? players[currentPlayerIndex] : null;
  
  // --- Анимационная надпись для первого хода ---
  const [showFirstMove, setShowFirstMove] = useState(true);
  useEffect(() => {
    setShowFirstMove(true);
    const t = setTimeout(() => setShowFirstMove(false), 3000);
    return () => clearTimeout(t);
  }, [currentPlayerId]);

  return (
    <div className={styles.tableWrapper}>
      {/* Информация о стадии и колоде */}
      <div className={styles.gameHeader}>
        <div className={styles.stageInfo}>Стадия {gameStage}</div>
        <div className={styles.deckInfo}>Колода: {deck.length}</div>
        {availableTargets.length > 0 && (
          <div className={styles.targetInfo}>Ходов: {availableTargets.length}</div>
        )}
      </div>
      
      {showFirstMove && currentPlayer && (
        <div className={styles.firstMoveBanner}>
          Ходит: <b>{currentPlayer.name}</b>
        </div>
      )}
      <div className={styles.tableBg}>
        <div className={styles.tableCenter}>

          
          {/* Стопка карт на столе для 2-й стадии */}
          {gameStage === 2 && tableStack.length > 0 && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 6
            }}>
              {tableStack.map((card, index) => (
                <div
                  key={`table-${card.id}-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${index * 2}px`,
                    top: `${index * 2}px`,
                    zIndex: index
                  }}
                >
                  <Image 
                    src={"/img/cards/" + CARD_BACK}
                    alt="table card" 
                    width={84} 
                    height={128}
                    style={{
                      boxShadow: index === tableStack.length - 1 ? 
                        '0 0 12px #ffd700' : '0 0 8px rgba(0,0,0,0.5)'
                    }}
                  />
                </div>
              ))}
              

            </div>
          )}
        </div>
        {/* Колода (смещена правее) - только для 1-й стадии */}
        {(gameStage as number) === 1 && deck.length > 0 && (
          <div 
            className={styles.deckInCenter} 
            style={{
              position:'absolute',
              left:'calc(50% + 40px)', // Смещена правее
              top:'50%',
              transform:'translate(-50%,-50%)',
              zIndex:5,
              cursor: turnPhase === 'showing_deck_hint' ? 'pointer' : 'default',
              opacity: turnPhase === 'showing_deck_hint' ? 1 : 0.8,
              filter: turnPhase === 'showing_deck_hint' ? 'drop-shadow(0 0 12px #22c55e)' : 'none'
            }}
            onClick={() => {
              if (turnPhase === 'showing_deck_hint') {
                onDeckClick();
              }
            }}
          >
            <Image 
              src={"/img/cards/" + CARD_BACK} 
              alt="deck" 
              width={84} 
              height={128} 
              style={{
                boxShadow: turnPhase === 'showing_deck_hint' ? '0 0 16px #22c55e' : '0 0 16px rgba(99, 102, 241, 0.4)'
              }} 
            />
            <span className={styles.deckCount}>{deck.length}</span>
            {turnPhase === 'showing_deck_hint' && (
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#22c55e',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
              }}>
                КЛИКНИ!
              </div>
            )}
          </div>
        )}

        {/* Центральная интерактивная кнопка для особых действий */}
        {(gameStage as number) === 1 && (turnPhase === 'waiting_deck_action' || turnPhase === 'showing_card_actions' || (availableTargets.length > 0 && turnPhase === 'analyzing_hand')) && (
          <div 
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
            onClick={() => {
              if (turnPhase === 'waiting_deck_action') {
                // При клике показываем действия для карты из колоды
                const hasTargets = availableTargets.length > 0;
                if (hasTargets || canPlaceOnSelfByRules) {
                  useGameStore.setState({ turnPhase: 'showing_card_actions' });
                } else {
                  takeCardNotByRules();
                }
              }
            }}
          >
            <button
              style={{
                width: '100px',
                height: '60px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.5)',
                animation: 'pulse 2s infinite',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.5)';
              }}
            >
              КЛИКНИ!
            </button>
          </div>
        )}

        {/* Открытая карта из колоды (слева от колоды) - только для 1-й стадии */}
        {(gameStage as number) === 1 && revealedDeckCard && (
          <div 
            className={styles.revealedCard}
            style={{
              position:'absolute',
              left:'calc(50% - 40px)', // Слева от колоды
              top:'50%',
              transform:'translate(-50%,-50%)',
              zIndex:6,
              cursor: turnPhase === 'waiting_deck_action' ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (turnPhase === 'waiting_deck_action') {
                // При клике на карту показываем действия
                const hasTargets = availableTargets.length > 0;
                if (hasTargets || canPlaceOnSelfByRules) {
                  // Если есть цели или можем положить на себя - переключаем в режим выбора действия
                  useGameStore.setState({ turnPhase: 'showing_card_actions' });
                } else {
                  // Если нет ни одного варианта - автоматически берём карту
                  takeCardNotByRules();
                }
              }
            }}
          >
            {/* Белый фон под картой */}
            <div style={{
              position: 'absolute',
              width: '84px',
              height: '128px',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              zIndex: -1
            }}></div>
            <Image 
              src={`/img/cards/${revealedDeckCard.image}`} 
              alt="revealed card" 
              width={84} 
              height={128} 
              style={{
                boxShadow: turnPhase === 'waiting_deck_action' ? '0 0 20px #00ff00' : '0 0 20px #ff6600',
                border: turnPhase === 'waiting_deck_action' ? '2px solid #00ff00' : '2px solid #ff6600',
                borderRadius: '6px'
              }} 
            />
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: turnPhase === 'waiting_deck_action' ? '#00ff00' : '#ff6600',
              color: turnPhase === 'waiting_deck_action' ? '#000' : '#fff',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}>
              {turnPhase === 'waiting_deck_action' ? 'КЛИКНИ НА КАРТУ!' : 'Карта колоды'}
            </div>
          </div>
        )}

        {/* Кнопки действий для карты из колоды - только для 1-й стадии */}
        {(gameStage as number) === 1 && revealedDeckCard && turnPhase === 'showing_card_actions' && (
          <div 
            style={{
              position:'absolute',
              left:'50%',
              top:'calc(50% + 60px)', // Под картами
              transform:'translateX(-50%)',
              zIndex:7,
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            {/* Кнопка "Сходить на соперника" (если есть цели) */}
            {availableTargets.length > 0 && (
              <button
                style={{
                  background: '#00ff00',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,255,0,0.4)'
                }}
                onClick={() => {
                  // Переключаемся в режим ожидания клика по сопернику
                  useGameStore.setState({ turnPhase: 'waiting_target_selection' });
                }}
              >
                🎯 Сходить ({availableTargets.length})
              </button>
            )}
            
            {/* Кнопка "Положить на себя и пропустить ход" (если некому положить или можно по правилам) */}
            {(availableTargets.length === 0 || canPlaceOnSelfByRules) && (
              <button
                style={{
                  background: '#ffd700',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255,215,0,0.4)'
                }}
                onClick={() => {
                  if (canPlaceOnSelfByRules) {
                    placeCardOnSelfByRules();
                  } else {
                    // Если некому положить - берём карту и пропускаем ход
                    takeCardNotByRules();
                  }
                }}
              >
                🏠 {canPlaceOnSelfByRules ? 'Себе' : 'Положить себе и пропустить'}
              </button>
            )}
          </div>
        )}

        {/* Игроки по кругу */}
        {players.map((p, i) => {
          const isCurrentPlayer = p.id === currentPlayerId;
          const isTargetAvailable = availableTargets.includes(i);
          // В состоянии ожидания выбора цели все доступные цели кликабельны
          const isClickableTarget = isTargetAvailable && (turnPhase === 'waiting_target_selection');
          
          return (
            <div
              key={p.id}
              className={`${styles.playerSeat} ${isTargetAvailable ? styles.highlightedTarget : ''}`}
              style={getCirclePosition(i, players.length)}
            >
              <div className={styles.avatarWrap}>
                <Image src={p.avatar || USER_AVATAR} alt="avatar" width={15} height={15} className={styles.avatar} />
                <span className={styles.playerName}>{p.name}</span>
                {isCurrentPlayer && <span style={{color:'#ffd700',marginLeft:4,fontWeight:700}}>⬤</span>}
                {isTargetAvailable && <span style={{color:'#00ff00',marginLeft:4}}>🎯</span>}
              </div>
                          <div className={styles.cardsRow}>
              <AnimatePresence>
                {p.cards.map((card, ci) => {
                  const isTopCard = ci === p.cards.length - 1;
                  const cardOffset = ci * 10; // Уменьшил смещение для компактности
                  
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
                        delay: (i * 0.15) + (ci * 0.08), 
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
                        zIndex: ci + 1
                      }}
                    >
                      <div
                        className={`${styles.card} ${card.open ? styles.open : styles.closed} ${isClickableTarget && isTopCard ? styles.targetCard : ''}`}
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
                          width={56}
                          height={88}
                          draggable={false}
                          priority
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Отображение пеньков (2 закрытые карты для 3-й стадии) */}
            {p.penki && p.penki.length > 0 && (
              <div className={styles.penkiRow}>
                {p.penki.map((penkiCard, pi) => (
                  <div
                    key={penkiCard.id}
                    className={styles.penkiCard}
                    style={{ 
                      left: `${pi * 8}px`,
                      zIndex: pi + 1
                    }}
                    title={`Пенёк ${pi + 1} (активируется в 3-й стадии)`}
                  >
                    <Image
                      src="/img/cards/back.png"
                      alt="penki"
                      width={35}
                      height={50}
                      style={{ 
                        borderRadius: '6px',
                        opacity: 0.8
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            </div>
          );
        })}
        {/* Зона сброса */}
        {gameStage >= 2 && (
          <div className={styles.dropZone} {...dropProps}>
            <span>Зона сброса</span>
          </div>
        )}
      </div>
      
      {/* Новый интерфейс для 1-й стадии */}
      {gameStage === 1 && currentPlayer && (
        <div className={styles.gameInterface}>
          
          {/* Отображение карт в руке игрока */}
          <div className={styles.playerHand}>
            <div className={styles.handTitle}>
              Ваши карты ({currentPlayer.cards.length})
            </div>
            <div className={styles.handCards}>
              <div style={{ position: 'relative', height: '100px', width: '160px', margin: '0 auto' }}>
                {currentPlayer.cards.map((card, index) => {
                  const isTopCard = index === currentPlayer.cards.length - 1;
                  // Для 1-й стадии
                  const isPlayable = (gameStage as number) === 1 && isTopCard && card.open && availableTargets.length > 0 && (turnPhase === 'analyzing_hand' || turnPhase === 'waiting_target_selection');
                  // Для 2-й стадии - любая открытая карта может быть выбрана
                  const isSelectableStage2 = (gameStage as number) === 2 && card.open && stage2TurnPhase === 'selecting_card';
                  const isSelected = (gameStage as number) === 2 && selectedHandCard?.id === card.id;
                  const cardOffset = index * 10; // Уменьшил смещение для компактности
                  
                  return (
                    <div 
                      key={card.id} 
                      className={`${styles.handCard} ${card.open ? styles.open : styles.closed} ${isPlayable ? styles.playable : ''} ${isSelectableStage2 ? styles.playable : ''}`}
                      style={{ 
                        position: 'absolute',
                        left: `${cardOffset}px`,
                        top: isSelected ? '-8px' : '0px', // Выбранная карта поднимается
                        zIndex: index + 1,
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        filter: isSelected ? 'drop-shadow(0 0 8px #00ff00)' : 'none',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onClick={() => {
                        if (isPlayable) {
                          // 1-я стадия: клик по верхней открытой карте - начинаем выбор цели
                          useGameStore.setState({ turnPhase: 'waiting_target_selection' });
                        } else if (isSelectableStage2) {
                          // 2-я стадия: выбор карты (двойной клик)
                          selectHandCard(card);
                        }
                      }}
                    >
                    <motion.div 
                      style={{ width: '100%', height: '100%' }}
                      initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        rotateY: 0,
                        transition: {
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                          delay: index * 0.1
                        }
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -5,
                        rotateY: card.open ? 8 : 0,
                        transition: { type: "spring", stiffness: 400, damping: 25 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        style={{ width: '100%', height: '100%' }}
                        {...(isPlayable && card.image ? {
                          onDragStart: (e: React.DragEvent<HTMLDivElement>) => dragProps.onDragStart(card as any, index, e),
                          onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => dragProps.onTouchStart(card as any, index, e),
                          onDragEnd: dragProps.onDragEnd,
                          draggable: true
                        } : {})}
                      >
                        {/* Золотой фон под картой */}
                        <div style={{
                          position: 'absolute',
                          width: '67px',
                          height: '100px',
                          background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
                          borderRadius: '8px',
                          zIndex: -1,
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                        }}></div>
                        <Image
                          src={card.open && card.image ? `/img/cards/${card.image}` : `/img/cards/back.png`}
                          alt={card.open ? 'card' : 'back'}
                          width={67}
                          height={100}
                          draggable={false}
                          priority
                          style={{ 
                            pointerEvents: 'none',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    </motion.div>
                    {/* Показать ранг карты если открыта */}
                    {card.open && card.rank && (
                      <div className={styles.cardRank}>
                        {card.rank === 14 ? 'A' : card.rank === 13 ? 'K' : card.rank === 12 ? 'Q' : card.rank === 11 ? 'J' : card.rank}
                      </div>
                    )}
                    {/* Подсказка для верхней карты */}
                    {isPlayable && (
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
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
            
            {/* Кнопки для 2-й стадии */}
            {(gameStage as number) === 2 && tableStack.length > 0 && stage2TurnPhase === 'waiting_beat' && (
              <div style={{
                marginTop: '16px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                {/* Кнопка "Побить" - показывается если есть карты для битья */}
                {currentPlayer.cards.some(card => 
                  card.open && canBeatCard(tableStack[tableStack.length - 1], card, trumpSuit || '')
                ) && (
                  <button
                    style={{
                      background: 'linear-gradient(145deg, #ff6b35, #f73e3e)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)'
                    }}
                    onClick={() => {
                      // Логика выбора карты для битья
                      const beatableCards = currentPlayer.cards.filter(card => 
                        card.open && canBeatCard(tableStack[tableStack.length - 1], card, trumpSuit || '')
                      );
                      if (beatableCards.length === 1) {
                        beatCard(beatableCards[0]);
                      } else {
                        // Если несколько карт - показать выбор
                        alert('Выберите карту для битья из доступных');
                      }
                    }}
                  >
                    ⚔️ Побить
                  </button>
                )}
                
                {/* Кнопка "Взять" */}
                <button
                  style={{
                    background: 'linear-gradient(145deg, #70a1ff, #5855e6)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(112, 161, 255, 0.4)'
                  }}
                  onClick={() => {
                    takeTableCards();
                  }}
                >
                  📥 Взять
                </button>
              </div>
            )}
          </div>
                </div>
      )}
      
      {/* Интерфейс для 2-й стадии */}
      {(gameStage as number) === 2 && currentPlayer && (
        <div className={styles.gameInterface}>
          
          {/* Отображение карт в руке игрока для 2-й стадии */}
          <div className={styles.playerHand}>
            <div className={styles.handTitle}>
              Ваши карты ({currentPlayer.cards.length})
            </div>
            <div className={styles.handCards}>
              <div style={{ position: 'relative', height: '100px', width: '160px', margin: '0 auto' }}>
                {currentPlayer.cards.map((card, index) => {
                  const isSelectableStage2 = card.open && stage2TurnPhase === 'selecting_card';
                  const isSelected = selectedHandCard?.id === card.id;
                  const cardOffset = index * 10; // Уменьшил смещение для компактности
                  
                  return (
                    <div 
                      key={card.id} 
                      className={`${styles.handCard} ${card.open ? styles.open : styles.closed} ${isSelectableStage2 ? styles.playable : ''}`}
                      style={{ 
                        position: 'absolute',
                        left: `${cardOffset}px`,
                        top: isSelected ? '-8px' : '0px', // Выбранная карта поднимается
                        zIndex: index + 1,
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        filter: isSelected ? 'drop-shadow(0 0 8px #00ff00)' : 'none',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onClick={() => {
                        if (isSelectableStage2) {
                          // 2-я стадия: выбор карты (двойной клик)
                          selectHandCard(card);
                        }
                      }}
                    >
                    <div 
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Золотой фон под картой */}
                      <div style={{
                        position: 'absolute',
                        width: '50px',
                        height: '75px',
                        background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
                        borderRadius: '8px',
                        zIndex: -1,
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                      }}></div>
                      <Image
                        src={card.open && card.image ? `/img/cards/${card.image}` : `/img/cards/back.png`}
                        alt={card.open ? 'card' : 'back'}
                        width={50}
                        height={75}
                        draggable={false}
                        priority
                        style={{ 
                          borderRadius: '8px',
                          boxShadow: card.open ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.5)'
                        }}
                      />
                    </div>
                    
                    {/* Подсказка "КЛИКНИ!" для 2-й стадии */}
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
          </div>
        </div>
      )}
 
    </div>
  );
} 