"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, VStack, HStack, Text, Alert, Flex } from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaTelegram, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';

// VK icon component
const VKIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.033-.148-1.49-.148-1.49.15-.108.3-.27.3-.511 0-.213-.064-.511-.945-.511-.75 0-.976.336-1.394.336-.475 0-.671-.3-.671-.671 0-.398.418-.671 1.008-.671.814 0 1.245.273 2.229.273.814 0 1.245-.336 1.245-.868 0-.418-.254-.786-.683-1.033l1.394-1.394c.088-.088.212-.148.348-.148.273 0 .498.225.498.498 0 .136-.06.26-.148.348l-1.394 1.394c.247.16.407.254.686.516.418.418.814.996.814 1.677 0 1.245-.976 2.229-2.229 2.229-.418 0-.796-.15-1.095-.387-.3.236-.677.387-1.095.387-.475 0-.9-.15-1.245-.398v.398c0 .273-.225.498-.498.498s-.498-.225-.498-.498V9.563c0-.814.66-1.474 1.474-1.474h3.444c.814 0 1.474.66 1.474 1.474v6.796c0 .273-.225.498-.498.498z"/>
  </svg>
);

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const showToast = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info') => {
    // Простое alert для демо - заменить на toast в production
    alert(`${title}: ${description}`);
  };

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'local',
          username: credentials.username,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showToast('Успешно!', `Добро пожаловать, ${data.user.username}!`, 'success');

        // Проверяем реферальный код
        const pendingReferral = localStorage.getItem('pending_referral_code');
        if (pendingReferral) {
          await handlePendingReferral(pendingReferral, data.token);
        }

        router.push('/');
      } else {
        setError(data.message || 'Ошибка входа');
      }
    } catch (error) {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handlePendingReferral = async (code: string, token: string) => {
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'use_referral',
          referralCode: code
        })
      });

      const result = await response.json();
      if (result.success) {
        localStorage.removeItem('pending_referral_code');
        toast({
          title: '🎉 Бонус получен!',
          description: result.message,
          status: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error processing pending referral:', error);
    }
  };

  const handleTelegramLogin = async () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const initData = tg.initData;
      const user = tg.initDataUnsafe?.user;

      if (!initData || !user) {
      showToast('Ошибка', 'Откройте приложение через Telegram', 'error');
        return;
      }

      setLoading(true);

      try {
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
            initData
          })
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          showToast('Успешно!', `Добро пожаловать, ${data.user.username}!`, 'success');

          router.push('/');
        } else {
          setError(data.message || 'Ошибка входа через Telegram');
        }
      } catch (error) {
        setError('Ошибка сети. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Недоступно', 'Вход через Telegram доступен только в WebApp', 'warning');
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      showToast('Ошибка конфигурации', 'Google OAuth не настроен', 'error');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid profile email';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = googleAuthUrl;
  };

  const handleVKLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_VK_CLIENT_ID;
    if (!clientId) {
      showToast('Ошибка конфигурации', 'VK OAuth не настроен', 'error');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/vk/callback`;
    const scope = 'email';
    const vkAuthUrl = `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&v=5.131`;
    
    window.location.href = vkAuthUrl;
  };

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box maxW="400px" w="full" bg="white" borderRadius="xl" boxShadow="2xl" p={8}>
        <VStack gap={6}>
          {/* Header */}
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Добро пожаловать!
            </Text>
            <Text color="gray.600">
              Войдите в свой аккаунт P.I.D.R.
            </Text>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="md" p={3} bg="red.100" color="red.800">
              ❌ {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box w="full">
            <form onSubmit={handleLogin}>
              <VStack gap={4}>
                <Box>
                  <Text mb={2} fontWeight="medium">Логин</Text>
                  <Input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="Введите ваш логин"
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'blue.300' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">Пароль</Text>
                  <Box position="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      placeholder="Введите пароль"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'blue.300' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      pr="3rem"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      position="absolute"
                      right={2}
                      top="50%"
                      transform="translateY(-50%)"
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.500"
                      _hover={{ color: 'gray.700' }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </Box>
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Вход..."
                  mt={2}
                >
                  Войти
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Divider */}
          <Flex align="center" w="full">
            <Box flex="1" height="1px" bg="gray.300" />
            <Text px={3} color="gray.500" fontSize="sm">
              или
            </Text>
            <Box flex="1" height="1px" bg="gray.300" />
          </Flex>

          {/* Social Login */}
          <VStack gap={3} w="full">
            <Button
              onClick={handleTelegramLogin}
              leftIcon={<FaTelegram />}
              colorScheme="telegram"
              variant="outline"
              size="lg"
              w="full"
              isLoading={loading}
            >
              Войти через Telegram
            </Button>

            <HStack gap={3} w="full">
              <Button
                onClick={handleGoogleLogin}
                leftIcon={<FaGoogle />}
                colorScheme="red"
                variant="outline"
                size="md"
                flex={1}
              >
                Google
              </Button>
              <Button
                onClick={handleVKLogin}
                leftIcon={<VKIcon />}
                colorScheme="blue"
                variant="outline"
                size="md"
                flex={1}
              >
                VK
              </Button>
            </HStack>
          </VStack>

          {/* Register Link */}
          <Text textAlign="center" color="gray.600">
            Нет аккаунта?{' '}
            <Link href="/auth/register">
              <Text as="span" color="blue.500" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>
                Зарегистрироваться
              </Text>
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
