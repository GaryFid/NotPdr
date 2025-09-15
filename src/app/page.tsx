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

  // Функция для загрузки пользователя из базы данных
  const loadUserFromDatabase = async (userId: string, token: string) => {
    try {
      console.log('🔄 Загружаем данные пользователя из БД:', userId);
      
      const response = await fetch(`/api/auth?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          console.log('✅ Данные пользователя загружены из БД:', data.user);
          
          // Обновляем локальные данные
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('current_user', JSON.stringify(data.user));
          
          // Диспатчим событие обновления монет
          window.dispatchEvent(new CustomEvent('coinsUpdated', { 
            detail: { coins: data.user.coins } 
          }));
          
          setUser(data.user);
          setLoading(false);
          return;
        }
      }
      
      console.warn('⚠️ Не удалось загрузить данные из БД, используем локальные');
      const localData = localStorage.getItem('user') || localStorage.getItem('current_user');
      if (localData) {
        const parsedUser = JSON.parse(localData);
        setUser(parsedUser);
      }
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных из БД:', error);
      
      // Используем локальные данные как fallback
      const localData = localStorage.getItem('user') || localStorage.getItem('current_user');
      if (localData) {
        const parsedUser = JSON.parse(localData);
        setUser(parsedUser);
      }
      setLoading(false);
    }
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Проверка авторизации на главной странице');
      console.log('🔍 window.Telegram?.WebApp:', !!window.Telegram?.WebApp);
      
      // Если это Telegram WebApp и нет токена - автоматически авторизуемся
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          console.log('🤖 Автоматическая авторизация через Telegram WebApp');
          
          const tg = window.Telegram.WebApp;
          const initData = tg.initData;
          const user = tg.initDataUnsafe?.user;

          if (initData && user) {
            try {
              console.log('📡 Отправляем запрос на автоавторизацию:', user);
              
              const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'telegram',
                  id: user.id,
                  username: user.username,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  photo_url: user.photo_url,
                  initData: initData,
                })
              });

              const data = await response.json();

              if (data.success) {
                console.log('✅ Автоматическая Telegram авторизация успешна:', data.user);
                
                // Сохраняем данные пользователя
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('current_user', JSON.stringify(data.user));
                
                // Диспатчим событие обновления монет
                window.dispatchEvent(new CustomEvent('coinsUpdated', { 
                  detail: { coins: data.user.coins } 
                }));
                
                setUser(data.user);
                setLoading(false);
                return;
              } else {
                console.error('❌ Ошибка автоавторизации:', data.message);
              }
            } catch (error) {
              console.error('❌ Ошибка сети при автоавторизации:', error);
            }
          }
        }
      }
      
      // Обычная проверка авторизации
      setTimeout(() => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');
        const currentUser = localStorage.getItem('current_user');
        
        console.log('🔍 Проверяем данные авторизации:');
        console.log('Token:', !!token, token ? token.substring(0, 20) + '...' : 'null');
        console.log('UserData:', !!userData);
        console.log('CurrentUser:', !!currentUser);
        
        if (userData) {
          console.log('📝 UserData содержимое:', userData.substring(0, 100) + '...');
        }
        
        // Проверяем любой из источников данных пользователя
        const userDataSource = userData || currentUser;
        
        if (!token || !userDataSource) {
          console.log('❌ Нет токена или данных пользователя, перенаправляем на логин');
          console.log('❌ Token exists:', !!token);
          console.log('❌ UserData exists:', !!userData);
          console.log('❌ CurrentUser exists:', !!currentUser);
          
          // ВРЕМЕННО: пропускаем авторизацию для тестирования
          console.log('⚠️ ВРЕМЕННЫЙ РЕЖИМ: создаем тестового пользователя');
          const tempUser = {
            id: 'temp_user_' + Date.now(),
            username: 'TestUser',
            coins: 1000,
            rating: 0,
            gamesPlayed: 0,
            gamesWon: 0
          };
          
          localStorage.setItem('auth_token', 'temp_token_' + Date.now());
          localStorage.setItem('user', JSON.stringify(tempUser));
          localStorage.setItem('current_user', JSON.stringify(tempUser));
          
          setUser(tempUser);
          setLoading(false);
          
          console.log('✅ Временный пользователь создан, переходим в игру');
          return;
          
          // Закомментировано до исправления Supabase
          // const redirectPath = window.Telegram?.WebApp ? '/auth/login' : '/auth/register';
          // console.log('🔄 Перенаправляем на:', redirectPath);
          
          setTimeout(() => {
            router.push(redirectPath);
          }, 500);
          return;
        }

        try {
          const parsedUser = JSON.parse(userDataSource);
          console.log('✅ Пользователь найден:', parsedUser.username);
          console.log('💰 Монеты пользователя:', parsedUser.coins);
          
          // Загружаем свежие данные из базы данных
          loadUserFromDatabase(parsedUser.id || parsedUser.telegramId, token);
          
        } catch (error) {
          console.error('❌ Ошибка парсинга данных пользователя:', error);
          console.error('❌ Проблемные данные:', userDataSource);
          
          // Очищаем поврежденные данные
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('current_user');
          
          const redirectPath = window.Telegram?.WebApp ? '/auth/login' : '/auth/register';
          setTimeout(() => {
            router.push(redirectPath);
          }, 500);
          return;
        }
      }, 200);
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
