import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    // Generate room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Mock room creation response
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

    console.log('✅ Room created:', room);

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
