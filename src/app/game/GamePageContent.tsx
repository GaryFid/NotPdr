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

function getCirclePosition(idx: number, total: number, radius = 180) {
  const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
  return {
    left: `calc(50% + ${Math.cos(angle) * radius}px - 60px)` ,
    top: `calc(50% + ${Math.sin(angle) * radius}px - 60px)` ,
  };
}

function getFirstPlayerIdx(players: Player[]): number {
  let maxRank = -1;
  let idx = 0;
  players.forEach((p, i) => {
    const openCard = p.cards.find(c => c.open);
    if (openCard) {
      const rank = getCardRank(openCard.image);
      if (rank > maxRank) {
        maxRank = rank;
        idx = i;
      }
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
        width={48}
        height={72}
        className={styles.cardBackUnderlay}
        draggable={false}
        unoptimized
      />
      <Image
        src={`/img/cards/${image}`}
        alt="card"
        width={42}
        height={64}
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
    drawCardFromDeck,
    processPlayerTurn
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
      {showFirstMove && currentPlayer && (
        <div className={styles.firstMoveBanner}>
          Ходит: <b>{currentPlayer.name}</b> (Стадия {gameStage})
        </div>
      )}
      <div className={styles.tableBg}>
        <div className={styles.tableCenter} />
        {/* Колода в центре */}
        {deck.length > 0 && (
          <div className={styles.deckInCenter} style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:5}}>
            <Image src={"/img/cards/" + CARD_BACK} alt="deck" width={42} height={64} style={{boxShadow:'0 0 16px #ffd700'}} />
            <span className={styles.deckCount}>{deck.length}</span>
          </div>
        )}
        {/* Игроки по кругу */}
        {players.map((p, i) => {
          const isCurrentPlayer = p.id === currentPlayerId;
          const isTargetAvailable = availableTargets.includes(i);
          
          return (
            <div
              key={p.id}
              className={`${styles.playerSeat} ${isTargetAvailable ? styles.highlightedTarget : ''}`}
              style={getCirclePosition(i, players.length)}
            >
              <div className={styles.avatarWrap}>
                <Image src={p.avatar || USER_AVATAR} alt="avatar" width={30} height={30} className={styles.avatar} />
                <span className={styles.playerName}>{p.name}</span>
                {isCurrentPlayer && <span style={{color:'#ffd700',marginLeft:4,fontWeight:700}}>⬤</span>}
                {isTargetAvailable && <span style={{color:'#00ff00',marginLeft:4}}>🎯</span>}
              </div>
              <div className={styles.cardsRow}>
                <AnimatePresence>
                  {p.cards.map((card, ci) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: -40 }}
                      animate={{ opacity: dealt ? 1 : 0, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      transition={{ delay: (i * 0.3) + (ci * 0.1), duration: 0.4 }}
                      style={{ display: 'inline-block' }}
                    >
                      <div
                        className={`${styles.card} ${card.open ? styles.open : styles.closed} ${isTargetAvailable && ci === p.cards.length - 1 ? styles.targetCard : ''}`}
                        style={{ zIndex: ci, cursor: isTargetAvailable && ci === p.cards.length - 1 ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (isTargetAvailable && ci === p.cards.length - 1) {
                            makeMove(p.id);
                          }
                        }}
                      >
                        <Image
                          src={card.open && card.image ? `/img/cards/${card.image}` : `/img/cards/back.png`}
                          alt={card.open ? 'card' : 'back'}
                          width={42}
                          height={66}
                          draggable={false}
                          priority
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
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
      
      {/* Кнопки управления для 1-й стадии */}
      {gameStage === 1 && (
        <div className={styles.gameControls}>
          {canPlaceOnSelf && (
            <button className={styles.actionButton} onClick={placeCardOnSelf}>
              Положить себе и пропустить ход
            </button>
          )}
          <div className={styles.gameInfo}>
            <p>Стадия 1: Накопление карт</p>
            <p>Карт в колоде: {deck.length}</p>
            {availableTargets.length > 0 && <p>Доступно ходов: {availableTargets.length}</p>}
          </div>
        </div>
      )}
    </div>
  );
} 