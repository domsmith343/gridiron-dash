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

    // Subscribe to errors
    const unsubscribeErrors = websocketService.subscribeToErrors(err => {
      setError(new Error(err));
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      unsubscribeErrors();
      websocketService.disconnect();
    };
  }, []);

  return { games, isLoading, error };
}; 