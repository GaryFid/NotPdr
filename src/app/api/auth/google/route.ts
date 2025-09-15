import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getRateLimitId } from '../../../../lib/ratelimit';

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const id = getRateLimitId(req);
  const { success } = await checkRateLimit(`google_auth:${id}`);
  if (!success) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  if (!JWT_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ success: false, message: 'Google OAuth not configured' }, { status: 500 });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Authorization code required' }, { status: 400 });
    }

    // Обмениваем код авторизации на access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri || `${req.nextUrl.origin}/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token exchange error:', errorData);
      return NextResponse.json({ success: false, message: 'Failed to exchange authorization code' }, { status: 400 });
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Получаем информацию о пользователе
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ success: false, message: 'Failed to fetch user info' }, { status: 400 });
    }

    const userData: GoogleUserInfo = await userResponse.json();

    if (!userData.verified_email) {
      return NextResponse.json({ success: false, message: 'Email not verified with Google' }, { status: 400 });
    }

    // Ищем пользователя в базе данных по email или Google ID
    const { data: existingUsers, error: searchError } = await supabase
      .from('users')
      .select('id, username, email, firstName, lastName, avatar, authType')
      .or(`email.eq.${userData.email},googleId.eq.${userData.id}`);

    if (searchError) {
      console.error('Database search error:', searchError);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    let user = existingUsers && existingUsers[0];

    if (!user) {
      // Создаем нового пользователя
      const username = userData.given_name || userData.name.split(' ')[0] || 'GoogleUser';
      
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
            googleId: userData.id,
            username,
            email: userData.email,
            firstName: userData.given_name,
            lastName: userData.family_name,
            avatar: userData.picture,
            authType: 'google',
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
          firstName: userData.given_name,
          lastName: userData.family_name,
          avatar: userData.picture,
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
        email: user.email,
        authType: 'google'
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
    console.error('Google auth error:', error);
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
