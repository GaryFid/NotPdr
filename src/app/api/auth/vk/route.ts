import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getRateLimitId } from '../../../../lib/ratelimit';

const JWT_SECRET = process.env.JWT_SECRET;
const VK_CLIENT_ID = process.env.VK_CLIENT_ID;
const VK_CLIENT_SECRET = process.env.VK_CLIENT_SECRET;

interface VKTokenResponse {
  access_token: string;
  expires_in: number;
  user_id: number;
  email?: string;
}

interface VKUserInfo {
  id: number;
  first_name: string;
  last_name: string;
  screen_name?: string;
  photo_100?: string;
  photo_200?: string;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const id = getRateLimitId(req);
  const { success } = await checkRateLimit(`vk_auth:${id}`);
  if (!success) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  if (!JWT_SECRET || !VK_CLIENT_ID || !VK_CLIENT_SECRET) {
    return NextResponse.json({ success: false, message: 'VK OAuth not configured' }, { status: 500 });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Authorization code required' }, { status: 400 });
    }

    // Обмениваем код авторизации на access token
    const tokenResponse = await fetch('https://oauth.vk.com/access_token', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    const tokenUrl = new URL('https://oauth.vk.com/access_token');
    tokenUrl.searchParams.set('client_id', VK_CLIENT_ID);
    tokenUrl.searchParams.set('client_secret', VK_CLIENT_SECRET);
    tokenUrl.searchParams.set('redirect_uri', redirect_uri || `${req.nextUrl.origin}/auth/vk/callback`);
    tokenUrl.searchParams.set('code', code);

    const tokenResp = await fetch(tokenUrl.toString());

    if (!tokenResp.ok) {
      const errorData = await tokenResp.text();
      console.error('VK token exchange error:', errorData);
      return NextResponse.json({ success: false, message: 'Failed to exchange authorization code' }, { status: 400 });
    }

    const tokenData: VKTokenResponse = await tokenResp.json();

    // Получаем информацию о пользователе
    const userUrl = new URL('https://api.vk.com/method/users.get');
    userUrl.searchParams.set('access_token', tokenData.access_token);
    userUrl.searchParams.set('user_ids', tokenData.user_id.toString());
    userUrl.searchParams.set('fields', 'photo_100,photo_200,screen_name');
    userUrl.searchParams.set('v', '5.131');

    const userResponse = await fetch(userUrl.toString());

    if (!userResponse.ok) {
      return NextResponse.json({ success: false, message: 'Failed to fetch user info' }, { status: 400 });
    }

    const userResponseData = await userResponse.json();
    
    if (userResponseData.error) {
      console.error('VK API error:', userResponseData.error);
      return NextResponse.json({ success: false, message: 'VK API error' }, { status: 400 });
    }

    const userData: VKUserInfo = userResponseData.response[0];

    // Ищем пользователя в базе данных по VK ID
    const { data: existingUsers, error: searchError } = await supabase
      .from('users')
      .select('id, username, email, firstName, lastName, avatar, authType')
      .eq('vkId', userData.id.toString());

    if (searchError) {
      console.error('Database search error:', searchError);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    let user = existingUsers && existingUsers[0];

    if (!user) {
      // Создаем нового пользователя
      const username = userData.screen_name || 
                      `${userData.first_name}${userData.last_name}`.toLowerCase() || 
                      'VKUser';
      
      // Генерируем уникальный реферальный код
      let referralCode: string | null = null;
      let exists = true;
      while (exists) {
        referralCode = generateReferralCode();
        const { data: refUsers } = await supabase
          .from('users')
          .select('id')
          .eq('referralCode', referralCode)
          .limit(1);
        exists = !!(refUsers && refUsers[0]);
      }

      const { data: newUsers, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            vkId: userData.id.toString(),
            username,
            email: tokenData.email || null,
            firstName: userData.first_name,
            lastName: userData.last_name,
            avatar: userData.photo_200 || userData.photo_100 || null,
            authType: 'vk',
            registrationDate: new Date().toISOString(),
            rating: 1000,
            gamesPlayed: 0,
            gamesWon: 0,
            coins: 0,
            referralCode,
          }
        ])
        .select('id, username, email, firstName, lastName, avatar, referralCode, rating, coins');

      if (insertError) {
        console.error('Insert error:', insertError);
        if (insertError.code === '23505') { // unique violation
          return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: 'Failed to create user' }, { status: 500 });
      }

      user = newUsers && newUsers[0];
    } else {
      // Обновляем существующего пользователя
      const { error: updateError } = await supabase
        .from('users')
        .update({
          firstName: userData.first_name,
          lastName: userData.last_name,
          avatar: userData.photo_200 || userData.photo_100 || user.avatar,
          lastActive: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'Failed to process user' }, { status: 500 });
    }

    // Создаем или обновляем статус пользователя
    await supabase
      .from('user_status')
      .upsert({
        user_id: user.id,
        status: 'online',
        last_seen: new Date().toISOString()
      });

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        authType: 'vk'
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    return NextResponse.json({ 
      success: true, 
      token, 
      user,
      message: `Добро пожаловать, ${user.firstName || user.username}!`
    });

  } catch (error) {
    console.error('VK auth error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
