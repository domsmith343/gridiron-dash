import React, { useEffect, useState } from 'react';
import type { Game } from '../types/game';
import styles from './UpcomingGamesSection.module.css';

interface UpcomingGamesSectionProps {
  limit?: number;
}

export const UpcomingGamesSection: React.FC<UpcomingGamesSectionProps> = ({ limit = 6 }) => {
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
            gameTime: '2025-06-01T20:20:00Z',
            homeScore: 0,
            awayScore: 0,
            quarter: '',
            timeRemaining: '',
            possession: null,
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
            gameTime: '2025-06-01T16:25:00Z',
            homeScore: 0,
            awayScore: 0,
            quarter: '',
            timeRemaining: '',
            possession: null,
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
            gameTime: '2025-06-01T13:00:00Z',
            homeScore: 0,
            awayScore: 0,
            quarter: '',
            timeRemaining: '',
            possession: null,
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

  return (
    <div className={styles.upcomingGamesContainer}>
      {upcomingGames.length === 0 ? (
        <p className={styles.noGamesMessage}>No upcoming games scheduled</p>
      ) : (
        upcomingGames.map(game => (
          <div 
            key={game.id} 
            className={styles.upcomingGameCard}
            aria-label={`Upcoming game: ${game.homeTeam.name} vs ${game.awayTeam.name}`}
          >
            <div className={styles.gameTime}>
              {formatGameTime(game.gameTime)}
            </div>
            <div className={styles.matchup}>
              <div className={styles.team}>
                <div className={styles.teamLogo}>
                  <img 
                    src={game.homeTeam.logoUrl} 
                    alt={`${game.homeTeam.name} logo`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=NFL';
                    }}
                  />
                </div>
                <span className={styles.teamName}>{game.homeTeam.abbreviation}</span>
              </div>
              <span className={styles.versus}>vs</span>
              <div className={styles.team}>
                <div className={styles.teamLogo}>
                  <img 
                    src={game.awayTeam.logoUrl} 
                    alt={`${game.awayTeam.name} logo`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=NFL';
                    }}
                  />
                </div>
                <span className={styles.teamName}>{game.awayTeam.abbreviation}</span>
              </div>
            </div>
            <div className={styles.gameInfo}>
              <span className={styles.stadium}>{game.stadium}</span>
              <span className={styles.channel}>{game.channel}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UpcomingGamesSection;
