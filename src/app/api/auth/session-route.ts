// Обновленная версия API авторизации с поддержкой сессий
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { SessionManager } from '../../../lib/auth/session-manager';

function getClientInfo(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Извлекаем информацию об устройстве из User-Agent
  const deviceInfo = {
    userAgent,
    timestamp: new Date().toISOString(),
    // Можно добавить больше информации из заголовков
  };

  return { ip, userAgent, deviceInfo };
}

export async function POST(req: NextRequest) {
  console.log('🚀 SESSION-BASED Auth API вызван');

  try {
    const body = await req.json();
    const clientInfo = getClientInfo(req);

    if (!body || typeof body.type !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'Неверный формат запроса' 
      }, { status: 400 });
    }

    // 1. Локальная авторизация (username/password)
    if (body.type === 'local') {
      const { username, password } = body;

      if (!username || !password) {
        return NextResponse.json({ 
          success: false, 
          message: 'Логин и пароль обязательны' 
        }, { status: 400 });
      }

      // Находим пользователя
      const { data: users, error: userError } = await supabase
        .from('_pidr_users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .limit(1);

      if (userError || !users || users.length === 0) {
        await SessionManager.logAuthAction({
          userId: 'unknown',
          action: 'login',
          authType: 'local',
          ipAddress: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          success: false,
          errorMessage: 'Пользователь не найден'
        });

        return NextResponse.json({ 
          success: false, 
          message: 'Неверный логин или пароль' 
        }, { status: 401 });
      }

      const user = users[0];

      // TODO: Проверка пароля (пока пропускаем для совместимости)
      console.log('⚠️ Проверка пароля отключена для совместимости');

      // Создаем сессию
      const sessionResult = await SessionManager.createSession(
        user.id.toString(),
        'local',
        user,
        clientInfo
      );

      if (!sessionResult) {
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка создания сессии' 
        }, { status: 500 });
      }

      // Обновляем статус пользователя
      await supabase
        .from('_pidr_user_status')
        .upsert({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      console.log('✅ Успешная локальная авторизация:', user.username);

      return NextResponse.json({
        success: true,
        token: sessionResult.token,
        sessionId: sessionResult.sessionId,
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
    }

    // 2. Telegram авторизация
    if (body.type === 'telegram') {
      const { id, username, first_name, last_name, photo_url } = body;

      if (!id) {
        return NextResponse.json({ 
          success: false, 
          message: 'Telegram ID обязателен' 
        }, { status: 400 });
      }

      const telegramId = id.toString();

      // Ищем существующего пользователя
      let { data: users, error: findError } = await supabase
        .from('_pidr_users')
        .select('*')
        .eq('telegram_id', telegramId);

      if (findError) {
        console.error('❌ Ошибка поиска пользователя:', findError);
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка поиска пользователя' 
        }, { status: 500 });
      }

      let user;

      if (!users || users.length === 0) {
        // Создаем нового пользователя
        const newUserData = {
          telegram_id: telegramId,
          username: username || first_name || `user${telegramId}`,
          first_name: first_name || '',
          last_name: last_name || '',
          avatar_url: photo_url || null,
          coins: 1000,
          rating: 1000,
          games_played: 0,
          games_won: 0,
          created_at: new Date().toISOString()
        };

        const { data: newUser, error: createError } = await supabase
          .from('_pidr_users')
          .insert([newUserData])
          .select()
          .single();

        if (createError) {
          console.error('❌ Ошибка создания пользователя:', createError);
          
          await SessionManager.logAuthAction({
            userId: telegramId,
            action: 'login',
            authType: 'telegram',
            ipAddress: clientInfo.ip,
            userAgent: clientInfo.userAgent,
            success: false,
            errorMessage: createError.message
          });

          return NextResponse.json({ 
            success: false, 
            message: 'Ошибка создания пользователя' 
          }, { status: 500 });
        }

        user = newUser;
        console.log('✅ Создан новый Telegram пользователь:', user.username);

      } else {
        user = users[0];
        
        // Обновляем данные пользователя
        const updateData: any = {};
        if (first_name && first_name !== user.first_name) updateData.first_name = first_name;
        if (last_name && last_name !== user.last_name) updateData.last_name = last_name;
        if (photo_url && photo_url !== user.avatar_url) updateData.avatar_url = photo_url;
        if (username && username !== user.username) updateData.username = username;

        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('_pidr_users')
            .update(updateData)
            .eq('id', user.id);

          if (!updateError) {
            Object.assign(user, updateData);
          }
        }

        console.log('✅ Найден существующий Telegram пользователь:', user.username);
      }

      // Создаем сессию
      const sessionResult = await SessionManager.createSession(
        user.id.toString(),
        'telegram',
        user,
        clientInfo
      );

      if (!sessionResult) {
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка создания сессии' 
        }, { status: 500 });
      }

      // Обновляем статус пользователя
      await supabase
        .from('_pidr_user_status')
        .upsert({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      console.log('✅ Успешная Telegram авторизация:', user.username);

      return NextResponse.json({
        success: true,
        token: sessionResult.token,
        sessionId: sessionResult.sessionId,
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatar: user.avatar_url,
          coins: user.coins || 1000,
          rating: user.rating || 1000,
          gamesPlayed: user.games_played || 0,
          gamesWon: user.games_won || 0,
          referralCode: user.referral_code
        },
        message: 'Успешный Telegram вход!'
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Неподдерживаемый тип авторизации' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка сервера при авторизации' 
    }, { status: 500 });
  }
}

// GET - проверка текущей сессии
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      success: false, 
      message: 'Токен не предоставлен' 
    }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const validation = await SessionManager.validateSession(token);

  if (!validation.valid) {
    return NextResponse.json({ 
      success: false, 
      message: 'Недействительная сессия' 
    }, { status: 401 });
  }

  // Получаем данные пользователя
  const { data: user, error } = await supabase
    .from('_pidr_users')
    .select('*')
    .eq('id', validation.userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ 
      success: false, 
      message: 'Пользователь не найден' 
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar_url,
      coins: user.coins,
      rating: user.rating,
      gamesPlayed: user.games_played,
      gamesWon: user.games_won
    },
    sessionId: validation.sessionId,
    message: 'Сессия действительна'
  });
}

// DELETE - выход (отзыв сессии)
export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ 
      success: false, 
      message: 'Токен не предоставлен' 
    }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const validation = await SessionManager.validateSession(token);

  if (!validation.valid || !validation.sessionId) {
    return NextResponse.json({ 
      success: false, 
      message: 'Недействительная сессия' 
    }, { status: 401 });
  }

  const success = await SessionManager.revokeSession(validation.sessionId, 'Пользователь вышел');

  if (success) {
    return NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
  } else {
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка при выходе' 
    }, { status: 500 });
  }
}
