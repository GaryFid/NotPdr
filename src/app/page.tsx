"use client";
import { Box, Flex, Text } from '@chakra-ui/react';
// import { FaGamepad, FaUsers, FaUser, FaWallet, FaBook, FaPlay, FaUserPlus, FaStore } from 'react-icons/fa';
import { MainMenu } from '../components/main_menu_component'

export default function Home() {
  const handleNavigate = (page: string) => {
    // Здесь можно реализовать роутинг или стейт
    if (page === 'wallet') {
      window.location.href = '/wallet';
    } else if (page === 'profile') {
      window.location.href = '/profile';
    } else if (page === 'rating') {
      window.location.href = '/rating';
    } else if (page === 'rules') {
      window.location.href = '/rules';
    } else if (page === 'game') {
      window.location.href = '/game';
    }
  };
  return <MainMenu onNavigate={handleNavigate} />;
}
