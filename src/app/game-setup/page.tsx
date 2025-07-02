'use client'
import { Box, Flex, Text, Button, Grid, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaChess, FaBolt, FaCog, FaCheck, FaPlus, FaRobot } from 'react-icons/fa';
import { useState } from 'react';
import BottomNav from '../../components/BottomNav';

const tables = [4,5,6,7,8,9];
const modes = [
  { key: 'classic', icon: <FaChess />, label: 'Классический' },
  { key: 'quick', icon: <FaBolt />, label: 'Быстрый' },
  { key: 'custom', icon: <FaCog />, label: 'Свой' },
];

export default function GameSetupPage() {
  const [selectedTable, setSelectedTable] = useState(4);
  const [selectedMode, setSelectedMode] = useState('classic');
  const [addBots, setAddBots] = useState(false);
  const [testMode, setTestMode] = useState(false);

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #181f2a, #232b3e)" pb={20}>
      <Flex as="header" align="center" justify="space-between" px={4} py={3} borderBottomWidth={1} borderColor="#232b3e" bg="#181f2a" position="sticky" top={0} zIndex={20}>
        <Button variant="ghost" color="white" _hover={{ color: '#ffd700' }} onClick={() => history.back()}><FaArrowLeft /></Button>
        <Text fontSize="lg" fontWeight="bold" color="#ffd700">Настройка игры</Text>
        <Box w={8} />
      </Flex>
      <Box as="main" maxW="lg" mx="auto" px={2}>
        {/* Выбор стола */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box mt={6} mb={4}>
            <Text color="#ffd700" fontWeight={600} fontSize="md" mb={2}>Выберите стол</Text>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              {tables.map(n => (
                <Button key={n} onClick={()=>setSelectedTable(n)} position="relative" flexDir="column" alignItems="center" justifyContent="center" aspectRatio={1} borderRadius="xl" transition="all 0.2s" fontSize="3xl" fontWeight="bold" bg={selectedTable===n?'#ffd700':'#232b3e'} color={selectedTable===n?'#232b3e':'white'} boxShadow={selectedTable===n?'xl':'none'} style={selectedTable===n?{transform:'scale(1.05)'}:{}}>
                  {n}
                  <Text fontSize="xs" mt={1}>{n} игроков</Text>
                  {selectedTable===n && <Box position="absolute" top={2} right={2} bg="white" color="#ffd700" borderRadius="full" p={1}><FaCheck /></Box>}
                </Button>
              ))}
            </Grid>
          </Box>
        </motion.section>
        {/* Режимы игры */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box mb={4}>
            <Text color="#ffd700" fontWeight={600} fontSize="md" mb={2}>Режим игры</Text>
            <Flex gap={4}>
              {modes.map(mode => (
                <Button key={mode.key} onClick={()=>setSelectedMode(mode.key)} flexDir="column" alignItems="center" justifyContent="center" flex={1} borderRadius="xl" p={4} transition="all 0.2s" fontSize="2xl" fontWeight="bold" bg={selectedMode===mode.key?'#ffd700':'#232b3e'} color={selectedMode===mode.key?'#232b3e':'white'} boxShadow={selectedMode===mode.key?'xl':'none'} style={selectedMode===mode.key?{transform:'scale(1.05)'}:{}}>
                  <Box mb={1}>{mode.icon}</Box>
                  <Text fontSize="xs" fontWeight="bold">{mode.label}</Text>
                </Button>
              ))}
            </Flex>
          </Box>
        </motion.section>
        {/* Дополнительные настройки */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box mb={4}>
            <Text color="#ffd700" fontWeight={600} fontSize="md" mb={2}>Дополнительные настройки</Text>
            <VStack gap={4} align="stretch">
              <label style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={addBots} onChange={(e)=>setAddBots(e.target.checked)} style={{ accentColor: '#ffd700', width: 20, height: 20, borderRadius: 6, marginRight: 8 }} />
                <Text color="white">Добавить ботов</Text>
              </label>
              <label style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={testMode} onChange={(e)=>setTestMode(e.target.checked)} style={{ accentColor: '#ffd700', width: 20, height: 20, borderRadius: 6, marginRight: 8 }} />
                <Text color="white">Тестовый режим</Text>
              </label>
            </VStack>
          </Box>
        </motion.section>
        {/* Кнопки */}
        <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
          <Box display="flex" flexDirection="column" gap={4} mb={8}>
            <Button
              flex={1}
              px={4}
              py={3}
              borderRadius="xl"
              bg="#ffd700"
              color="#232b3e"
              fontWeight="bold"
              _hover={{ bg: 'yellow.400' }}
              onClick={() => window.location.href = `/game?ai=1&table=${selectedTable}&mode=${selectedMode}`}
            >
              <FaRobot style={{marginRight: 8}} />Играть с ботами
            </Button>
            <Box display="flex" gap={4}>
              <Button flex={1} px={4} py={3} borderRadius="xl" bg="#ffd700" color="#232b3e" fontWeight="bold" _hover={{ bg: 'yellow.400' }}>
                <FaPlus style={{marginRight: 8}} />Создать стол
              </Button>
              <Button flex={1} px={4} py={3} borderRadius="xl" bgGradient="linear(to-r, #232b3e, #ffd700)" color="white" fontWeight="bold" _hover={{ bgGradient: 'linear(to-r, yellow.400, yellow.300)' }}>
                <FaArrowLeft style={{marginRight: 8}} />Присоединиться
              </Button>
            </Box>
          </Box>
        </motion.section>
      </Box>
      <BottomNav />
    </Box>
  );
} 