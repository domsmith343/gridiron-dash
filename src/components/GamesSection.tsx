import React, { useState, useEffect } from 'react';
import { useGames } from '../hooks/useGames';
import { GameCard } from './GameCard';
import FavoritesWrapper from './FavoritesWrapper';
import SearchFilter, { FilterOptions } from './SearchFilter';
import type { Game } from '../types/game';

const GamesSection: React.FC = () => {
  const { games, isLoading, error } = useGames();
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ searchQuery: '' });
  
  // Apply filters whenever games or filter options change
  useEffect(() => {
    if (!games.length) {
      setFilteredGames([]);
      return;
    }
    
    let result = [...games];
    
    // Apply team filter
    if (filters.teamId) {
      result = result.filter(game => 
        game.homeTeam.id === filters.teamId || 
        game.awayTeam.id === filters.teamId
      );
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(game => 
        game.status === filters.status || 
        game.gameStatus === filters.status
      );
    }
    
    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(game => 
        game.homeTeam.name.toLowerCase().includes(query) ||
        game.awayTeam.name.toLowerCase().includes(query) ||
        game.homeTeam.city?.toLowerCase().includes(query) ||
        game.awayTeam.city?.toLowerCase().includes(query) ||
        game.venue?.toLowerCase().includes(query) ||
        game.stadium?.toLowerCase().includes(query)
      );
    }
    
    setFilteredGames(result);
  }, [games, filters]);
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (error) {
    return <div className="text-red-500">Error loading games: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading games...</div>;
  }
  
  // Show message when no games match filters
  const noGamesMessage = () => {
    if (!games.length) {
      return <div className="text-gray-500">No games available</div>;
    }
    
    if (!filteredGames.length && games.length > 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No games match your filters</p>
          <button 
            onClick={() => setFilters({ searchQuery: '' })}
            className="mt-2 text-primary-600 dark:text-primary-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      <SearchFilter onFilterChange={handleFilterChange} className="mb-6" />
      
      <FavoritesWrapper>
        {noGamesMessage()}
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </FavoritesWrapper>
    </div>
  );
};

export default GamesSection; 