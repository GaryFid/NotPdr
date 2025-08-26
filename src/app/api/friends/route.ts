import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';
import { ratelimit, getRateLimitId } from '../../../lib/ratelimit';

const JWT_SECRET = process.env.JWT_SECRET;

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

// GET /api/friends - Получить список друзей
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all'; // all, online, requests, suggested

  try {
    if (type === 'online') {
      // Получаем онлайн друзей
      const { data: onlineFriends, error } = await supabase
        .from('friends')
        .select(`
          friend_id,
          users!friends_friend_id_fkey (
            id, username, firstName, lastName, avatar,
            user_status (status, current_room_id, last_seen)
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;

      const online = onlineFriends
        ?.filter(f => f.users?.user_status?.status === 'online' || f.users?.user_status?.status === 'in_game')
        .map(f => ({
          id: f.friend_id,
          name: f.users?.username || f.users?.firstName || 'Игрок',
          status: f.users?.user_status?.status === 'in_game' ? 'В игре' : 'В сети',
          avatar: f.users?.avatar || '🎮',
          currentRoom: f.users?.user_status?.current_room_id
        })) || [];

      return NextResponse.json({ success: true, friends: online });
    }

    if (type === 'requests') {
      // Получаем входящие запросы в друзья
      const { data: requests, error } = await supabase
        .from('friends')
        .select(`
          id, user_id, created_at,
          users!friends_user_id_fkey (username, firstName, lastName, avatar)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      const friendRequests = requests?.map(r => ({
        id: r.id,
        userId: r.user_id,
        name: r.users?.username || r.users?.firstName || 'Игрок',
        message: 'Хочет добавить вас в друзья',
        avatar: r.users?.avatar || '🎭',
        date: r.created_at
      })) || [];

      return NextResponse.json({ success: true, requests: friendRequests });
    }

    if (type === 'suggested') {
      // Получаем предложенных друзей (пока случайные пользователи)
      const { data: suggested, error } = await supabase
        .from('users')
        .select('id, username, firstName, lastName, avatar')
        .neq('id', userId)
        .limit(5);

      if (error) throw error;

      // Исключаем уже добавленных друзей
      const { data: existingFriends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId);

      const friendIds = existingFriends?.map(f => f.friend_id) || [];
      const suggestions = suggested
        ?.filter(u => !friendIds.includes(u.id))
        .map(u => ({
          id: u.id,
          name: u.username || u.firstName || 'Игрок',
          avatar: u.avatar || '🎯',
          mutualFriends: Math.floor(Math.random() * 5) // TODO: подсчет реальных общих друзей
        })) || [];

      return NextResponse.json({ success: true, suggested: suggestions });
    }

    // Получаем всех друзей (type === 'all')
    const { data: allFriends, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        users!friends_friend_id_fkey (
          id, username, firstName, lastName, avatar,
          user_status (status, last_seen)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) throw error;

    const friends = allFriends?.map(f => ({
      id: f.friend_id,
      name: f.users?.username || f.users?.firstName || 'Игрок',
      status: getStatusText(f.users?.user_status?.status, f.users?.user_status?.last_seen),
      avatar: f.users?.avatar || '🎮',
      lastSeen: f.users?.user_status?.last_seen,
      isOnline: f.users?.user_status?.status === 'online' || f.users?.user_status?.status === 'in_game'
    })) || [];

    return NextResponse.json({ success: true, friends });

  } catch (error) {
    console.error('Friends API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/friends - Добавить друга или ответить на запрос
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const id = getRateLimitId(req);
  const { success } = await ratelimit.limit(`friends:${id}`);
  if (!success) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  try {
    const { action, friendId, username } = await req.json();

    if (action === 'add') {
      let targetUserId = friendId;

      // Если передан username вместо ID
      if (username && !friendId) {
        const { data: user, error } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (error || !user) {
          return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 404 });
        }
        targetUserId = user.id;
      }

      if (!targetUserId || targetUserId === userId) {
        return NextResponse.json({ success: false, message: 'Некорректный ID пользователя' }, { status: 400 });
      }

      // Проверяем, нет ли уже запроса
      const { data: existing } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`)
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          return NextResponse.json({ success: false, message: 'Уже в друзьях' }, { status: 400 });
        }
        if (existing.status === 'pending') {
          return NextResponse.json({ success: false, message: 'Запрос уже отправлен' }, { status: 400 });
        }
      }

      // Добавляем запрос в друзья
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Запрос в друзья отправлен' });
    }

    if (action === 'accept') {
      // Принимаем запрос в друзья
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('user_id', friendId)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      // Добавляем обратную связь (взаимное добавление)
      await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'accepted'
        });

      return NextResponse.json({ success: true, message: 'Запрос принят' });
    }

    if (action === 'decline') {
      // Отклоняем запрос в друзья
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Запрос отклонен' });
    }

    return NextResponse.json({ success: false, message: 'Неизвестное действие' }, { status: 400 });

  } catch (error) {
    console.error('Friends POST error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/friends - Удалить из друзей
export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) {
      return NextResponse.json({ success: false, message: 'Friend ID required' }, { status: 400 });
    }

    // Удаляем оба направления дружбы
    await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    return NextResponse.json({ success: true, message: 'Удален из друзей' });

  } catch (error) {
    console.error('Friends DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

function getStatusText(status: string | null, lastSeen: string | null): string {
  if (!status || status === 'offline') {
    if (lastSeen) {
      const diff = Date.now() - new Date(lastSeen).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `Был(а) ${days} дн. назад`;
      }
      if (hours > 0) {
        return `Был(а) ${hours} ч. назад`;
      }
      return 'Был(а) недавно';
    }
    return 'Не в сети';
  }
  
  switch (status) {
    case 'online': return 'В сети';
    case 'in_game': return 'В игре';
    case 'away': return 'Отошел';
    default: return 'Не в сети';
  }
}
