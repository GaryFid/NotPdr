"use client";
import { Box, Flex, Text, Button, Grid, GridItem, VStack, HStack } from '@chakra-ui/react';
import { FaGamepad, FaUsers, FaUser, FaWallet, FaBook, FaPlay, FaUserPlus, FaStore } from 'react-icons/fa';
import BottomNav from '../components/BottomNav';

const NAV = [
  { label: 'Меню', icon: '🎮', page: 'main' },
  { label: 'Друзья', icon: '👥', page: 'friends' },
  { label: 'Профиль', icon: '👤', page: 'profile' },
  { label: 'Кошелёк', icon: '💰', page: 'wallet' },
  { label: 'Правила', icon: '📖', page: 'rules' },
];

export default function Home() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #0f2027, #2c5364)" pb="20">
      <Flex direction="column" align="center" maxW="420px" mx="auto" w="100%" px={4}>
        {/* Header */}
        <Text textAlign="center" fontWeight="bold" fontSize="2xl" letterSpacing={2} color="#ffd700" mt={8} mb={2}>
          P.I.D.R.
        </Text>
        {/* Баланс */}
        <Box bg="#ffd700" color="#222" borderRadius="xl" p={8} fontSize="4xl" fontWeight="bold" textAlign="center" mb={4} boxShadow="lg" w="100%">
          1000
          <Text fontSize="lg" fontWeight="normal" mt={2}>монет</Text>
        </Box>
        {/* Быстрые действия */}
        <Text color="gray.400" fontWeight="semibold" mb={3} fontSize="md" w="100%">БЫСТРЫЕ ДЕЙСТВИЯ</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
          <Button colorScheme="red" variant="outline" size="lg" borderRadius="xl" h="90px" fontWeight="bold" fontSize="lg" _hover={{ bg: 'red.500', color: 'white' }}>
            <FaPlay style={{marginRight: 8}} />Играть
          </Button>
          <Button colorScheme="red" variant="outline" size="lg" borderRadius="xl" h="90px" fontWeight="bold" fontSize="lg" _hover={{ bg: 'red.500', color: 'white' }}>
            <FaUserPlus style={{marginRight: 8}} />Пригласить
          </Button>
          <GridItem colSpan={2}>
            <Button colorScheme="yellow" variant="solid" size="lg" borderRadius="xl" h="90px" fontWeight="bold" fontSize="lg" w="100%" _hover={{ bg: 'yellow.400' }}>
              <FaStore style={{marginRight: 8}} />Магазин
            </Button>
          </GridItem>
        </Grid>
      </Flex>
      <BottomNav />
    </Box>
  );
}
