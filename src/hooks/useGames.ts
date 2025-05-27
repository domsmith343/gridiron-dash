import { useState, useEffect } from 'react';
import type { Game } from '../types/game';
import { mockGames } from '../services/mockData';
import { websocketService } from '../services/websocket';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>(mockGames);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Subscribe to game updates
    const unsubscribe = websocketService.subscribe((updatedGames) => {
      setGames(updatedGames);
      setIsLoading(false);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  return { games, isLoading, error };
}; 