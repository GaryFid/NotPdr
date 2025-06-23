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
    <Box minH="100vh" bgGradient="linear(to-br, #f5f7fa, #e3eafc)" pb={20} display="flex" flexDir="column">
      {/* Game stage info */}
      <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
        <Box position="absolute" left="50%" top={8} transform="translate(-50%, 0)" bg="white" px={6} py={3} borderRadius="2xl" boxShadow="lg" display="flex" flexDir="column" alignItems="center" zIndex={30}>
          <Text fontWeight="bold" color="#1a4a7a" mb={1}>Стадия 1</Text>
          <Text fontSize="xs" color="gray.600">Сбросьте карту той же масти или значения</Text>
        </Box>
      </motion.div>
      {/* Table */}
      <Flex flex={1} align="center" justify="center" position="relative">
        <Box w="full" maxW="3xl" aspectRatio={16/9} bgGradient="linear(to-br, #1a4a7a, #3390ec)" borderRadius="3xl" boxShadow="2xl" position="relative" display="flex" alignItems="center" justifyContent="center">
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
            <motion.div key={i} initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{duration:0.3}} style={i===0?{position:'absolute', left:'50%', top:2, transform:'translateX(-50%)'}:{position:'absolute', right:2, top:`${20+20*i}%`}}>
              <Box display="flex" flexDir="column" alignItems="center" zIndex={20}>
                <Image src={p.avatar} alt="avatar" boxSize={12} borderRadius="full" borderWidth={2} borderColor="white" mb={1} />
                <Text fontSize="xs" fontWeight="bold" color="white" textShadow="0 1px 4px #000">{p.name}</Text>
                <Text fontSize="xs" color="whiteAlpha.800">Карт: {p.cards}</Text>
              </Box>
            </motion.div>
          ))}
        </Box>
        {/* Settings button */}
        <Button position="absolute" top={8} right={8} w={10} h={10} bg="white" borderRadius="full" display="flex" alignItems="center" justifyContent="center" boxShadow="lg" zIndex={30}><FaCog color="#1a4a7a" size={20} /></Button>
      </Flex>
      {/* Game controls */}
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
        <Box bg="white" px={4} py={6} borderTopRadius="3xl" boxShadow="2xl" display="flex" flexDir="column" gap={4} zIndex={40}>
          <Flex align="center" gap={3} mb={2}>
            <Image src="/img/player-avatar.svg" alt="avatar" boxSize={10} borderRadius="full" borderWidth={2} borderColor="#1a4a7a" />
            <Text fontWeight="bold" color="#1a4a7a">Игрок 1</Text>
          </Flex>
          <Flex gap={2} mb={2}>
            <Button flex={1} px={4} py={2} borderRadius="xl" bgGradient="linear(to-r, #1a4a7a, #3390ec)" color="white" fontWeight="bold" _hover={{ bgGradient: 'linear(to-r, #3390ec, #1a4a7a)' }}>Взять карту</Button>
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
      </motion.div>
      <BottomNav />
    </Box>
  );
} 