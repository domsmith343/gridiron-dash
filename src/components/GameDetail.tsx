import React, { useEffect, useState } from 'react';
import type { Game, GameStats } from '../types/game';
import { websocketService } from '../services/websocket';
import styles from './GameDetail.module.css';
import ConnectionStatus from './ConnectionStatus';

interface GameDetailProps {
  gameId: string;
  initialGame?: Game;
  onClose?: () => void;
}

export const GameDetail: React.FC<GameDetailProps> = ({ 
  gameId, 
  initialGame,
  onClose
}) => {
  const [game, setGame] = useState<Game | null>(initialGame || null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialGame);
  const [error, setError] = useState<string | null>(null);
  const [playByPlay, setPlayByPlay] = useState<any[]>([]);
  
  useEffect(() => {
    // Subscribe to game updates
    const unsubscribeGameUpdates = websocketService.subscribeToGameUpdates((games) => {
      const updatedGame = games.find(g => g.id === gameId);
      if (updatedGame) {
        setGame(updatedGame);
      }
    });
    
    // Subscribe to score updates
    const unsubscribeScoreUpdates = websocketService.subscribeToScoreUpdates(
      (updatedGameId, homeScore, awayScore) => {
        if (updatedGameId === gameId) {
          setGame(prevGame => {
            if (!prevGame) return null;
            return {
              ...prevGame,
              homeScore,
              awayScore
            };
          });
        }
      }
    );
    
    // Subscribe to status updates
    const unsubscribeStatusUpdates = websocketService.subscribeToStatusUpdates(
      (updatedGameId, status, time) => {
        if (updatedGameId === gameId) {
          setGame(prevGame => {
            if (!prevGame) return null;
            return {
              ...prevGame,
              status: status as any,
              gameStatus: status as any,
              time,
              quarter: status.startsWith('Q') ? status : prevGame.quarter,
              timeRemaining: time || prevGame.timeRemaining
            };
          });
        }
      }
    );
    
    // Subscribe to stat updates
    const unsubscribeStatUpdates = websocketService.subscribeToStatUpdates((statUpdate) => {
      if (statUpdate.gameId === gameId) {
        setStats({
          homeTeam: {
            totalYards: 
              statUpdate.homeTeam.stats.passing.yards + 
              statUpdate.homeTeam.stats.rushing.yards,
            passingYards: statUpdate.homeTeam.stats.passing.yards,
            rushingYards: statUpdate.homeTeam.stats.rushing.yards,
            turnovers: 
              statUpdate.homeTeam.stats.passing.interceptions + 
              (statUpdate.homeTeam.stats.fumbles?.lost || 0),
            timeOfPossession: statUpdate.homeTeam.stats.timeOfPossession || '00:00'
          },
          awayTeam: {
            totalYards: 
              statUpdate.awayTeam.stats.passing.yards + 
              statUpdate.awayTeam.stats.rushing.yards,
            passingYards: statUpdate.awayTeam.stats.passing.yards,
            rushingYards: statUpdate.awayTeam.stats.rushing.yards,
            turnovers: 
              statUpdate.awayTeam.stats.passing.interceptions + 
              (statUpdate.awayTeam.stats.fumbles?.lost || 0),
            timeOfPossession: statUpdate.awayTeam.stats.timeOfPossession || '00:00'
          }
        });
      }
    });
    
    // Subscribe to news updates for play-by-play
    const unsubscribeNewsUpdates = websocketService.subscribeToNewsUpdates((newsItem) => {
      if (newsItem.gameId === gameId) {
        setPlayByPlay(prev => [newsItem, ...prev].slice(0, 10));
      }
    });
    
    // Fetch game data if not provided
    if (!initialGame) {
      setLoading(true);
      
      // In a real app, this would be an API call
      // For now, we'll simulate with a timeout
      setTimeout(() => {
        const mockGames: Game[] = []; // This would be fetched from an API
        const foundGame = mockGames.find(g => g.id === gameId);
        
        if (foundGame) {
          setGame(foundGame);
        } else {
          setError('Game not found');
        }
        
        setLoading(false);
      }, 1000);
    }
    
    // Cleanup subscriptions
    return () => {
      unsubscribeGameUpdates();
      unsubscribeScoreUpdates();
      unsubscribeStatusUpdates();
      unsubscribeStatUpdates();
      unsubscribeNewsUpdates();
    };
  }, [gameId, initialGame]);
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading game details...</p>
      </div>
    );
  }
  
  if (error || !game) {
    return (
      <div className={styles.errorContainer}>
        <p>{error || 'Game not found'}</p>
        <button 
          className={styles.closeButton}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }
  
  const isLive = game.status === 'LIVE' || game.gameStatus === 'LIVE';
  const isFinal = game.status === 'FINAL' || game.gameStatus === 'FINAL';
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {game.homeTeam.name} vs {game.awayTeam.name}
        </h2>
        {onClose && (
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close game details"
          >
            &times;
          </button>
        )}
      </div>
      
      <div className={styles.statusBar}>
        <div className={styles.gameStatus}>
          <span className={isLive ? styles.liveIndicator : ''}>
            {game.status || game.gameStatus}
          </span>
          <span className={styles.gameTime}>
            {game.quarter} {game.timeRemaining || game.time}
          </span>
        </div>
        {isLive && (
          <ConnectionStatus showLabel={false} className={styles.connectionStatus} />
        )}
      </div>
      
      <div className={styles.scoreboardContainer}>
        <div className={styles.scoreboard}>
          <div className={styles.team}>
            <div className={styles.teamLogo}>
              {game.homeTeam.logoUrl && (
                <img 
                  src={game.homeTeam.logoUrl} 
                  alt={`${game.homeTeam.name} logo`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${game.homeTeam.abbreviation}&background=333&color=fff`;
                  }}
                />
              )}
            </div>
            <div className={styles.teamInfo}>
              <span className={styles.teamName}>{game.homeTeam.name}</span>
              <span className={styles.teamRecord}>(10-6)</span>
            </div>
            <div 
              className={styles.teamScore + ' ' + styles.homeTeamColor}
              style={{'--home-team-color': game.homeTeam.primaryColor} as React.CSSProperties}
            >
              {game.homeScore}
            </div>
          </div>
          
          <div className={styles.scoreboardDivider}>
            {isLive && game.possession && (
              <div 
                className={`${styles.possessionIndicator} ${game.possession === game.homeTeam.id ? styles.possessionIndicatorHome : styles.possessionIndicatorAway}`}
                style={{
                  '--home-team-color': game.homeTeam.primaryColor,
                  '--away-team-color': game.awayTeam.primaryColor
                } as React.CSSProperties}
              >
                {game.redZone && <span className={styles.redZone}>RZ</span>}
              </div>
            )}
          </div>
          
          <div className={styles.team}>
            <div className={styles.teamLogo}>
              {game.awayTeam.logoUrl && (
                <img 
                  src={game.awayTeam.logoUrl} 
                  alt={`${game.awayTeam.name} logo`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${game.awayTeam.abbreviation}&background=333&color=fff`;
                  }}
                />
              )}
            </div>
            <div className={styles.teamInfo}>
              <span className={styles.teamName}>{game.awayTeam.name}</span>
              <span className={styles.teamRecord}>(8-8)</span>
            </div>
            <div 
              className={styles.teamScore + ' ' + styles.awayTeamColor}
              style={{'--away-team-color': game.awayTeam.primaryColor} as React.CSSProperties}
            >
              {game.awayScore}
            </div>
          </div>
        </div>
      </div>
      
      {stats && (
        <div className={styles.statsContainer}>
          <h3 className={styles.sectionTitle}>Team Stats</h3>
          <div className={styles.statsTable}>
            <div className={styles.statsHeader}>
              <div className={styles.statsTeam}>{game.homeTeam.abbreviation}</div>
              <div className={styles.statName}>STAT</div>
              <div className={styles.statsTeam}>{game.awayTeam.abbreviation}</div>
            </div>
            
            <div className={styles.statsRow}>
              <div className={styles.statsValue}>{stats.homeTeam.totalYards}</div>
              <div className={styles.statName}>TOTAL YARDS</div>
              <div className={styles.statsValue}>{stats.awayTeam.totalYards}</div>
            </div>
            
            <div className={styles.statsRow}>
              <div className={styles.statsValue}>{stats.homeTeam.passingYards}</div>
              <div className={styles.statName}>PASSING</div>
              <div className={styles.statsValue}>{stats.awayTeam.passingYards}</div>
            </div>
            
            <div className={styles.statsRow}>
              <div className={styles.statsValue}>{stats.homeTeam.rushingYards}</div>
              <div className={styles.statName}>RUSHING</div>
              <div className={styles.statsValue}>{stats.awayTeam.rushingYards}</div>
            </div>
            
            <div className={styles.statsRow}>
              <div className={styles.statsValue}>{stats.homeTeam.turnovers}</div>
              <div className={styles.statName}>TURNOVERS</div>
              <div className={styles.statsValue}>{stats.awayTeam.turnovers}</div>
            </div>
            
            <div className={styles.statsRow}>
              <div className={styles.statsValue}>{stats.homeTeam.timeOfPossession}</div>
              <div className={styles.statName}>POSSESSION</div>
              <div className={styles.statsValue}>{stats.awayTeam.timeOfPossession}</div>
            </div>
          </div>
        </div>
      )}
      
      {isLive && playByPlay.length > 0 && (
        <div className={styles.playByPlayContainer}>
          <h3 className={styles.sectionTitle}>Play by Play</h3>
          <ul className={styles.playByPlayList}>
            {playByPlay.map((play, index) => (
              <li key={play.id || index} className={styles.playByPlayItem}>
                <div className={styles.playTimestamp}>
                  {new Date(play.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={styles.playContent}>
                  <div className={styles.playHeadline}>{play.headline}</div>
                  <div className={styles.playSummary}>{play.summary}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className={styles.gameInfo}>
        {game.venue || game.stadium ? (
          <div className={styles.venueInfo}>
            <strong>Venue:</strong> {game.venue || game.stadium}
          </div>
        ) : null}
        
        {game.channel && (
          <div className={styles.broadcastInfo}>
            <strong>Broadcast:</strong> {game.channel}
          </div>
        )}
        
        {game.weather && (
          <div className={styles.weatherInfo}>
            <strong>Weather:</strong> {game.weather.temperature}°F, {game.weather.condition}, Wind: {game.weather.windSpeed} mph
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;
