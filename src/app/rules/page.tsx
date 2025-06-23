'use client'
import { Box, Flex, Text, Button, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBook, FaChess, FaUsers, FaStar, FaCrown, FaExclamation, FaQuestion, FaListOl } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

export default function RulesPage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #0f2027, #2c5364)" pb={20}>
      <Flex direction="column" align="center" maxW="420px" mx="auto" w="100%" px={4}>
        {/* Header */}
        <Flex as="header" align="center" justify="space-between" w="100%" px={0} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="transparent" position="sticky" top={0} zIndex={20} mb={2}>
          <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}><FaArrowLeft /> <Text display={{ base: 'none', sm: 'inline' }} ml={2}>Назад</Text></Button>
          <Text fontSize="2xl" fontWeight="bold" color="#ffd700">Правила</Text>
          <Box w={6} />
        </Flex>
        {/* Карточка: Правила игры */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mt={4} mb={4}>
          <Flex align="center" gap={2} color="#ffd700" fontWeight="bold" fontSize="xl" mb={2}><FaBook /> Правила игры</Flex>
        </Box>
        {/* Карточка: Основные правила */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Flex align="center" gap={2} color="#ffd700" fontWeight="semibold" fontSize="lg" mb={3}><FaChess /> Основные правила</Flex>
          <VStack align="start" gap={3} w="100%">
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center"><FaUsers /></Box><Text fontWeight="semibold" color="white">Количество игроков</Text><Text fontSize="sm" color="gray.400" ml={2}>От 4 до 9 игроков</Text></Flex>
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center"><FaStar /></Box><Text fontWeight="semibold" color="white">Карты игрока</Text><Text fontSize="sm" color="gray.400" ml={2}>У каждого игрока: 2 закрытые карты и 1 открытая</Text></Flex>
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center"><FaStar /></Box><Text fontWeight="semibold" color="white">Цель игры</Text><Text fontSize="sm" color="gray.400" ml={2}>Избавиться от всех карт на руках</Text></Flex>
          </VStack>
        </Box>
        {/* Карточка: Стадии игры */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Flex align="center" gap={2} color="#ffd700" fontWeight="semibold" fontSize="lg" mb={3}><FaListOl /> Стадии игры</Flex>
          <VStack align="start" gap={3} w="100%">
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center" fontWeight="bold">1</Box><Text fontWeight="semibold" color="white">Базовые правила</Text></Flex>
            <Box as="ul" ml={10} fontSize="sm" color="gray.400" mb={2} style={{ listStyle: 'disc' }}>
              <li>Ход только верхней картой</li>
              <li>Карта должна быть на 1 ранг выше предыдущей</li>
              <li>Масти не важны</li>
            </Box>
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center" fontWeight="bold">2</Box><Text fontWeight="semibold" color="white">Расширенные правила</Text></Flex>
            <Box as="ul" ml={10} fontSize="sm" color="gray.400" style={{ listStyle: 'disc' }}>
              <li>Добавляются правила мастей</li>
              <li>Активируется механика "Последняя!"</li>
              <li>Доступна механика "Сколько карт?"</li>
            </Box>
          </VStack>
        </Box>
        {/* Карточка: Особые правила */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Flex align="center" gap={2} color="#ffd700" fontWeight="semibold" fontSize="lg" mb={3}><FaExclamation /> Особые правила</Flex>
          <VStack align="start" gap={3} w="100%">
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center"><FaCrown /></Box><Text fontWeight="semibold" color="white">Правило двойки</Text><Text fontSize="sm" color="gray.400" ml={2}>Карта "2" может побить только туз (A)</Text></Flex>
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center"><FaExclamation /></Box><Text fontWeight="semibold" color="white">Последняя!</Text><Text fontSize="sm" color="gray.400" ml={2}>Игрок должен объявить, когда у него остается одна карта</Text></Flex>
            <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center"><FaQuestion /></Box><Text fontWeight="semibold" color="white">Сколько карт?</Text><Text fontSize="sm" color="gray.400" ml={2}>Игроки могут спрашивать количество карт у других участников</Text></Flex>
          </VStack>
        </Box>
        <BottomNav />
      </Flex>
    </Box>
  );
} 