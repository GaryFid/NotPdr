import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Проверяем состояние базы данных...');

    const results: any = {
      timestamp: new Date().toISOString(),
      tables: {},
      connection: false
    };

    // Проверяем подключение к Supabase
    try {
      const { data, error } = await supabase.from('_pidr_users').select('count', { count: 'exact', head: true });
      if (!error) {
        results.connection = true;
        results.tables._pidr_users = {
          exists: true,
          count: data || 0
        };
      } else {
        results.tables._pidr_users = {
          exists: false,
          error: error.message
        };
      }
    } catch (error) {
      results.connection = false;
      results.connectionError = (error as Error).message;
    }

    // Проверяем другие таблицы
    const tablesToCheck = [
      '_pidr_user_status',
      '_pidr_rooms', 
      '_pidr_room_players',
      '_pidr_hd_wallets',
      '_pidr_coin_transactions'
    ];

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (!error) {
          results.tables[table] = {
            exists: true,
            count: data || 0
          };
        } else {
          results.tables[table] = {
            exists: false,
            error: error.message
          };
        }
      } catch (error) {
        results.tables[table] = {
          exists: false,
          error: (error as Error).message
        };
      }
    }

    // Проверяем последних пользователей
    if (results.tables._pidr_users?.exists) {
      try {
        const { data: users, error } = await supabase
          .from('_pidr_users')
          .select('id, username, telegramId, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && users) {
          results.recentUsers = users;
        }
      } catch (error) {
        results.recentUsersError = (error as Error).message;
      }
    }

    console.log('📊 Результаты проверки БД:', results);

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('❌ Ошибка проверки БД:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST для принудительного создания пользователя
export async function POST(req: NextRequest) {
  try {
    const { telegramId, username, firstName } = await req.json();

    if (!telegramId) {
      return NextResponse.json({
        success: false,
        message: 'telegramId обязателен'
      }, { status: 400 });
    }

    console.log(`🚀 Принудительное создание пользователя: ${telegramId}`);

    // Проверяем, существует ли пользователь
    const { data: existingUsers } = await supabase
      .from('_pidr_users')
      .select('*')
      .eq('telegramId', telegramId.toString());

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Пользователь уже существует',
        user: existingUsers[0]
      });
    }

    // Создаем нового пользователя
    const newUserData = {
      telegramId: telegramId.toString(),
      username: username || `user${telegramId}`,
      firstName: firstName || '',
      lastName: '',
      avatar: null,
      authType: 'telegram',
      coins: 1000,
      rating: 1000,
      gamesPlayed: 0,
      gamesWon: 0,
      referralCode: 'DEBUG' + Date.now().toString().slice(-4),
      created_at: new Date().toISOString()
    };

    const { data: newUser, error: createError } = await supabase
      .from('_pidr_users')
      .insert([newUserData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Ошибка создания пользователя:', createError);
      return NextResponse.json({
        success: false,
        message: 'Ошибка создания пользователя',
        error: createError.message
      }, { status: 500 });
    }

    // Создаем статус пользователя
    await supabase
      .from('_pidr_user_status')
      .insert({
        user_id: newUser.id,
        status: 'online',
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    // Создаем HD адреса
    const { HDWalletService } = await import('../../../../lib/wallets/hd-wallet-service');
    const walletService = new HDWalletService();
    
    const supportedCoins = ['TON', 'BTC', 'ETH', 'USDT_TRC20', 'SOL'];
    
    for (const coin of supportedCoins) {
      try {
        const hdAddress = await walletService.generateUserAddress(newUser.id, coin);
        if (hdAddress) {
          await supabase
            .from('_pidr_hd_addresses')
            .insert({
              user_id: newUser.id,
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

    console.log('✅ Пользователь создан успешно:', newUser.id);

    return NextResponse.json({
      success: true,
      message: 'Пользователь создан успешно',
      user: newUser
    });

  } catch (error) {
    console.error('❌ Ошибка создания пользователя:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
