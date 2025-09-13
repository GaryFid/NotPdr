import { NextRequest, NextResponse } from 'next/server';

// Для production используем внешний API
const BACKEND_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Пробуем подключиться к реальному серверу
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json(result);
      }
    } catch (serverError) {
      console.warn('Backend server not available, using local fallback');
    }

    // Fallback для разработки
    const { 
      hostUserId, 
      hostName, 
      maxPlayers, 
      gameMode, 
      roomName, 
      hasPassword, 
      password, 
      isPrivate 
    } = body;

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = {
      roomId: Math.random().toString(36).substring(2, 10),
      roomCode: roomCode,
      name: roomName || `Комната ${roomCode}`,
      host: hostName || 'Хост',
      maxPlayers: maxPlayers || 6,
      gameMode: gameMode || 'casual',
      hasPassword: hasPassword || false,
      isPrivate: isPrivate || false,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };

    console.log('✅ Room created (fallback):', room);

    return NextResponse.json({
      success: true,
      message: 'Комната создана успешно',
      room: room
    });

  } catch (error) {
    console.error('❌ Error creating room:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка создания комнаты'
    }, { status: 500 });
  }
}
