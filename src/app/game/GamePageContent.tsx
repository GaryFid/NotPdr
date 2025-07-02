'use client'
import { useState, useMemo } from 'react';
import Image from 'next/image';
import BottomNav from '../../components/BottomNav';
import styles from './GameTable.module.css';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import type { Player, Card } from '../../types/game';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

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
      <Image src={`/img/cards/${image}`} alt="card" width={64} height={96} priority />
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
  const playersCount = 6;
  const cardsPerPlayer = 3;
  const [{ hands, deck }] = useState(() => generateDeckAndDeal(playersCount, cardsPerPlayer));
  const [players, setPlayers] = useState<Player[]>(() => getPlayers(playersCount).map((p, i) => ({
    ...p,
    cards: [
      { id: `c${i}a`, image: CARD_BACK, open: false },
      { id: `c${i}b`, image: CARD_BACK, open: false },
      { id: `c${i}c`, image: `/img/cards/${hands[i][2]}`, open: true },
    ],
  })));
  const [stage, setStage] = useState<1 | 2>(1); // 1: раздача, 2: игра
  const [dealt, setDealt] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [lastPlayedRank, setLastPlayedRank] = useState<number | null>(null);
  const [draggedCard, setDraggedCard] = useState<{card: Card; playerIdx: number} | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const { dragProps, dropProps } = useDragAndDrop({
    onDrop: (card: Card, playerIdx: number) => {
      // Логика хода: можно положить только карту на 1 ранг выше
      const rank = getCardRank(card.image);
      if (playerIdx === currentPlayer && (lastPlayedRank === null || rank === lastPlayedRank + 1)) {
        // Удаляем карту из руки игрока
        setPlayers(prev => prev.map((p, idx) => idx === playerIdx ? {
          ...p,
          cards: p.cards.filter(c => c.id !== card.id)
        } : p));
        setLastPlayedRank(rank);
        setCurrentPlayer((prev) => (prev + 1) % players.length);
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

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableBg}>
        <div className={styles.tableCenter} />
        {/* Колода в центре */}
        {deck.length > 0 && (
          <div className={styles.deckInCenter}>
            <Image src={"/img/cards/" + CARD_BACK} alt="deck" width={64} height={96} style={{boxShadow:'0 0 16px #ffd700'}} />
            <span className={styles.deckCount}>{deck.length}</span>
          </div>
        )}
        {/* Игроки по кругу */}
        {players.map((p, i) => (
          <div
            key={p.id}
            className={styles.playerSeat}
            style={getCirclePosition(i, players.length)}
          >
            <div className={styles.avatarWrap}>
              <Image src={p.avatar} alt="avatar" width={30} height={30} className={styles.avatar} />
              <span className={styles.playerName}>{p.name}</span>
              {currentPlayer === i && stage === 2 && <span style={{color:'#ffd700',marginLeft:4,fontWeight:700}}>⬤</span>}
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
                    <Card
                      image={card.open ? (card.image.split('/').pop() as string) : CARD_BACK}
                      draggable={p.isUser && stage === 2 && card.open && currentPlayer === i && (lastPlayedRank === null || getCardRank(card.image) === lastPlayedRank + 1)}
                      onDragStart={e => dragProps.onDragStart(card, i, e)}
                      onTouchStart={e => dragProps.onTouchStart(card, i, e)}
                      style={{
                        zIndex: ci,
                        boxShadow: p.isUser ? '0 0 12px #ffd700' : undefined,
                        transform: p.isUser ? `translateY(-${ci*8}px)` : `rotate(${(ci-1)*8}deg)`
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
        {/* Зона сброса */}
        {stage === 2 && (
          <div className={styles.dropZone} {...dropProps}>
            <span>Сбросить карту</span>
          </div>
        )}
      </div>
      {/* Кнопка взять карту */}
      {stage === 1 && (
        <button className={styles.drawButton} onClick={() => { setStage(2); setDealt(true); }}>
          Взять карту
        </button>
      )}
      <BottomNav />
    </div>
  );
} 