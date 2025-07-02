'use client'
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Box, Flex, Text, Button, Image as ChakraImage } from '@chakra-ui/react';
import { FaCog, FaArrowLeft } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

const cardBack = '/img/cards/back.png';
const cardFaces = [
  '/img/cards/ace_of_spades.png',
  '/img/cards/king_of_hearts.png',
  '/img/cards/queen_of_diamonds.png',
  '/img/cards/jack_of_clubs.png',
  // ... можно добавить любые карты для примера
];

function getPlayers(count: number) {
  // Для примера: 1 реальный игрок, остальные — AI
  return Array.from({ length: count }, (_, i) => ({
    name: i === 0 ? 'Вы' : `AI ${i}`,
    avatar: '/img/player-avatar.svg',
    openCard: cardFaces[i % cardFaces.length],
    closedCards: [cardBack, cardBack],
    isUser: i === 0,
  }));
}

export default function GamePageContent() {
  const params = useSearchParams();
  const table = parseInt(params.get('table') || '4', 10);
  const players = useMemo(() => getPlayers(table), [table]);

  // Определяем, кто ходит первым (у кого самая "старшая" карта)
  const firstPlayerIdx = 0; // TODO: логика сравнения карт

  // Расположение игроков по кругу
  const getPlayerPosition = (idx: number, total: number) => {
    const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
    const radius = 160;
    return {
      left: `calc(50% + ${Math.cos(angle) * radius}px - 48px)`,
      top: `calc(50% + ${Math.sin(angle) * radius}px - 60px)`,
    };
  };

  return (
    <Box minH="100vh" className="main-menu-container" pb={20}>
      <Flex as="header" align="center" justify="space-between" px={4} py={3} className="menu-header" position="sticky" top={0} zIndex={20} boxShadow="md">
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}><FaArrowLeft /></Button>
        <Text fontSize="lg" fontWeight="bold" className="menu-title">Игра</Text>
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }}><FaCog /></Button>
      </Flex>
      <Box position="relative" width="100%" maxWidth={420} height={420} mx="auto" mt={8} mb={8}>
        {/* Стол */}
        <Box position="absolute" left="50%" top="50%" style={{ transform: 'translate(-50%, -50%)' }} width={260} height={260} borderRadius="full" boxShadow="2xl" bgGradient="radial(#232b3e 60%, #0a1833 100%)" border="4px solid #ffd700" zIndex={1} />
        {/* Игроки по кругу */}
        {players.map((p, i) => (
          <Box key={i} position="absolute" style={getPlayerPosition(i, players.length)} zIndex={2} display="flex" flexDirection="column" alignItems="center">
            <ChakraImage src={p.avatar} alt="avatar" boxSize={48} borderRadius="full" borderWidth={3} borderColor={i===firstPlayerIdx?'#ffd700':'#fff'} mb={1} boxShadow="lg" />
            <Flex gap={1} mb={1}>
              <ChakraImage src={p.closedCards[0]} alt="closed" boxSize={32} borderRadius="md" boxShadow="md" />
              <ChakraImage src={p.closedCards[1]} alt="closed" boxSize={32} borderRadius="md" boxShadow="md" />
              <ChakraImage src={p.openCard} alt="open" boxSize={32} borderRadius="md" boxShadow="md" border={i===firstPlayerIdx?'2px solid #ffd700':'2px solid #fff'} />
            </Flex>
            <Text fontSize="sm" fontWeight="bold" color="#ffd700" textShadow="0 1px 4px #000">{p.name}</Text>
          </Box>
        ))}
      </Box>
      {/* Кнопки действий */}
      <Flex justify="center" gap={4} mt={2}>
        <Button px={6} py={3} borderRadius="xl" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>
          Взять карту
        </Button>
        <Button px={6} py={3} borderRadius="xl" bgGradient="linear(to-r, #232b3e, #ffd700)" color="white" fontWeight="bold" _hover={{ bgGradient: 'linear(to-r, yellow.400, yellow.300)' }}>
          Пас
        </Button>
      </Flex>
      <BottomNav />
    </Box>
  );
} 