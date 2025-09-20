// API для управления пользовательскими сессиями
import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '../../../../lib/auth/session-manager';

function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  return new Promise(async (resolve) => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      resolve(null);
      return;
    }

    const token = authHeader.substring(7);
    const validation = await SessionManager.validateSession(token);
    
    resolve(validation.valid ? validation.userId || null : null);
  });
}

// GET /api/auth/sessions - Получить активные сессии пользователя
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  
  if (!userId) {
    return NextResponse.json({ 
      success: false, 
      message: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const sessions = await SessionManager.getUserActiveSessions(userId);
    
    // Форматируем для фронтенда
    const formattedSessions = sessions.map(session => ({
      id: session.sessionId,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: session.expiresAt,
      isCurrent: false // TODO: определить текущую сессию
    }));

    console.log(`📱 Найдено ${sessions.length} активных сессий для пользователя ${userId}`);

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      total: formattedSessions.length
    });

  } catch (error) {
    console.error('❌ Ошибка получения сессий:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка получения сессий' 
    }, { status: 500 });
  }
}

// DELETE /api/auth/sessions/:sessionId - Отозвать конкретную сессию
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  
  if (!userId) {
    return NextResponse.json({ 
      success: false, 
      message: 'Unauthorized' 
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('all') === 'true';

    if (revokeAll) {
      // Отзываем все сессии пользователя кроме текущей
      const sessions = await SessionManager.getUserActiveSessions(userId);
      let revokedCount = 0;

      for (const session of sessions) {
        const success = await SessionManager.revokeSession(
          session.sessionId, 
          'Отозвано пользователем (выход со всех устройств)'
        );
        if (success) revokedCount++;
      }

      console.log(`🚪 Отозвано ${revokedCount} сессий для пользователя ${userId}`);

      return NextResponse.json({
        success: true,
        message: `Отозвано ${revokedCount} сессий`,
        revokedCount
      });

    } else if (sessionId) {
      // Отзываем конкретную сессию
      const success = await SessionManager.revokeSession(
        sessionId, 
        'Отозвано пользователем'
      );

      if (success) {
        console.log(`🚪 Сессия ${sessionId} отозвана пользователем ${userId}`);
        
        return NextResponse.json({
          success: true,
          message: 'Сессия отозвана'
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: 'Ошибка отзыва сессии' 
        }, { status: 500 });
      }

    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Не указан ID сессии' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Ошибка отзыва сессии:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка отзыва сессии' 
    }, { status: 500 });
  }
}

// POST /api/auth/sessions/cleanup - Очистить истекшие сессии (admin)
export async function POST(req: NextRequest) {
  try {
    // TODO: Добавить проверку админских прав
    
    const cleanedCount = await SessionManager.cleanupExpiredSessions();
    
    return NextResponse.json({
      success: true,
      message: `Очищено ${cleanedCount} истекших сессий`,
      cleanedCount
    });

  } catch (error) {
    console.error('❌ Ошибка очистки сессий:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка очистки сессий' 
    }, { status: 500 });
  }
}
