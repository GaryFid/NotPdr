import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';
import { ratelimit, getRateLimitId } from '../../../lib/ratelimit';

const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://your-app.com';

function getUserIdFromRequest(req: NextRequest): string | null {
  if (!JWT_SECRET) return null;
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.userId;
  } catch {
    return null;
  }
}

// GET /api/referral - Получить реферальную информацию пользователя
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Получаем реферальный код пользователя
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('referralCode, username')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Получаем статистику рефералов
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        id, created_at, reward_coins, is_rewarded,
        users!referrals_referred_id_fkey (username, firstName, avatar)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (referralsError) throw referralsError;

    // Подсчитываем статистику
    const totalReferrals = referrals?.length || 0;
    const totalRewards = referrals?.reduce((sum, ref) => sum + (ref.is_rewarded ? ref.reward_coins : 0), 0) || 0;
    const pendingRewards = referrals?.filter(ref => !ref.is_rewarded).length || 0;

    // Создаем реферальную ссылку
    const referralUrl = `${APP_URL}?ref=${user.referralCode}`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(
      `🎮 Присоединяйся к P.I.D.R. - самой захватывающей карточной игре!\n\n` +
      `🎁 Получи 100 монет за регистрацию по моей ссылке!\n` +
      `👥 Играй с друзьями в режиме реального времени!`
    )}`;

    const referralData = {
      referralCode: user.referralCode,
      referralUrl,
      telegramShareUrl,
      stats: {
        totalReferrals,
        totalRewards,
        pendingRewards
      },
      referrals: referrals?.map(ref => ({
        id: ref.id,
        username: ref.users?.username || ref.users?.firstName || 'Игрок',
        avatar: ref.users?.avatar || '🎮',
        date: ref.created_at,
        reward: ref.reward_coins,
        isRewarded: ref.is_rewarded
      })) || []
    };

    return NextResponse.json({ success: true, ...referralData });

  } catch (error) {
    console.error('Referral GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/referral - Обработать использование реферального кода
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const id = getRateLimitId(req);
  const { success } = await ratelimit.limit(`referral:${id}`);
  if (!success) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  try {
    const { referralCode } = await req.json();

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ success: false, message: 'Referral code required' }, { status: 400 });
    }

    // Проверяем, не использовал ли пользователь уже реферальный код
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .single();

    if (existingReferral) {
      return NextResponse.json({ success: false, message: 'Вы уже использовали реферальный код' }, { status: 400 });
    }

    // Находим владельца реферального кода
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, username, referralCode')
      .eq('referralCode', referralCode)
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json({ success: false, message: 'Недействительный реферальный код' }, { status: 404 });
    }

    if (referrer.id === userId) {
      return NextResponse.json({ success: false, message: 'Нельзя использовать собственный реферальный код' }, { status: 400 });
    }

    // Создаем запись о реферале
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: userId,
        referral_code: referralCode,
        reward_coins: 100,
        is_rewarded: false
      });

    if (insertError) throw insertError;

    // Выдаем награду новому пользователю (100 монет)
    const { error: userUpdateError } = await supabase.rpc('add_user_coins', {
      user_id: userId,
      amount: 100
    });

    if (userUpdateError) {
      console.error('Error adding coins to new user:', userUpdateError);
    }

    // Выдаем награду реферру (50 монет)
    const { error: referrerUpdateError } = await supabase.rpc('add_user_coins', {
      user_id: referrer.id,
      amount: 50
    });

    if (referrerUpdateError) {
      console.error('Error adding coins to referrer:', referrerUpdateError);
    } else {
      // Обновляем статус награды
      await supabase
        .from('referrals')
        .update({ is_rewarded: true })
        .eq('referrer_id', referrer.id)
        .eq('referred_id', userId);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Реферальный код применен! Вы получили 100 монет, а ${referrer.username} получил 50 монет за приглашение!` 
    });

  } catch (error) {
    console.error('Referral POST error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/referral - Обновить реферальный код (для админов или особых случаев)
export async function PUT(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newReferralCode } = await req.json();

    if (!newReferralCode || typeof newReferralCode !== 'string' || newReferralCode.length < 6 || newReferralCode.length > 10) {
      return NextResponse.json({ success: false, message: 'Invalid referral code format' }, { status: 400 });
    }

    // Проверяем уникальность нового кода
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('referralCode', newReferralCode)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, message: 'Реферальный код уже используется' }, { status: 400 });
    }

    // Обновляем реферальный код
    const { error } = await supabase
      .from('users')
      .update({ referralCode: newReferralCode })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, referralCode: newReferralCode });

  } catch (error) {
    console.error('Referral PUT error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
