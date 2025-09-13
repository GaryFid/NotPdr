import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, userId, userName, password } = body;

    if (!roomCode) {
      return NextResponse.json({
        success: false,
        error: 'Код комнаты обязателен'
      }, { status: 400 });
    }

    // Mock room join logic
    const room = {
      roomId: Math.random().toString(36).substring(2, 10),
      roomCode: roomCode.toUpperCase(),
      name: `Комната ${roomCode}`,
      host: 'Хост комнаты',
      maxPlayers: 6,
      currentPlayers: 3,
      gameMode: 'casual',
      hasPassword: false,
      isPrivate: false,
      status: 'waiting'
    };

    console.log('✅ Joined room:', room);

    return NextResponse.json({
      success: true,
      message: 'Успешно присоединились к комнате',
      room: room
    });

  } catch (error) {
    console.error('❌ Error joining room:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка присоединения к комнате'
    }, { status: 500 });
  }
}
