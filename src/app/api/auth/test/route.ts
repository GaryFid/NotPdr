import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('🧪 Test auth API called');
  
  try {
    const body = await req.json();
    console.log('📝 Test request body:', JSON.stringify(body, null, 2));
    
    // Простой тест без Supabase
    if (body.type === 'telegram') {
      const { id, username, first_name, last_name } = body;
      
      // Создаем тестового пользователя
      const testUser = {
        id: `test-${id}`,
        username: username || first_name || 'TestUser',
        firstName: first_name,
        lastName: last_name,
        telegramId: id.toString(),
        coins: 1000,
        rating: 1000,
        gamesPlayed: 0,
        gamesWon: 0,
        referralCode: 'TEST' + Date.now().toString().slice(-4)
      };
      
      // Простой токен для теста
      const testToken = btoa(JSON.stringify({
        userId: testUser.id,
        telegramId: testUser.telegramId,
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 дней
      }));
      
      console.log('✅ Test user created:', testUser);
      
      return NextResponse.json({
        success: true,
        token: testToken,
        user: testUser,
        message: 'Test authentication successful'
      });
    }
    
    if (body.type === 'local') {
      const { username, password } = body;
      
      // Простая проверка для теста
      if (username && password.length >= 6) {
        const testUser = {
          id: `test-local-${Date.now()}`,
          username,
          firstName: username,
          coins: 1000,
          rating: 1000,
          gamesPlayed: 0,
          gamesWon: 0,
          referralCode: 'LOCAL' + Date.now().toString().slice(-4)
        };
        
        const testToken = btoa(JSON.stringify({
          userId: testUser.id,
          username: testUser.username,
          exp: Date.now() + 30 * 24 * 60 * 60 * 1000
        }));
        
        return NextResponse.json({
          success: true,
          token: testToken,
          user: testUser,
          message: 'Test local auth successful'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Invalid credentials'
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'Unknown auth type'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Test auth error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test auth error: ' + error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Test auth API is working',
    timestamp: new Date().toISOString()
  });
}
