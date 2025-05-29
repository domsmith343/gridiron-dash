import React, { useState, useEffect } from 'react';
import type { Game } from '../types/game';
import styles from './GameCard.module.css';
import { createTeamColorStyles } from '../utils/styleUtils';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);
  const [teamColorClass, setTeamColorClass] = useState('');
  
  useEffect(() => {
    // Create dynamic team color classes
    const colorClass = createTeamColorStyles(
      game.homeTeam.primaryColor,
      game.awayTeam.primaryColor
    );
    setTeamColorClass(colorClass);
  }, [game.homeTeam.primaryColor, game.awayTeam.primaryColor]);
  const {
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    status,
    time,
    quarter,
    venue,
    weather
  } = game;

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'LIVE':
        return styles.statusLive;
      case 'FINAL':
        return styles.statusFinal;
      case 'UPCOMING':
        return styles.statusUpcoming;
      case 'POSTPONED':
        return styles.statusPostponed;
      default:
        return styles.statusFinal;
    }
  };

  const handleGameClick = () => {
    // Navigate to the game detail page
    window.location.href = `/game/${game.id}`;
  };

  return (
    <div 
      className={`${styles.gameCard} ${teamColorClass} cursor-pointer hover:shadow-lg transition-shadow duration-300`}
      aria-label={`Game: ${homeTeam.name} vs ${awayTeam.name}`}
      role="article"
      onClick={handleGameClick}
      onKeyDown={(e) => e.key === 'Enter' && handleGameClick()}
      tabIndex={0}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${getStatusClass(status)}`} aria-label={`Game status: ${status}`}>
          {status}
        </span>
        {time && (
          <span className="text-sm text-gray-500" aria-label={`Game time: ${quarter} ${time}`}>
            {quarter} {time}
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Home Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {!homeImgError && (homeTeam.logoUrl || homeTeam.logo) ? (
              <img 
                src={homeTeam.logoUrl || homeTeam.logo as string} 
                alt={`${homeTeam.name} logo`}
                className={styles.teamLogo}
                onError={() => setHomeImgError(true)}
                loading="lazy"
              />
            ) : (
              <div 
                className={`${styles.teamAbbreviation} home-team-color`}
              >
                {homeTeam.abbreviation}
              </div>
            )}
            <div>
              <span className={styles.teamName}>{homeTeam.name}</span>
              <span className={styles.teamCity}>({homeTeam.city})</span>
            </div>
          </div>
          <span 
            className={`${styles.score} home-team-color`}
          >
            {homeScore}
          </span>
        </div>
        
        {/* Away Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {!awayImgError && (awayTeam.logoUrl || awayTeam.logo) ? (
              <img 
                src={awayTeam.logoUrl || awayTeam.logo as string} 
                alt={`${awayTeam.name} logo`}
                className={styles.teamLogo}
                onError={() => setAwayImgError(true)}
                loading="lazy"
              />
            ) : (
              <div 
                className={`${styles.teamAbbreviation} away-team-color`}
              >
                {awayTeam.abbreviation}
              </div>
            )}
            <div>
              <span className={styles.teamName}>{awayTeam.name}</span>
              <span className={styles.teamCity}>({awayTeam.city})</span>
            </div>
          </div>
          <span 
            className={`${styles.score} away-team-color`}
          >
            {awayScore}
          </span>
        </div>
      </div>

      {venue && (
        <div className={styles.venueInfo}>
          <p>
            <span className="sr-only">Venue: </span>
            {venue}
          </p>
          {weather && (
            <p>
              <span className="sr-only">Weather conditions: </span>
              <span className={styles.weatherInfo}>
                <span>{weather.temperature}°F</span>
                <span className={styles.weatherDivider}>•</span>
                <span>{weather.condition}</span>
                <span className={styles.weatherDivider}>•</span>
                <span>Wind: {weather.windSpeed} mph</span>
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}; 