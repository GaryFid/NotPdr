"use client";
import { Box, Flex, Text } from '@chakra-ui/react';
// import { FaGamepad, FaUsers, FaUser, FaWallet, FaBook, FaPlay, FaUserPlus, FaStore } from 'react-icons/fa';
import BottomNav from '../components/BottomNav';

export default function Home() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #181c2a, #232b3e 60%, #0f2027)" pb="20">
      <Flex direction="column" align="center" justify="center" maxW="420px" mx="auto" w="100%" px={4} minH="80vh">
        {/* Header */}
        <Text textAlign="center" fontWeight="extrabold" fontSize="4xl" letterSpacing={2} color="#ffd700" mt={12} mb={4} style={{textShadow:'0 2px 12px #232b3e'}}>P.I.D.R.</Text>
        {/* Красивая обложка или приветствие */}
        <Box mt={8} mb={8}>
          <Text fontSize="xl" color="whiteAlpha.800" textAlign="center" fontWeight="medium">
            Добро пожаловать в карточную игру нового поколения!
          </Text>
        </Box>
      </Flex>
      <BottomNav />
    </Box>
  );
}
