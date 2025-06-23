'use client'
import { Box, Flex, Text, Button, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBook, FaChess, FaUsers, FaStar, FaCrown, FaExclamation, FaQuestion, FaListOl } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

export default function RulesPage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #181f2a, #232b3e)" pb={20}>
      {/* Header */}
      <Flex as="header" align="center" justify="space-between" px={4} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="#181f2a" position="sticky" top={0} zIndex={20}>
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}><FaArrowLeft /> <Text display={{ base: 'none', sm: 'inline' }} ml={2}>Назад</Text></Button>
        <Text fontSize="lg" fontWeight="bold" color="#ffd700">Правила</Text>
        <Box w={6} />
      </Flex>
      <Box as="main" maxW="lg" mx="auto" px={2}>
        {/* Заголовок */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box bg="#232b3e" borderRadius="xl" p={4} mt={6} mb={4}>
            <Flex align="center" gap={2} color="#ffd700" fontWeight="bold" fontSize="lg" mb={2}><FaBook /> Правила игры</Flex>
          </Box>
        </motion.section>
        {/* Основные правила */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box bg="#232b3e" borderRadius="xl" p={4} mb={4}>
            <Flex align="center" gap={2} color="#ffd700" fontWeight="semibold" mb={2}><FaChess /> Основные правила</Flex>
            <VStack align="start" gap={2}>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center"><FaUsers /></Box><Text fontWeight="semibold" color="white">Количество игроков</Text><Text fontSize="xs" color="gray.400" ml={2}>От 4 до 9 игроков</Text></Flex>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center"><FaStar /></Box><Text fontWeight="semibold" color="white">Карты игрока</Text><Text fontSize="xs" color="gray.400" ml={2}>У каждого игрока: 2 закрытые карты и 1 открытая</Text></Flex>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center"><FaStar /></Box><Text fontWeight="semibold" color="white">Цель игры</Text><Text fontSize="xs" color="gray.400" ml={2}>Избавиться от всех карт на руках</Text></Flex>
            </VStack>
          </Box>
        </motion.section>
        {/* Стадии игры */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box bg="#232b3e" borderRadius="xl" p={4} mb={4}>
            <Flex align="center" gap={2} color="#ffd700" fontWeight="semibold" mb={2}><FaListOl /> Стадии игры</Flex>
            <VStack align="start" gap={2}>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center" fontWeight="bold">1</Box><Text fontWeight="semibold" color="white">Базовые правила</Text></Flex>
              <Box as="ul" ml={8} fontSize="xs" color="gray.400" mb={2} style={{ listStyle: 'disc' }}>
                <li>Ход только верхней картой</li>
                <li>Карта должна быть на 1 ранг выше предыдущей</li>
                <li>Масти не важны</li>
              </Box>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center" fontWeight="bold">2</Box><Text fontWeight="semibold" color="white">Расширенные правила</Text></Flex>
              <Box as="ul" ml={8} fontSize="xs" color="gray.400" style={{ listStyle: 'disc' }}>
                <li>Добавляются правила мастей</li>
                <li>Активируется механика "Последняя!"</li>
                <li>Доступна механика "Сколько карт?"</li>
              </Box>
            </VStack>
          </Box>
        </motion.section>
        {/* Особые правила */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box bg="#232b3e" borderRadius="xl" p={4} mb={4}>
            <Flex align="center" gap={2} color="#ffd700" fontWeight="semibold" mb={2}><FaExclamation /> Особые правила</Flex>
            <VStack align="start" gap={2}>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center"><FaCrown /></Box><Text fontWeight="semibold" color="white">Правило двойки</Text><Text fontSize="xs" color="gray.400" ml={2}>Карта "2" может побить только туз (A)</Text></Flex>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center"><FaExclamation /></Box><Text fontWeight="semibold" color="white">Последняя!</Text><Text fontSize="xs" color="gray.400" ml={2}>Игрок должен объявить, когда у него остается одна карта</Text></Flex>
              <Flex align="center" gap={3}><Box bg="#ffd700" color="#232b3e" borderRadius="full" w={6} h={6} display="flex" alignItems="center" justifyContent="center"><FaQuestion /></Box><Text fontWeight="semibold" color="white">Сколько карт?</Text><Text fontSize="xs" color="gray.400" ml={2}>Игроки могут спрашивать количество карт у других участников</Text></Flex>
            </VStack>
          </Box>
        </motion.section>
      </Box>
      <BottomNav />
    </Box>
  );
} 