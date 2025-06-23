'use client'
import { Box, Flex, Text, Button, Input, Grid, Image, VStack, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy, FaMedal, FaPlus, FaMinus } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

export default function ProfilePage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #0f2027, #2c5364)" pb={20}>
      <Flex direction="column" align="center" maxW="420px" mx="auto" w="100%" px={4}>
        {/* Header */}
        <Flex as="header" align="center" justify="space-between" w="100%" px={0} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="transparent" position="sticky" top={0} zIndex={20} mb={2}>
          <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}>
            <FaArrowLeft style={{marginRight: 8}} />
            <Text display={{ base: 'none', sm: 'inline' }}>Назад</Text>
          </Button>
          <Text fontSize="2xl" fontWeight="bold" color="#ffd700">Профиль</Text>
          <Box w={6} />
        </Flex>
        {/* Профиль игрока */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={8} display="flex" flexDir="column" alignItems="center" textAlign="center" mt={4} mb={4} w="100%">
          <Image src="/img/default-avatar.png" alt="Аватар" boxSize={28} borderRadius="full" borderWidth={4} borderColor="#ffd700" mb={4} />
          <Text fontSize="2xl" fontWeight="bold" color="white" mb={1}>Игрок</Text>
          <Text color="green.400">Онлайн</Text>
        </Box>
        {/* Статистика */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mb={4}>Статистика</Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={2}>
            <Box bg="#181f2a" borderRadius="xl" p={4} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="#ffd700">1234</Text>
              <Text fontSize="xs" color="gray.400">Рейтинг</Text>
            </Box>
            <Box bg="#181f2a" borderRadius="xl" p={4} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.400">42</Text>
              <Text fontSize="xs" color="gray.400">Игр сыграно</Text>
            </Box>
            <Box bg="#181f2a" borderRadius="xl" p={4} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.400">65%</Text>
              <Text fontSize="xs" color="gray.400">Процент побед</Text>
            </Box>
          </Grid>
        </Box>
        {/* Достижения */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mb={4}>Достижения</Text>
          <VStack gap={3} align="stretch">
            <Flex bg="#181f2a" borderRadius="xl" p={4} align="center" gap={4}>
              <FaTrophy size={24} color="#ffd700" />
              <Box>
                <Text fontWeight={600} color="white">Первая победа</Text>
                <Text fontSize="xs" color="gray.400">Выиграйте свою первую игру</Text>
              </Box>
            </Flex>
            <Flex bg="#181f2a" borderRadius="xl" p={4} align="center" gap={4}>
              <FaMedal size={24} color="#4299e1" />
              <Box>
                <Text fontWeight={600} color="white">Ветеран</Text>
                <Text fontSize="xs" color="gray.400">Сыграйте 100 игр</Text>
              </Box>
            </Flex>
          </VStack>
        </Box>
        {/* История игр */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mb={4}>Последние игры</Text>
          <VStack gap={3} align="stretch">
            <Box bg="#181f2a" borderRadius="xl" p={4} display="flex" flexDir="column" gap={2}>
              <Flex justify="space-between" align="center">
                <Text fontWeight={600} color="white">Игра #42</Text>
                <Box px={3} py={1} borderRadius="lg" bgGradient="linear(to-r, #ffd700, #ffb900)" color="#232b3e" fontSize="xs" fontWeight="bold">Победа</Box>
              </Flex>
              <Flex align="center" gap={2} color="green.400">
                <FaPlus /> <Text>25 очков</Text>
              </Flex>
            </Box>
            <Box bg="#181f2a" borderRadius="xl" p={4} display="flex" flexDir="column" gap={2}>
              <Flex justify="space-between" align="center">
                <Text fontWeight={600} color="white">Игра #41</Text>
                <Box px={3} py={1} borderRadius="lg" bgGradient="linear(to-r, #232b3e, #ffd700)" color="white" fontSize="xs" fontWeight="bold">Поражение</Box>
              </Flex>
              <Flex align="center" gap={2} color="red.400">
                <FaMinus /> <Text>15 очков</Text>
              </Flex>
            </Box>
          </VStack>
        </Box>
        {/* Настройки */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mb={4}>Настройки</Text>
          <VStack gap={4} align="stretch">
            <Box>
              <Text as="label" color="gray.400" mb={1} display="block">Имя пользователя</Text>
              <Input w="full" px={3} py={2} borderRadius="lg" bg="#181f2a" color="white" _focus={{ borderColor: '#ffd700' }} value="Игрок" placeholder="Введите имя" />
            </Box>
            <Box>
              <Text as="label" color="gray.400" mb={1} display="block">Уведомления</Text>
              <HStack gap={2} mt={2}>
                <Button px={4} py={2} borderRadius="lg" bg="green.500" color="white" _hover={{ bg: 'green.600' }}>Включить</Button>
                <Button px={4} py={2} borderRadius="lg" bgGradient="linear(to-r, #232b3e, #ffd700)" color="white" _hover={{ bgGradient: 'linear(to-r, yellow.400, yellow.300)' }}>Выключить</Button>
              </HStack>
            </Box>
          </VStack>
        </Box>
        <BottomNav />
      </Flex>
    </Box>
  );
} 