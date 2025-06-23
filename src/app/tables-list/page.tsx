'use client'
import { Box, Flex, Text, Button, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

const tables = [
  { id: 1, host: 'Игрок #1', players: '4/6' },
  { id: 2, host: 'Игрок #2', players: '5/7' },
];

export default function TablesListPage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #181f2a, #232b3e)" pb={20}>
      <Text fontSize="2xl" fontWeight="extrabold" color="#ffd700" textAlign="center" py={8} boxShadow="lg" borderBottomRadius="3xl" bgGradient="linear(to-r, #ffd700, #ffb900)" mb={4}>P.I.D.R.</Text>
      <Box as="main" maxW="lg" mx="auto" px={2}>
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box bg="#232b3e" borderRadius="2xl" p={6} mt={4} mb={4} boxShadow="xl">
            <Text color="#ffd700" fontWeight="bold" fontSize="xl" mb={4} textAlign="center">Доступные столы</Text>
            {tables.length === 0 ? (
              <Text color="gray.400" textAlign="center" py={8}>Нет доступных столов</Text>
            ) : (
              tables.map(table => (
                <Flex key={table.id} align="center" justify="space-between" bgGradient="linear(to-r, #ff4d4f, #ffd700)" borderRadius="xl" p={4} mb={4} boxShadow="md">
                  <Box>
                    <Text fontWeight="bold" color="white" fontSize="lg">{table.host}</Text>
                    <Text color="#ffd700" fontSize="sm" fontWeight="semibold">{table.players} игроков</Text>
                  </Box>
                  <Button px={6} py={2} borderRadius="2xl" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>Присоединиться</Button>
                </Flex>
              ))
            )}
            <Button display="block" mx="auto" mt={6} px={8} py={2} borderRadius="2xl" bgGradient="linear(to-r, #ff4d4f, #ffd700)" color="white" fontWeight="bold" _hover={{ bgGradient: 'linear(to-r, #ff4d4f, #ffd700)', opacity: 0.8 }} onClick={()=>history.back()}>
              ← Назад
            </Button>
          </Box>
        </motion.section>
      </Box>
      <BottomNav />
    </Box>
  );
} 