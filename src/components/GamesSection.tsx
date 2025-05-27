import React from 'react';
import { useGames } from '../hooks/useGames';
import { GameCard } from './GameCard';

const GamesSection: React.FC = () => {
  const { games, isLoading, error } = useGames();

  if (error) {
    return <div className="text-red-500">Error loading games: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading games...</div>;
  }

  return (
    <>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </>
  );
};

export default GamesSection; 