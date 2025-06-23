'use client'
import { Box, Flex, Text, Button, Input, Grid, Image, VStack, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCoins, FaPlus, FaGift, FaShoppingCart, FaStar, FaTelegram, FaShareAlt } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

export default function WalletPage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #181f2a, #232b3e)" pb={20}>
      {/* Header */}
      <Flex as="header" align="center" justify="space-between" px={4} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="#181f2a" position="sticky" top={0} zIndex={20}>
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} leftIcon={<FaArrowLeft />} onClick={() => history.back()}>
          <Text display={{ base: 'none', sm: 'inline' }}>Назад</Text>
        </Button>
        <Text fontSize="lg" fontWeight="bold" color="#ffd700">Кошелёк</Text>
        <Box w={6} />
      </Flex>
      <Box as="main" maxW="lg" mx="auto" px={2}>
        {/* Баланс */}
        <Box as={motion.div} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} bg="#232b3e" borderRadius="xl" p={8} display="flex" flexDir="column" alignItems="center" textAlign="center" mt={6}>
          <Text fontSize="sm" color="gray.400" mb={2}>Текущий баланс</Text>
          <Flex fontSize="4xl" fontWeight="bold" color="#ffd700" align="center" gap={2} mb={2}><FaCoins /> 1000</Flex>
          <Button px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} leftIcon={<FaPlus />} mt={2}>Пополнить</Button>
        </Box>
        {/* История транзакций */}
        <Box as={motion.section} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mt={8} mb={2}>История транзакций</Text>
          <VStack bg="#232b3e" borderRadius="xl" p={2} divider={<Box h="1px" bg="#232b3e" opacity={0.6} />} align="stretch" spacing={0}>
            <Flex align="center" gap={3} py={3}>
              <Flex w={10} h={10} borderRadius="lg" align="center" justify="center" bgGradient="linear(to-r, #ff4d4f, #ffd700)" color="white"><FaShoppingCart /></Flex>
              <Box flex={1}>
                <Text fontWeight={600} color="white">Покупка скина</Text>
                <Text fontSize="xs" color="gray.400">2 часа назад</Text>
              </Box>
              <Flex color="red.400" fontWeight="bold" align="center" gap={1}>-500 <FaCoins color="#ffd700" /></Flex>
            </Flex>
            <Flex align="center" gap={3} py={3}>
              <Flex w={10} h={10} borderRadius="lg" align="center" justify="center" bgGradient="linear(to-r, #ffd700, #ffb900)" color="white"><FaGift /></Flex>
              <Box flex={1}>
                <Text fontWeight={600} color="white">Бонус за победу</Text>
                <Text fontSize="xs" color="gray.400">5 часов назад</Text>
              </Box>
              <Flex color="green.400" fontWeight="bold" align="center" gap={1}>+100 <FaCoins color="#ffd700" /></Flex>
            </Flex>
            <Flex align="center" gap={3} py={3}>
              <Flex w={10} h={10} borderRadius="lg" align="center" justify="center" bgGradient="linear(to-r, #232b3e, #ffd700)" color="white"><FaStar /></Flex>
              <Box flex={1}>
                <Text fontWeight={600} color="white">Достижение разблокировано</Text>
                <Text fontSize="xs" color="gray.400">1 день назад</Text>
              </Box>
              <Flex color="green.400" fontWeight="bold" align="center" gap={1}>+250 <FaCoins color="#ffd700" /></Flex>
            </Flex>
          </VStack>
        </Box>
        {/* Способы пополнения */}
        <Box as={motion.section} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mt={8} mb={2}>Способы пополнения</Text>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <VStack bg="#232b3e" borderRadius="xl" p={4} align="center" textAlign="center">
              <FaTelegram size={28} color="#4299e1" style={{ marginBottom: 8 }} />
              <Text color="white" fontWeight={600} mb={1}>Telegram Premium</Text>
              <Text fontSize="xs" color="gray.400" mb={2}>Получите +500 монет</Text>
              <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>Активировать</Button>
            </VStack>
            <VStack bg="#232b3e" borderRadius="xl" p={4} align="center" textAlign="center">
              <FaGift size={28} color="#ffd700" style={{ marginBottom: 8 }} />
              <Text color="white" fontWeight={600} mb={1}>Промокод</Text>
              <Text fontSize="xs" color="gray.400" mb={2}>Введите промокод</Text>
              <Input w="full" px={3} py={2} borderRadius="lg" bg="#181f2a" color="white" focusBorderColor="#ffd700" mb={2} placeholder="PIDR2024" />
              <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>Применить</Button>
            </VStack>
            <VStack bg="#232b3e" borderRadius="xl" p={4} align="center" textAlign="center">
              <FaShareAlt size={28} color="#38a169" style={{ marginBottom: 8 }} />
              <Text color="white" fontWeight={600} mb={1}>Поделиться</Text>
              <Text fontSize="xs" color="gray.400" mb={2}>+100 монет за приглашение</Text>
              <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>Пригласить</Button>
            </VStack>
          </Grid>
        </Box>
      </Box>
      <BottomNav />
    </Box>
  );
} 