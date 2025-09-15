"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spinner, Text, Flex } from '@chakra-ui/react';
import { MainMenu } from '../components/main_menu_component'

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  rating: number;
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
}

function HomeWithParams() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = () => {
      console.log('🔍 Проверка авторизации на главной странице');
      
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      console.log('Token:', !!token);
      console.log('UserData:', !!userData);
      
      if (!token || !userData) {
        console.log('❌ Нет токена или данных пользователя, перенаправляем на логин');
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Пользователь найден:', parsedUser.username);
        setUser(parsedUser);
        setLoading(false);
      } catch (error) {
        console.error('❌ Ошибка парсинга данных пользователя:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('current_user');
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
        return;
      }
    };

    checkAuth();
  }, [router]);

  // Обработка реферального кода из URL
  useEffect(() => {
    const referralCode = searchParams.get('ref');
    if (referralCode && user) {
      handleReferralCode(referralCode);
    }
  }, [searchParams, user]);

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
    } else if (page === 'new-room') {
      window.location.href = '/new-room';
    } else if (page === 'invite') {
      window.location.href = '/friends';
    } else if (page === 'shop') {
      window.location.href = '/shop';
    } else if (page === 'menu') {
      // открыть бургер-меню, если нужно
    }
  };
  
  if (loading) {
    return (
      <Flex 
        minH="100vh" 
        alignItems="center" 
        justifyContent="center" 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        flexDirection="column"
      >
        <Spinner size="xl" color="white" />
        <Text mt={4} color="white" fontSize="lg">
          Загрузка P.I.D.R...
        </Text>
      </Flex>
    );
  }

  if (!user) {
    return null; // Будет перенаправлен middleware'ом
  }

  return <MainMenu onNavigate={handleNavigate} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HomeWithParams />
    </Suspense>
  );
}
