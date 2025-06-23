'use client'
import { Box, Flex, Text, Button, Input, Grid, Image, VStack, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUserPlus, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import BottomNav from '../../components/BottomNav';

export default function FriendsPage() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #181f2a, #232b3e)" pb={20}>
      {/* Header */}
      <Flex as="header" align="center" justify="space-between" px={4} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="#181f2a" position="sticky" top={0} zIndex={20}>
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}>
          <FaArrowLeft style={{marginRight: 8}} />
          <Text display={{ base: 'none', sm: 'inline' }}>Назад</Text>
        </Button>
        <Text fontSize="lg" fontWeight="bold" color="#ffd700">Друзья</Text>
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }}><FaUserPlus /></Button>
      </Flex>
      <Box as="main" maxW="lg" mx="auto" px={2}>
        {/* Поиск */}
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box position="relative" my={4}>
            <FaSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
            <Input placeholder="Поиск друзей..." pl={10} pr={4} py={2} borderRadius="lg" bg="#232b3e" color="white" _placeholder={{ color: 'gray.400' }} _focus={{ borderColor: '#ffd700' }} />
          </Box>
        </motion.div>
        {/* Онлайн */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box>
            <Text color="#ffd700" fontWeight={600} fontSize="md" mt={6} mb={2}>Онлайн</Text>
            <VStack bg="#232b3e" borderRadius="xl" p={2} align="stretch" gap={0}>
              {[1,2].map(i => (
                <Flex key={i} align="center" gap={3} py={3}>
                  <Image src="/img/default-avatar.png" alt="Аватар" boxSize={12} borderRadius="full" objectFit="cover" />
                  <Box flex={1}>
                    <Text fontWeight={600} color="white">Игрок #{i}</Text>
                    <Text fontSize="xs" color={i===1 ? 'green.400' : 'gray.400'}>{i===1?'В игре':'В сети'}</Text>
                  </Box>
                  <Button px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>Играть</Button>
                </Flex>
              ))}
            </VStack>
          </Box>
        </motion.section>
        {/* Все друзья */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box>
            <Text color="#ffd700" fontWeight={600} fontSize="md" mt={6} mb={2}>Все друзья</Text>
            <VStack bg="#232b3e" borderRadius="xl" p={2} align="stretch" gap={0}>
              {[3,4].map(i => (
                <Flex key={i} align="center" gap={3} py={3}>
                  <Image src="/img/default-avatar.png" alt="Аватар" boxSize={12} borderRadius="full" objectFit="cover" />
                  <Box flex={1}>
                    <Text fontWeight={600} color="white">Игрок #{i}</Text>
                    <Text fontSize="xs" color="gray.400">{i===3?'Был(а) 2 часа назад':'Был(а) вчера'}</Text>
                  </Box>
                  <Button px={4} py={2} borderRadius="lg" bgGradient="linear(to-r, #ffd700, #ffb900)" color="#232b3e" fontWeight="bold" _hover={{ bgGradient: 'linear(to-r, yellow.400, yellow.300)' }}>Профиль</Button>
                </Flex>
              ))}
            </VStack>
          </Box>
        </motion.section>
        {/* Запросы в друзья */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box>
            <Text color="#ffd700" fontWeight={600} fontSize="md" mt={6} mb={2}>Запросы в друзья</Text>
            <Box bg="#232b3e" borderRadius="xl" p={2}>
              <Flex align="center" gap={3} py={3}>
                <Image src="/img/default-avatar.png" alt="Аватар" boxSize={12} borderRadius="full" objectFit="cover" />
                <Box flex={1}>
                  <Text fontWeight={600} color="white">Игрок #5</Text>
                  <Text fontSize="xs" color="gray.400">Хочет добавить вас в друзья</Text>
                </Box>
                <HStack gap={2}>
                  <Button p={2} borderRadius="lg" bg="green.500" color="white" _hover={{ bg: 'green.600' }}><FaCheck /></Button>
                  <Button p={2} borderRadius="lg" bgGradient="linear(to-r, #ffd700, #ffb900)" color="#232b3e" _hover={{ bgGradient: 'linear(to-r, yellow.400, yellow.300)' }}><FaTimes /></Button>
                </HStack>
              </Flex>
            </Box>
          </Box>
        </motion.section>
        {/* Рекомендации */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box>
            <Text color="#ffd700" fontWeight={600} fontSize="md" mt={6} mb={2}>Возможные друзья</Text>
            <Grid templateColumns={{ base: '1fr 1fr', md: '1fr 1fr' }} gap={4}>
              {[6,7].map(i => (
                <VStack key={i} bg="#232b3e" borderRadius="xl" p={4} align="center" textAlign="center">
                  <Image src="/img/default-avatar.png" alt="Аватар" boxSize={20} borderRadius="full" objectFit="cover" mb={3} />
                  <Text color="white" fontWeight={600} mb={1}>Игрок #{i}</Text>
                  <Text fontSize="xs" color="gray.400" mb={2}>{i===6?'3 общих друга':'1 общий друг'}</Text>
                  <Button w="full" px={4} py={2} borderRadius="lg" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>Добавить</Button>
                </VStack>
              ))}
            </Grid>
          </Box>
        </motion.section>
      </Box>
      <BottomNav />
    </Box>
  );
}
