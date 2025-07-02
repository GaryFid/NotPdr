"use client";
import { Box, Flex, Text, Button, Grid, GridItem, VStack, HStack } from '@chakra-ui/react';
// import { FaGamepad, FaUsers, FaUser, FaWallet, FaBook, FaPlay, FaUserPlus, FaStore } from 'react-icons/fa';
import BottomNav from '../components/BottomNav';

export default function Home() {
  return (
    <Box minH="100vh" bgGradient="linear(to-br, #0f2027, #2c5364)" pb="20">
      <Flex direction="column" align="center" maxW="420px" mx="auto" w="100%" px={4}>
        {/* Header */}
        <Text textAlign="center" fontWeight="bold" fontSize="2xl" letterSpacing={2} color="#ffd700" mt={8} mb={2}>
          P.I.D.R.
        </Text>
        {/* Баланс */}
        <Box bg="#ffd700" color="#222" borderRadius="xl" p={8} fontSize="4xl" fontWeight="bold" textAlign="center" mb={4} boxShadow="lg" w="100%">
          1000
          <Text fontSize="lg" fontWeight="normal" mt={2}>монет</Text>
        </Box>
        {/* Здесь можно добавить красивую обложку или приветствие */}
      </Flex>
      <BottomNav />
    </Box>
  );
}
