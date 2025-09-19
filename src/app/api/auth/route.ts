import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyTelegramInitData } from '../../../lib/telegram';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;
const BOT_TOKEN = process.env.BOT_TOKEN;

const LocalAuthSchema = z.object({
  type: z.literal('local'),
  username: z.string().min(1).max(64),
  password: z.string().min(6).max(128),
});

const TelegramAuthSchema = z.object({
  type: z.literal('telegram'),
  id: z.union([z.string(), z.number()]),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  photo_url: z.string().optional(),
  initData: z.string().optional(),
});

export async function GET(req: NextRequest) {
  console.log('🔍 GET Auth API - получение данных пользователя');
  
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ 
      success: false, 
      message: 'userId обязателен' 
    }, { status: 400 });
  }

  // Проверяем Authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      success: false, 
      message: 'Токен авторизации отсутствует' 
    }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Проверяем JWT токен
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET не настроен');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ JWT токен валиден для пользователя:', decoded.userId);

    // Проверяем Supabase подключение
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const useSupabase = !!(supabaseUrl && supabaseKey);
    
    if (useSupabase) {
      // Загружаем из Supabase
      const { data: user, error } = await supabase
        .from('_pidr_users')
        .select('id, username, email, telegramId, firstName, lastName, photoUrl, coins, rating, gamesPlayed, gamesWon, createdAt')
        .or(`id.eq.${userId},telegramId.eq.${userId}`)
        .single();

      if (error) {
        console.error('❌ Ошибка загрузки пользователя из Supabase:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Пользователь не найден в базе данных' 
        }, { status: 404 });
      }

      console.log('✅ Пользователь загружен из Supabase:', user);
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          telegramId: user.telegramId,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          coins: user.coins || 1000,
          rating: user.rating || 0,
          gamesPlayed: user.gamesPlayed || 0,
          gamesWon: user.gamesWon || 0,
          createdAt: user.createdAt
        }
      });
    } else {
      console.warn('⚠️ Supabase не настроен, возвращаем базовые данные');
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          username: `user_${userId}`,
          coins: 1000,
          rating: 0,
          gamesPlayed: 0,
          gamesWon: 0
        }
      });
    }

  } catch (error) {
    console.error('❌ Ошибка проверки токена или загрузки пользователя:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Неверный токен авторизации' 
    }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  console.log('🔄 UPDATE Auth API - обновление статистики игрока');
  
  try {
    const body = await req.json();
    
    if (body.type !== 'telegram' || !body.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Требуется Telegram тип и ID для обновления' 
      }, { status: 400 });
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const useSupabase = !!(supabaseUrl && supabaseKey);
    
    if (useSupabase) {
      // Обновляем в Supabase
      const { data: updatedUser, error } = await supabase
        .from('_pidr_users')
        .update({
          coins: body.coins,
          rating: body.rating,
          games_played: body.games_played,
          games_won: body.games_won,
          photo_url: body.photo_url,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', body.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Ошибка обновления в Supabase:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Не удалось обновить статистику в базе данных' 
        }, { status: 500 });
      }
      
      console.log('✅ Статистика игрока обновлена в Supabase:', updatedUser);
      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Статистика игрока успешно обновлена'
      });
    } else {
      console.log('⚠️ База данных недоступна, статистика не сохранена');
      return NextResponse.json({
        success: true,
        message: 'Статистика обновлена локально (база недоступна)'
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка UPDATE API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера при обновлении' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('🚀 SUPABASE Auth API вызван');
  
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET не найден');
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка конфигурации сервера: JWT_SECRET отсутствует' 
    }, { status: 500 });
  }

  // Проверяем Supabase подключение
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  const useSupabase = !!(supabaseUrl && supabaseKey);
  
  if (!useSupabase) {
    console.warn('⚠️ Supabase переменные не настроены, используем временное хранилище');
  }

  let body: any;
  try {
    body = await req.json();
    console.log('📝 Данные запроса:', JSON.stringify(body, null, 2));
  } catch (error) {
    console.error('❌ Ошибка парсинга JSON:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Неверный формат JSON' 
    }, { status: 400 });
  }

  if (!body || typeof body.type !== 'string') {
    console.error('❌ Неверное тело запроса:', body);
    return NextResponse.json({ 
      success: false, 
      message: 'Неверный формат запроса' 
    }, { status: 400 });
  }

  // 1. Локальная авторизация
  if (body.type === 'local') {
    console.log('👤 Локальная авторизация');
    
    const parsed = LocalAuthSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Ошибка валидации локальных данных:', parsed.error);
      return NextResponse.json({ 
        success: false, 
        message: 'Неверные данные для входа' 
      }, { status: 400 });
    }

    const { username, password } = parsed.data;

    // FALLBACK: Если Supabase не настроен
    if (!useSupabase) {
      console.log('🔄 Используем временное хранилище (без Supabase)');
      
      // Создаем временного пользователя для входа
      const tempUser = {
        id: `temp_${Date.now()}`,
        username,
        firstName: username,
        lastName: '',
        avatar: null,
        coins: 1000,
        rating: 1000,
        gamesPlayed: 0,
        gamesWon: 0,
        referralCode: 'TEMP' + Date.now().toString().slice(-4)
      };

      // Генерация JWT токена
      const token = jwt.sign(
        { 
          userId: tempUser.id, 
          username: tempUser.username,
          type: 'local_temp'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('✅ Временная авторизация:', tempUser.username);

      return NextResponse.json({
        success: true,
        token,
        user: tempUser,
        message: 'Успешный вход! (Временный режим)',
        warning: 'База данных не подключена. Данные не сохранятся.'
      });
    }

    try {
      console.log('🔍 Поиск пользователя в Supabase:', username);

      const { data: users, error } = await supabase
        .from('_pidr_users')
        .select('id, username, firstName, lastName, avatar, passwordHash, coins, rating, gamesPlayed, gamesWon, referralCode')
        .eq('username', username)
        .limit(1);

      if (error) {
        console.error('❌ Ошибка Supabase при поиске пользователя:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка подключения к базе данных',
          details: error.message 
        }, { status: 500 });
      }

      const user = users && users[0];
      if (!user) {
        console.log('❌ Пользователь не найден:', username);
        return NextResponse.json({ 
          success: false, 
          message: 'Пользователь не найден' 
        }, { status: 404 });
      }

      console.log('✅ Пользователь найден:', user.username);

      // Проверка пароля (если есть хэш)
      if (user.passwordHash) {
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          console.log('❌ Неверный пароль для:', username);
          return NextResponse.json({ 
            success: false, 
            message: 'Неверный пароль' 
          }, { status: 401 });
        }
      }

      // Обновление статуса пользователя
      try {
        await supabase
          .from('_pidr_user_status')
          .upsert({
            user_id: user.id,
            status: 'online',
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (statusError) {
        console.warn('⚠️ Не удалось обновить статус пользователя:', statusError);
      }

      // Генерация JWT токена
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          type: 'local'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('✅ Успешная авторизация:', user.username);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          coins: user.coins || 1000,
          rating: user.rating || 1000,
          gamesPlayed: user.gamesPlayed || 0,
          gamesWon: user.gamesWon || 0,
          referralCode: user.referralCode
        },
        message: 'Успешный вход!'
      });

    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Ошибка сервера при авторизации' 
      }, { status: 500 });
    }
  }

  // 2. Авторизация через Telegram WebApp
  if (body.type === 'telegram') {
    console.log('📱 Telegram авторизация');
    
    const parsed = TelegramAuthSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Ошибка валидации Telegram данных:', parsed.error);
      return NextResponse.json({ 
        success: false, 
        message: 'Неверные Telegram данные' 
      }, { status: 400 });
    }

    const { id, username, first_name, last_name, photo_url, initData } = parsed.data;
    console.log('👤 Данные пользователя Telegram:', { id, username, first_name, last_name });

    // FALLBACK: Если Supabase не настроен
    if (!useSupabase) {
      console.log('🔄 Используем временное хранилище для Telegram (без Supabase)');
      
      const tempUser = {
        id: `temp_tg_${id}`,
        telegramId: id.toString(),
        username: username || first_name || `tg_user_${id}`,
        firstName: first_name || '',
        lastName: last_name || '',
        avatar: photo_url,
        coins: 1000,
        rating: 1000,
        gamesPlayed: 0,
        gamesWon: 0,
        referralCode: 'TG' + Date.now().toString().slice(-4)
      };

      // Генерация JWT токена
      const token = jwt.sign(
        { 
          userId: tempUser.id, 
          telegramId: tempUser.telegramId,
          username: tempUser.username,
          type: 'telegram_temp'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('✅ Временная Telegram авторизация:', tempUser.username);

      return NextResponse.json({
        success: true,
        token,
        user: tempUser,
        message: 'Успешный Telegram вход! (Временный режим)',
        warning: 'База данных не подключена. Данные не сохранятся.'
      });
    }

    // Проверка Telegram данных (если есть BOT_TOKEN)
    if (BOT_TOKEN && initData && initData !== 'demo_init_data') {
      try {
        if (!verifyTelegramInitData(initData, BOT_TOKEN)) {
          console.error('❌ Неверные Telegram init данные');
          return NextResponse.json({ 
            success: false, 
            message: 'Неверные Telegram данные' 
          }, { status: 401 });
        }
      } catch (error) {
        console.error('❌ Ошибка проверки Telegram данных:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка проверки Telegram данных' 
        }, { status: 401 });
      }
    } else {
      console.warn('⚠️ BOT_TOKEN не настроен или демо режим, пропускаем проверку');
    }

    const idStr = id.toString();

    try {
      console.log('🔍 Поиск Telegram пользователя в Supabase:', idStr);

      const { data: users, error } = await supabase
        .from('_pidr_users')
        .select('id, username, firstName, lastName, avatar, telegramId, referralCode, coins, rating, gamesPlayed, gamesWon')
        .eq('telegramId', idStr)
        .limit(1);

      if (error) {
        console.error('❌ Ошибка Supabase при поиске Telegram пользователя:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка подключения к базе данных',
          details: error.message 
        }, { status: 500 });
      }

      let user = users && users[0];
      
      if (!user) {
        // Создание нового пользователя
        console.log('🆕 Создание нового Telegram пользователя для ID:', idStr);
        console.log('📋 Данные для создания:', { username, first_name, last_name, photo_url });

        // Генерация уникального referralCode
        let referralCode = null;
        let attempts = 0;
        while (attempts < 5) {
          referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const { data: existingCode } = await supabase
            .from('_pidr_users')
            .select('id')
            .eq('referralCode', referralCode)
            .limit(1);
          
          if (!existingCode || existingCode.length === 0) break;
          attempts++;
        }

        const newUserData = {
          telegramId: idStr,
          username: username || first_name || `user${idStr}`,
          firstName: first_name || '',
          lastName: last_name || '',
          avatar: photo_url,
          authType: 'telegram',
          coins: 1000,
          rating: 1000,
          gamesPlayed: 0,
          gamesWon: 0,
          referralCode: referralCode || 'TG' + Date.now().toString().slice(-4)
        };

        const { data: newUser, error: createError } = await supabase
          .from('_pidr_users')
          .insert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error('❌ Ошибка создания Telegram пользователя:', createError);
          console.error('📋 Данные которые пытались вставить:', newUserData);
          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка создания пользователя',
            details: createError.message 
          }, { status: 500 });
        }

        user = newUser;
        console.log('✅ Создан новый Telegram пользователь:', user.username);
        console.log('🆔 ID нового пользователя:', user.id);
        console.log('📊 Полные данные пользователя:', user);

        // Создание статуса пользователя
        try {
          await supabase
            .from('_pidr_user_status')
            .insert({
              user_id: user.id,
              status: 'online',
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (statusError) {
          console.warn('⚠️ Не удалось создать статус пользователя:', statusError);
        }

        // 🔥 АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ HD КОШЕЛЬКА для нового пользователя
        console.log('💳 Генерируем HD кошелек для нового пользователя...');
        try {
          const { HDWalletService } = await import('../../../lib/wallets/hd-wallet-service');
          const walletService = new HDWalletService();
          
          const supportedCoins = ['TON', 'BTC', 'ETH', 'USDT_TRC20', 'SOL'];
          
          for (const coin of supportedCoins) {
            try {
              const hdAddress = await walletService.generateUserAddress(user.id, coin);
              if (hdAddress) {
                console.log(`✅ Создан ${coin} адрес для пользователя ${user.username}`);
                
                // Сохраняем адрес в базу данных
                await supabase
                  .from('_pidr_hd_addresses')
                  .insert({
                    user_id: user.id,
                    coin: hdAddress.coin,
                    address: hdAddress.address,
                    derivation_path: hdAddress.derivationPath,
                    address_index: hdAddress.index,
                    created_at: new Date().toISOString()
                  });
              }
            } catch (coinError) {
              console.warn(`⚠️ Не удалось создать ${coin} адрес:`, coinError);
            }
          }
        } catch (walletError) {
          console.warn('⚠️ Не удалось создать HD кошелек:', walletError);
        }
      } else {
        console.log('✅ Найден существующий Telegram пользователь:', user.username);
        
        // Обновление данных пользователя
        const updateData: any = {};
        if (first_name && first_name !== user.firstName) updateData.firstName = first_name;
        if (last_name && last_name !== user.lastName) updateData.lastName = last_name;
        if (photo_url && photo_url !== user.avatar) updateData.avatar = photo_url;

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('_pidr_users')
            .update(updateData)
            .eq('id', user.id);
          
          Object.assign(user, updateData);
        }

        // Обновление статуса
        try {
          await supabase
            .from('_pidr_user_status')
            .upsert({
              user_id: user.id,
              status: 'online',
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (statusError) {
          console.warn('⚠️ Не удалось обновить статус пользователя:', statusError);
        }

        // 🔥 ПРОВЕРКА И ГЕНЕРАЦИЯ HD КОШЕЛЬКА для существующего пользователя
        console.log('💳 Проверяем HD кошелек для существующего пользователя...');
        try {
          const { data: existingAddresses } = await supabase
            .from('_pidr_hd_addresses')
            .select('coin')
            .eq('user_id', user.id);

          const supportedCoins = ['TON', 'BTC', 'ETH', 'USDT_TRC20', 'SOL'];
          const existingCoins = existingAddresses?.map((addr: any) => addr.coin) || [];
          const missingCoins = supportedCoins.filter(coin => !existingCoins.includes(coin));

          if (missingCoins.length > 0) {
            console.log(`💳 Генерируем недостающие адреса для ${user.username}: ${missingCoins.join(', ')}`);
            
            const { HDWalletService } = await import('../../../lib/wallets/hd-wallet-service');
            const walletService = new HDWalletService();
            
            for (const coin of missingCoins) {
              try {
                const hdAddress = await walletService.generateUserAddress(user.id, coin);
                if (hdAddress) {
                  console.log(`✅ Создан недостающий ${coin} адрес для пользователя ${user.username}`);
                  
                  await supabase
                    .from('_pidr_hd_addresses')
                    .insert({
                      user_id: user.id,
                      coin: hdAddress.coin,
                      address: hdAddress.address,
                      derivation_path: hdAddress.derivationPath,
                      address_index: hdAddress.index,
                      created_at: new Date().toISOString()
                    });
                }
              } catch (coinError) {
                console.warn(`⚠️ Не удалось создать ${coin} адрес:`, coinError);
              }
            }
          } else {
            console.log('✅ HD кошелек уже существует для всех поддерживаемых монет');
          }
        } catch (walletError) {
          console.warn('⚠️ Ошибка проверки HD кошелька:', walletError);
        }
      }

      // Генерация JWT токена
      const token = jwt.sign(
        { 
          userId: user.id, 
          telegramId: user.telegramId,
          username: user.username,
          type: 'telegram'
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('✅ Успешная Telegram авторизация:', user.username);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          coins: user.coins,
          rating: user.rating,
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          referralCode: user.referralCode
        },
        message: 'Успешный Telegram вход!'
      });

    } catch (error) {
      console.error('❌ Ошибка Telegram авторизации:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Ошибка сервера при Telegram авторизации' 
      }, { status: 500 });
    }
  }

  return NextResponse.json({ 
    success: false, 
    message: 'Неизвестный тип авторизации' 
  }, { status: 400 });
}
