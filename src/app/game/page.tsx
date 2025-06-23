'use client'
import { Box, Flex, Text, Button, Grid, Image, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaCog, FaArrowLeft, FaUser, FaPlus } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

const players = [
  { name: 'Игрок 1', avatar: '/img/player-avatar.svg', cards: 5 },
  { name: 'Игрок 2', avatar: '/img/player-avatar.svg', cards: 3 },
  { name: 'Игрок 3', avatar: '/img/player-avatar.svg', cards: 2 },
  { name: 'Игрок 4', avatar: '/img/player-avatar.svg', cards: 4 },
];

export default function GamePage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #0f2027, #2c5364)" pb={20} display="flex" flexDir="column">
      <Flex direction="column" align="center" maxW="420px" mx="auto" w="100%" px={4} flex={1}>
        {/* Game stage info */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mt={4} mb={4} textAlign="center">
          <Text fontWeight="bold" color="#ffd700" fontSize="lg" mb={1}>Стадия 1</Text>
          <Text fontSize="sm" color="gray.400">Сбросьте карту той же масти или значения</Text>
        </Box>
        {/* Table */}
        <Box w="100%" aspectRatio={16/9} bgGradient="linear(to-br, #1a4a7a, #3390ec)" borderRadius="3xl" boxShadow="2xl" position="relative" display="flex" alignItems="center" justifyContent="center" mb={4}>
          {/* Card deck and discard */}
          <Flex position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" gap={8} zIndex={10}>
            <Box w={16} h={24} bgGradient="linear(to-br, #1a4a7a, #3390ec)" borderRadius="lg" boxShadow="lg" display="flex" alignItems="center" justifyContent="center">
              <Image src="/img/card-back.png" alt="deck" w="full" h="full" objectFit="cover" borderRadius="lg" />
            </Box>
            <Box w={16} h={24} bg="white" borderRadius="lg" boxShadow="lg" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="2xl" fontWeight="bold" color="#1a4a7a">A♠</Text>
            </Box>
          </Flex>
          {/* Players */}
          {players.map((p, i) => (
            <Box key={i} position="absolute" right={i===0?undefined:2} left={i===0?'50%':undefined} top={i===0?2:`${20+20*i}%`} transform={i===0?'translateX(-50%)':undefined} zIndex={20}>
              <Box display="flex" flexDir="column" alignItems="center">
                <Image src={p.avatar} alt="avatar" boxSize={12} borderRadius="full" borderWidth={2} borderColor="white" mb={1} />
                <Text fontSize="xs" fontWeight="bold" color="white" textShadow="0 1px 4px #000">{p.name}</Text>
                <Text fontSize="xs" color="whiteAlpha.800">Карт: {p.cards}</Text>
              </Box>
            </Box>
          ))}
          {/* Settings button */}
          <Button position="absolute" top={4} right={4} w={10} h={10} bg="white" borderRadius="full" display="flex" alignItems="center" justifyContent="center" boxShadow="lg" zIndex={30}><FaCog color="#1a4a7a" size={20} /></Button>
        </Box>
        {/* Game controls */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Flex align="center" gap={3} mb={2}>
            <Image src="/img/player-avatar.svg" alt="avatar" boxSize={10} borderRadius="full" borderWidth={2} borderColor="#1a4a7a" />
            <Text fontWeight="bold" color="#ffd700">Игрок 1</Text>
          </Flex>
          <Flex gap={2} mb={2}>
            <Button flex={1} px={4} py={2} borderRadius="xl" bgGradient="linear(to-r, #232b3e, #ffd700)" color="white" fontWeight="bold" _hover={{ bgGradient: 'linear(to-r, yellow.400, yellow.300)' }}>Взять карту</Button>
          </Flex>
          <Flex gap={2} overflowX="auto" pb={2}>
            {[1,2,3,4,5].map(i => (
              <Box key={i} w={16} h={24} bg="white" borderRadius="lg" boxShadow="lg" display="flex" flexDir="column" alignItems="center" justifyContent="center" cursor="pointer" _hover={{ transform: 'scale(1.05)' }} transition="all 0.2s">
                <Text fontSize="xl" fontWeight="bold" color="#1a4a7a">{i===1?'A':'K'}</Text>
                <Text fontSize="lg" color="#1a4a7a">♠</Text>
              </Box>
            ))}
          </Flex>
        </Box>
        <BottomNav />
      </Flex>
    </Box>
  );
} 