'use client'
import { useState, useMemo } from 'react';
import Image from 'next/image';
import BottomNav from '../../components/BottomNav';
import styles from './GameTable.module.css';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import type { Player, Card } from '../../types/game';

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

export default function GamePageContent() {
  const [stage, setStage] = useState<1 | 2>(1); // 1: draw, 2: play
  const [players, setPlayers] = useState<Player[]>(() => getPlayers(6));
  const [draggedCard, setDraggedCard] = useState<{card: Card; playerIdx: number} | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const { dragProps, dropProps } = useDragAndDrop({
    onDrop: (card: Card, playerIdx: number) => {
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

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableBg}>
        {/* Стол */}
        <div className={styles.tableCenter} />
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
            </div>
            <div className={styles.cardsRow}>
              {p.cards.map((card, ci) => (
                <Card
                  key={card.id}
                  image={card.open ? (card.image.split('/').pop() as string) : CARD_BACK}
                  draggable={p.isUser && stage === 2 && card.open}
                  onDragStart={e => dragProps.onDragStart(card, i, e)}
                  onTouchStart={e => dragProps.onTouchStart(card, i, e)}
                  style={{
                    zIndex: ci,
                    boxShadow: p.isUser ? '0 0 12px #ffd700' : undefined,
                    transform: p.isUser ? `translateY(-${ci*8}px)` : `rotate(${(ci-1)*8}deg)`
                  }}
                />
              ))}
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
        <button className={styles.drawButton} onClick={() => setStage(2)}>
          Взять карту
        </button>
      )}
      <BottomNav />
    </div>
  );
} 