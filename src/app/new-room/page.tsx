'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NewMultiplayerFlow from '../../components/NewMultiplayerFlow';

export default function NewRoomPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  const handleStartGame = (gameData: any) => {
    console.log('Game data:', gameData);
    
    // Here you would integrate with the actual game system
    // For now, redirect to game page with the settings
    const searchParams = new URLSearchParams({
      mode: 'multiplayer',
      players: gameData.players.length.toString(),
      table: gameData.selectedTable.id,
      roomCode: gameData.roomCode
    });
    
    router.push(`/game?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <NewMultiplayerFlow
        onBack={handleBack}
        onStartGame={handleStartGame}
      />
    </div>
  );
}
