"use client";
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Flex, Text } from '@chakra-ui/react';
// import { FaGamepad, FaUsers, FaUser, FaWallet, FaBook, FaPlay, FaUserPlus, FaStore } from 'react-icons/fa';
import { MainMenu } from '../components/main_menu_component'

function HomeWithParams() {
  const searchParams = useSearchParams();

  // Обработка реферального кода из URL
  useEffect(() => {
    const referralCode = searchParams.get('ref');
    if (referralCode) {
      handleReferralCode(referralCode);
    }
  }, [searchParams]);

  const handleReferralCode = async (referralCode: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Если пользователь не авторизован, сохраняем код для использования после входа
        localStorage.setItem('pending_referral_code', referralCode);
        alert('🎁 Реферальный код сохранен! Войдите в игру чтобы получить бонус 100 монет.');
        return;
      }

      // Если пользователь авторизован, сразу используем код
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'use_referral',
          referralCode: referralCode
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`🎉 ${result.message}`);
        // Очищаем URL от реферального кода
        const url = new URL(window.location.href);
        url.searchParams.delete('ref');
        window.history.replaceState({}, '', url.toString());
      } else {
        alert(result.error || 'Ошибка при использовании реферального кода');
      }
    } catch (error) {
      console.error('Error processing referral code:', error);
      alert('Ошибка при обработке реферального кода');
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'wallet') {
      window.location.href = '/wallet';
    } else if (page === 'profile') {
      window.location.href = '/profile';
    } else if (page === 'rating') {
      window.location.href = '/rating';
    } else if (page === 'rules') {
      window.location.href = '/rules';
    } else if (page === 'game') {
      window.location.href = '/game-setup';
    } else if (page === 'multiplayer') {
      window.location.href = '/multiplayer';
    } else if (page === 'invite') {
      window.location.href = '/friends';
    } else if (page === 'shop') {
      window.location.href = '/shop';
    } else if (page === 'menu') {
      // открыть бургер-меню, если нужно
    }
  };
  
  return <MainMenu onNavigate={handleNavigate} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HomeWithParams />
    </Suspense>
  );
}
