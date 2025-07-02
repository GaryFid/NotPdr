'use client'
import { Box, Flex, Text, Button, Grid, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPalette, FaMagic, FaBolt, FaGift, FaCoins } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

export default function ShopPage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #0f2027, #2c5364)" pb={20}>
      <Flex direction="column" align="center" maxW="420px" mx="auto" w="100%" px={4}>
        {/* Header */}
        <Flex as="header" align="center" justify="space-between" w="100%" px={0} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="transparent" position="sticky" top={0} zIndex={20} mb={2}>
          <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}>
            <FaArrowLeft style={{marginRight: 8}} />
            <Text display={{ base: 'none', sm: 'inline' }}>Назад</Text>
          </Button>
          <Text fontSize="2xl" fontWeight="bold" color="#ffd700">Магазин</Text>
          <Flex align="center" gap={2} color="#ffd700" fontWeight="bold"><FaCoins /> 1000</Flex>
        </Flex>
        {/* Категории */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={4} w="100%" mt={4} mb={4}>
          <Flex gap={2} overflowX="auto" py={2}>
            <Button px={4} py={2} borderRadius="lg" bg="#181f2a" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Все</Button>
            <Button px={4} py={2} borderRadius="lg" bg="#181f2a" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Скины</Button>
            <Button px={4} py={2} borderRadius="lg" bg="#181f2a" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Эффекты</Button>
            <Button px={4} py={2} borderRadius="lg" bg="#181f2a" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Бустеры</Button>
          </Flex>
        </Box>
        {/* Товары */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mb={8}>
            {/* Скин */}
            <VStack bg="#181f2a" borderRadius="xl" p={4} align="center">
              <Flex h={24} w="full" align="center" justify="center" borderTopRadius="xl" bgGradient="linear(to-r, #ffd700, #ffb900)" mb={2}><FaPalette size={28} color="white" /></Flex>
              <Box w="full">
                <Text color="white" fontWeight={600} mb={1}>Золотой скин</Text>
                <Text fontSize="xs" color="gray.400" mb={2}>Эксклюзивный золотой скин для вашего профиля</Text>
                <Flex align="center" gap={2} fontWeight="bold" mb={2}><FaCoins color="#ffd700" /> 500</Flex>
                <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} mt={2}>Купить</Button>
              </Box>
            </VStack>
            {/* Эффект */}
            <VStack bg="#181f2a" borderRadius="xl" p={4} align="center">
              <Flex h={24} w="full" align="center" justify="center" borderTopRadius="xl" bgGradient="linear(to-r, #ff4d4f, #ffd700)" mb={2}><FaMagic size={28} color="white" /></Flex>
              <Box w="full">
                <Text color="white" fontWeight={600} mb={1}>Огненный след</Text>
                <Text fontSize="xs" color="gray.400" mb={2}>Оставляйте огненный след при движении</Text>
                <Flex align="center" gap={2} fontWeight="bold" mb={2}><FaCoins color="#ffd700" /> 300</Flex>
                <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} mt={2}>Купить</Button>
              </Box>
            </VStack>
            {/* Бустер */}
            <VStack bg="#181f2a" borderRadius="xl" p={4} align="center">
              <Flex h={24} w="full" align="center" justify="center" borderTopRadius="xl" bgGradient="linear(to-r, #232b3e, #ffd700)" mb={2}><FaBolt size={28} color="white" /></Flex>
              <Box w="full">
                <Text color="white" fontWeight={600} mb={1}>Ускоритель опыта</Text>
                <Text fontSize="xs" color="gray.400" mb={2}>x2 опыта на следующие 5 игр</Text>
                <Flex align="center" gap={2} fontWeight="bold" mb={2}><FaCoins color="#ffd700" /> 200</Flex>
                <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} mt={2}>Купить</Button>
              </Box>
            </VStack>
          </Grid>
        </Box>
        {/* Специальные предложения */}
        <Box bg="#232b3e" borderRadius="xl" boxShadow="lg" p={6} w="100%" mb={4}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mb={4}>Специальные предложения</Text>
          <Flex bg="#181f2a" borderRadius="xl" p={4} align="center" gap={4}>
            <Flex h={20} w={20} align="center" justify="center" borderRadius="xl" bgGradient="linear(to-r, #ffd700, #ffb900)"><FaGift size={28} color="white" /></Flex>
            <Box flex={1}>
              <Text fontWeight={600} color="white">Набор новичка</Text>
              <Text fontSize="xs" color="gray.400" mb={2}>Получите стартовый набор со скидкой 50%</Text>
              <Flex align="center" gap={2} fontWeight="bold" mb={2}><Text as="span" textDecoration="line-through" color="gray.400">1000</Text><FaCoins color="#ffd700" /> 500</Flex>
              <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} mt={2}>Купить</Button>
            </Box>
          </Flex>
        </Box>
        <BottomNav />
      </Flex>
    </Box>
  );
} 