'use client'
import { Box, Flex, Text, Button, Grid, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPalette, FaMagic, FaBolt, FaGift, FaCoins } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

export default function ShopPage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #181f2a, #232b3e)" pb={20}>
      {/* Header */}
      <Flex as="header" align="center" justify="space-between" px={4} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="#181f2a" position="sticky" top={0} zIndex={20}>
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}><FaArrowLeft /> <Text display={{ base: 'none', sm: 'inline' }} ml={2}>Назад</Text></Button>
        <Text fontSize="lg" fontWeight="bold" color="#ffd700">Магазин</Text>
        <Flex align="center" gap={2} color="#ffd700" fontWeight="bold"><FaCoins /> 1000</Flex>
      </Flex>
      <Box as="main" maxW="lg" mx="auto" px={2}>
        {/* Категории */}
        <Box as={motion.div} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} display="flex" gap={2} overflowX="auto" py={4}>
          <Button px={4} py={2} borderRadius="lg" bg="#232b3e" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Все</Button>
          <Button px={4} py={2} borderRadius="lg" bg="#232b3e" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Скины</Button>
          <Button px={4} py={2} borderRadius="lg" bg="#232b3e" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Эффекты</Button>
          <Button px={4} py={2} borderRadius="lg" bg="#232b3e" color="white" fontWeight="bold" _hover={{ bg: '#ffd700', color: '#232b3e' }}>Бустеры</Button>
        </Box>
        {/* Товары */}
        <Box as={motion.section} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mb={8}>
            {/* Скин */}
            <VStack bg="#232b3e" borderRadius="xl" p={4} align="center">
              <Flex h={24} w="full" align="center" justify="center" borderTopRadius="xl" bgGradient="linear(to-r, #ffd700, #ffb900)" mb={2}><FaPalette size={28} color="white" /></Flex>
              <Box w="full">
                <Text color="white" fontWeight={600} mb={1}>Золотой скин</Text>
                <Text fontSize="xs" color="gray.400" mb={2}>Эксклюзивный золотой скин для вашего профиля</Text>
                <Flex align="center" gap={2} fontWeight="bold" mb={2}><FaCoins color="#ffd700" /> 500</Flex>
                <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} mt={2}>Купить</Button>
              </Box>
            </VStack>
            {/* Эффект */}
            <VStack bg="#232b3e" borderRadius="xl" p={4} align="center">
              <Flex h={24} w="full" align="center" justify="center" borderTopRadius="xl" bgGradient="linear(to-r, #ff4d4f, #ffd700)" mb={2}><FaMagic size={28} color="white" /></Flex>
              <Box w="full">
                <Text color="white" fontWeight={600} mb={1}>Огненный след</Text>
                <Text fontSize="xs" color="gray.400" mb={2}>Оставляйте огненный след при движении</Text>
                <Flex align="center" gap={2} fontWeight="bold" mb={2}><FaCoins color="#ffd700" /> 300</Flex>
                <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} mt={2}>Купить</Button>
              </Box>
            </VStack>
            {/* Бустер */}
            <VStack bg="#232b3e" borderRadius="xl" p={4} align="center">
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
        <Box as={motion.section} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} mb={8}>
          <Text color="#ffd700" fontWeight={600} fontSize="md" mt={8} mb={2}>Специальные предложения</Text>
          <Flex bg="#232b3e" borderRadius="xl" p={4} align="center" gap={4}>
            <Flex h={20} w={20} align="center" justify="center" borderRadius="xl" bgGradient="linear(to-r, #ffd700, #ffb900)"><FaGift size={28} color="white" /></Flex>
            <Box flex={1}>
              <Text color="white" fontWeight={600} mb={1}>Набор новичка</Text>
              <Text fontSize="xs" color="gray.400" mb={2}>Получите стартовый набор со скидкой 50%</Text>
              <Flex align="center" gap={2} fontWeight="bold" mb={2}><Text as="span" textDecoration="line-through" color="gray.400">1000</Text><FaCoins color="#ffd700" /> 500</Flex>
              <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }} mt={2}>Купить</Button>
            </Box>
          </Flex>
        </Box>
      </Box>
      <BottomNav />
    </Box>
  );
} 