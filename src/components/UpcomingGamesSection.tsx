import React, { useEffect, useState } from 'react';
import type { Game } from '../types/game';
import styles from './UpcomingGamesSection.module.css';
import FavoritesWrapper from './FavoritesWrapper';
import FavoriteButton from './FavoriteButton';
import { useFavorites } from '../context/FavoritesContext';
import SearchFilter, { FilterOptions } from './SearchFilter';

interface UpcomingGamesSectionProps {
  limit?: number;
}

// Inner component that uses the favorites context
const UpcomingGamesContent: React.FC<UpcomingGamesSectionProps> = ({ limit = 6 }) => {
  const { isFavorite } = useFavorites();
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ searchQuery: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // Apply filters whenever games or filter options change
  useEffect(() => {
    if (!upcomingGames.length) {
      setFilteredGames([]);
      return;
    }
    
    let result = [...upcomingGames];
    
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
    
    // Limit the number of games shown
    result = result.slice(0, limit);
    
    setFilteredGames(result);
  }, [upcomingGames, filters, limit]);
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll use mock data
    const fetchUpcomingGames = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data for upcoming games
        const mockUpcomingGames: Game[] = [
          {
            id: 'game-101',
            homeTeam: {
              id: 'KC',
              name: 'Kansas City Chiefs',
              abbreviation: 'KC',
              logoUrl: 'https://static.www.nfl.com/image/private/f_auto/league/ujshjqvmnxce8m4obmvs',
              primaryColor: '#E31837',
              secondaryColor: '#FFB81C'
            },
            awayTeam: {
              id: 'BAL',
              name: 'Baltimore Ravens',
              abbreviation: 'BAL',
              logoUrl: 'https://static.www.nfl.com/image/private/f_auto/league/ucsdijmddsqcj1i9tddd',
              primaryColor: '#241773',
              secondaryColor: '#000000'
            },
            gameStatus: 'SCHEDULED',
            status: 'SCHEDULED',
            gameTime: '2025-06-01T20:20:00Z',
            homeScore: 0,
            awayScore: 0,
            quarter: '',
            timeRemaining: '',
            possession: undefined,
            redZone: false,
            stadium: 'Arrowhead Stadium',
            channel: 'NBC'
          },
          {
            id: 'game-102',
            homeTeam: {
              id: 'SF',
              name: 'San Francisco 49ers',
              abbreviation: 'SF',
              logoUrl: 'https://static.www.nfl.com/image/private/f_auto/league/dxibuyxbk0b9ua5ih9hn',
              primaryColor: '#AA0000',
              secondaryColor: '#B3995D'
            },
            awayTeam: {
              id: 'DAL',
              name: 'Dallas Cowboys',
              abbreviation: 'DAL',
              logoUrl: 'https://static.www.nfl.com/image/private/f_auto/league/ieid8hoygzdlmzo0tnf6',
              primaryColor: '#003594',
              secondaryColor: '#041E42'
            },
            gameStatus: 'SCHEDULED',
            status: 'SCHEDULED',
            gameTime: '2025-06-01T16:25:00Z',
            homeScore: 0,
            awayScore: 0,
            quarter: '',
            timeRemaining: '',
            possession: undefined,
            redZone: false,
            stadium: 'Levi\'s Stadium',
            channel: 'FOX'
          },
          {
            id: 'game-103',
            homeTeam: {
              id: 'BUF',
              name: 'Buffalo Bills',
              abbreviation: 'BUF',
              logoUrl: 'https://static.www.nfl.com/image/private/f_auto/league/giphcy6ie9mxbnldntsf',
              primaryColor: '#00338D',
              secondaryColor: '#C60C30'
            },
            awayTeam: {
              id: 'MIA',
              name: 'Miami Dolphins',
              abbreviation: 'MIA',
              logoUrl: 'https://static.www.nfl.com/image/private/f_auto/league/lits6p8ycthy9to70bnt',
              primaryColor: '#008E97',
              secondaryColor: '#FC4C02'
            },
            gameStatus: 'SCHEDULED',
            status: 'SCHEDULED',
            gameTime: '2025-06-01T13:00:00Z',
            homeScore: 0,
            awayScore: 0,
            quarter: '',
            timeRemaining: '',
            possession: undefined,
            redZone: false,
            stadium: 'Highmark Stadium',
            channel: 'CBS'
          }
        ];
        
        setUpcomingGames(mockUpcomingGames.slice(0, limit));
        setLoading(false);
      } catch (err) {
        setError('Failed to load upcoming games');
        setLoading(false);
        console.error('Error fetching upcoming games:', err);
      }
    };

    fetchUpcomingGames();
  }, [limit]);

  // Format date to display day and time
  const formatGameTime = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      hour: 'numeric', 
      minute: '2-digit',
      timeZoneName: 'short'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading upcoming games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Show message when no games match filters
  const noGamesMessage = () => {
    if (!upcomingGames.length) {
      return <p className={styles.noGamesMessage}>No upcoming games found.</p>;
    }
    
    if (!filteredGames.length && upcomingGames.length > 0) {
      return (
        <div className="text-center py-8">
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
      
      <div className={styles.upcomingGamesContainer}>
        {noGamesMessage()}
        {filteredGames.length > 0 && filteredGames.map((game) => {
          // Check if either team is a favorite
          const isHomeTeamFavorite = isFavorite(game.homeTeam.id);
          const isAwayTeamFavorite = isFavorite(game.awayTeam.id);
          const hasFavoriteTeam = isHomeTeamFavorite || isAwayTeamFavorite;
          
          return (
          <div key={game.id} className={`${styles.upcomingGameCard} ${hasFavoriteTeam ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''}`}>
            <div className={styles.gameTime}>{formatGameTime(game.gameTime || game.startTime || '')}</div>
            <div className={styles.matchup}>
              <div className={`${styles.teamLogo} relative`}>
                <img src={game.homeTeam.logoUrl} alt={`${game.homeTeam.name} logo`} loading="lazy" />
                <div className="absolute -top-1 -right-1">
                  <FavoriteButton teamId={game.homeTeam.id} />
                </div>
              </div>
              <span className={styles.teamName}>{game.homeTeam.name}</span>
              <span className={styles.versus}>vs</span>
              <span className={styles.teamName}>{game.awayTeam.name}</span>
              <div className={`${styles.teamLogo} relative`}>
                <img src={game.awayTeam.logoUrl} alt={`${game.awayTeam.name} logo`} loading="lazy" />
                <div className="absolute -top-1 -right-1">
                  <FavoriteButton teamId={game.awayTeam.id} />
                </div>
              </div>
            </div>
            <div className={styles.gameInfo}>
              <span className={styles.stadium}>{game.venue || game.stadium}</span>
              <span className={styles.channel}>{game.channel}</span>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

// Wrapper component that provides the favorites context
export const UpcomingGamesSection: React.FC<UpcomingGamesSectionProps> = (props) => {
  return (
    <FavoritesWrapper>
      <UpcomingGamesContent {...props} />
    </FavoritesWrapper>
  );
};

export default UpcomingGamesSection;
