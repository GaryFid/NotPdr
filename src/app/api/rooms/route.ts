import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getRateLimitId } from '../../../lib/ratelimit';

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

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/rooms - Получить список комнат
export async function GET(req: NextRequest) {
  // Allow anonymous access for room listing
  try {
    // Mock rooms for demo (replace with real database query)
    const mockRooms = [
      {
        id: '1',
        code: 'GAME01',
        name: 'Комната Новичков',
        host: 'Алекс',
        players: 3,
        maxPlayers: 6,
        gameMode: 'casual',
        hasPassword: false,
        isPrivate: false,
        status: 'waiting',
        ping: Math.floor(Math.random() * 100) + 20,
        difficulty: 'easy',
        createdAt: new Date().toISOString()
      },
      {
        id: '2', 
        code: 'PRO777',
        name: 'Турнир Мастеров',
        host: 'Мария',
        players: 6,
        maxPlayers: 8,
        gameMode: 'pro',
        hasPassword: true,
        isPrivate: false,
        status: 'playing',
        ping: Math.floor(Math.random() * 100) + 20,
        difficulty: 'hard',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        code: 'BLITZ5',
        name: 'Быстрая игра',
        host: 'Дмитрий',
        players: Math.floor(Math.random() * 3) + 6,
        maxPlayers: 9,
        gameMode: 'blitz',
        hasPassword: false,
        isPrivate: false,
        status: 'waiting',
        ping: Math.floor(Math.random() * 100) + 20,
        difficulty: 'hard',
        createdAt: new Date().toISOString()
      }
    ];

    // Simulate some rooms being full or in different states
    mockRooms.forEach(room => {
      if (room.players >= room.maxPlayers) {
        room.status = 'full';
      } else if (Math.random() > 0.7) {
        room.status = 'playing';
      }
    });

    return NextResponse.json({ 
      success: true, 
      rooms: mockRooms.filter(room => !room.isPrivate) // Only return public rooms
    });
  } catch (error) {
    console.error('Rooms GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Original authenticated function (renamed to avoid conflicts)
async function getAuthenticatedRooms(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'public'; // public, my, joinable

    if (type === 'my') {
      // Получаем комнаты пользователя (где он хост или участник)
      const { data: rooms, error } = await supabase
        .from('game_rooms')
        .select(`
          id, room_code, name, max_players, current_players, status, is_private, created_at,
          users!game_rooms_host_id_fkey (username, avatar),
          room_players (
            user_id, position, is_ready,
            users (username, avatar)
          )
        `)
        .or(`host_id.eq.${userId},id.in.(${await getUserRoomIds(userId)})`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ success: true, rooms: rooms || [] });
    }

    if (type === 'joinable') {
      // Получаем комнаты к которым можно присоединиться
      const { data: rooms, error } = await supabase
        .from('game_rooms')
        .select(`
          id, room_code, name, max_players, current_players, status, is_private, created_at,
          users!game_rooms_host_id_fkey (username, avatar)
        `)
        .eq('status', 'waiting')
        .eq('is_private', false)
        .lt('current_players', 9) // Максимум 9 игроков
        .neq('host_id', userId) // Не показываем свои комнаты
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return NextResponse.json({ success: true, rooms: rooms || [] });
    }

    // Получаем публичные комнаты (type === 'public')
    const { data: rooms, error } = await supabase
      .from('game_rooms')
      .select(`
        id, room_code, name, max_players, current_players, status, created_at,
        users!game_rooms_host_id_fkey (username, avatar)
      `)
      .eq('is_private', false)
      .in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ success: true, rooms: rooms || [] });

  } catch (error) {
    console.error('Rooms GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/rooms - Создать комнату или присоединиться к комнате
export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const id = getRateLimitId(req);
  const { success } = await checkRateLimit(`rooms:${id}`);
  if (!success) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  try {
    const { action, roomCode, roomName, maxPlayers, isPrivate, password } = await req.json();

    if (action === 'create') {
      // Создание новой комнаты
      let uniqueCode = '';
      let attempts = 0;
      
      // Генерируем уникальный код комнаты
      do {
        uniqueCode = generateRoomCode();
        attempts++;
        if (attempts > 10) throw new Error('Failed to generate unique room code');
        
        const { data: existing } = await supabase
          .from('game_rooms')
          .select('id')
          .eq('room_code', uniqueCode)
          .single();
          
        if (!existing) break;
      } while (true);

      // Проверяем, нет ли у пользователя активной комнаты
      const { data: existingRoom } = await supabase
        .from('game_rooms')
        .select('id')
        .eq('host_id', userId)
        .in('status', ['waiting', 'playing'])
        .single();

      if (existingRoom) {
        return NextResponse.json({ 
          success: false, 
          message: 'У вас уже есть активная комната. Завершите или покиньте её сначала.' 
        }, { status: 400 });
      }

      // Создаем комнату
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: uniqueCode,
          name: roomName || 'P.I.D.R. Игра',
          host_id: userId,
          max_players: Math.min(Math.max(maxPlayers || 4, 2), 9),
          current_players: 1,
          is_private: isPrivate || false,
          password: password || null,
          game_settings: {
            cardDeck: 'standard52',
            timeLimit: 30,
            allowSpectators: true
          }
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Добавляем хоста как первого игрока
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          user_id: userId,
          position: 0,
          is_ready: true
        });

      if (playerError) throw playerError;

      // Обновляем статус пользователя
      await updateUserStatus(userId, 'in_game', room.id);

      return NextResponse.json({ 
        success: true, 
        room: {
          id: room.id,
          roomCode: room.room_code,
          name: room.name,
          status: room.status
        }
      });
    }

    if (action === 'join') {
      // Присоединение к комнате
      if (!roomCode) {
        return NextResponse.json({ success: false, message: 'Room code required' }, { status: 400 });
      }

      // Находим комнату
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('id, name, max_players, current_players, status, is_private, password, host_id')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) {
        return NextResponse.json({ success: false, message: 'Комната не найдена' }, { status: 404 });
      }

      if (room.status !== 'waiting') {
        return NextResponse.json({ success: false, message: 'Комната недоступна для присоединения' }, { status: 400 });
      }

      if (room.current_players >= room.max_players) {
        return NextResponse.json({ success: false, message: 'Комната заполнена' }, { status: 400 });
      }

      if (room.host_id === userId) {
        return NextResponse.json({ success: false, message: 'Вы уже хост этой комнаты' }, { status: 400 });
      }

      // Проверяем пароль для приватных комнат
      if (room.is_private && room.password && room.password !== password) {
        return NextResponse.json({ success: false, message: 'Неверный пароль' }, { status: 403 });
      }

      // Проверяем, не в комнате ли уже пользователь
      const { data: existingPlayer } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .single();

      if (existingPlayer) {
        return NextResponse.json({ success: false, message: 'Вы уже в этой комнате' }, { status: 400 });
      }

      // Находим свободную позицию
      const { data: occupiedPositions } = await supabase
        .from('room_players')
        .select('position')
        .eq('room_id', room.id);

      const occupied = occupiedPositions?.map((p: any) => p.position) || [];
      let freePosition = 0;
      for (let i = 0; i < room.max_players; i++) {
        if (!occupied.includes(i)) {
          freePosition = i;
          break;
        }
      }

      // Добавляем игрока в комнату
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          user_id: userId,
          position: freePosition,
          is_ready: false
        });

      if (playerError) throw playerError;

      // Обновляем количество игроков в комнате
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', room.id);

      if (updateError) throw updateError;

      // Обновляем статус пользователя
      await updateUserStatus(userId, 'in_game', room.id);

      return NextResponse.json({ 
        success: true, 
        room: {
          id: room.id,
          roomCode,
          name: room.name,
          position: freePosition
        }
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('Rooms POST error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/rooms - Покинуть комнату или удалить комнату
export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const action = searchParams.get('action') || 'leave'; // leave, delete

    if (!roomId) {
      return NextResponse.json({ success: false, message: 'Room ID required' }, { status: 400 });
    }

    // Получаем информацию о комнате
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('id, host_id, current_players, status')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    if (action === 'delete' && room.host_id === userId) {
      // Удаление комнаты (только хост)
      
      // Сначала удаляем всех игроков
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', roomId);

      // Затем удаляем комнату
      const { error: deleteError } = await supabase
        .from('game_rooms')
        .delete()
        .eq('id', roomId);

      if (deleteError) throw deleteError;

      // Обновляем статус всех игроков
      await updateUserStatus(userId, 'online', null);

      return NextResponse.json({ success: true, message: 'Комната удалена' });
    }

    // Покинуть комнату
    const { error: leaveError } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (leaveError) throw leaveError;

    // Обновляем количество игроков
    const { error: updateError } = await supabase
      .from('game_rooms')
      .update({ current_players: room.current_players - 1 })
      .eq('id', roomId);

    if (updateError) throw updateError;

    // Если хост покинул комнату, передаем права другому игроку
    if (room.host_id === userId) {
      const { data: newHost } = await supabase
        .from('room_players')
        .select('user_id')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true })
        .limit(1)
        .single();

      if (newHost) {
        await supabase
          .from('game_rooms')
          .update({ host_id: newHost.user_id })
          .eq('id', roomId);
      } else {
        // Если никого не осталось, удаляем комнату
        await supabase
          .from('game_rooms')
          .delete()
          .eq('id', roomId);
      }
    }

    // Обновляем статус пользователя
    await updateUserStatus(userId, 'online', null);

    return NextResponse.json({ success: true, message: 'Вы покинули комнату' });

  } catch (error) {
    console.error('Rooms DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// Вспомогательные функции
async function getUserRoomIds(userId: string): Promise<string> {
  const { data } = await supabase
    .from('room_players')
    .select('room_id')
    .eq('user_id', userId);
  
  return data?.map((p: any) => p.room_id).join(',') || '';
}

async function updateUserStatus(userId: string, status: string, roomId: string | null) {
  await supabase
    .from('user_status')
    .upsert({
      user_id: userId,
      status,
      current_room_id: roomId,
      last_seen: new Date().toISOString()
    });
}
