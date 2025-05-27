import React from 'react';
import type { Game } from '../types/game';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'text-red-500';
      case 'FINAL':
        return 'text-gray-500';
      case 'UPCOMING':
        return 'text-blue-500';
      case 'POSTPONED':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
      style={{
        borderTop: `4px solid ${homeTeam.primaryColor}`,
        borderBottom: `4px solid ${awayTeam.primaryColor}`
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
        {time && <span className="text-sm text-gray-500">{quarter} {time}</span>}
      </div>
      
      <div className="space-y-4">
        {/* Home Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {homeTeam.logo && (
              <img 
                src={homeTeam.logo} 
                alt={`${homeTeam.name} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${homeTeam.abbreviation}&background=${homeTeam.primaryColor?.replace('#', '')}&color=fff`;
                }}
              />
            )}
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{homeTeam.name}</span>
              <span className="text-xs text-gray-500 block">({homeTeam.city})</span>
            </div>
          </div>
          <span 
            className="font-bold text-2xl"
            style={{ color: homeTeam.primaryColor }}
          >
            {homeScore}
          </span>
        </div>
        
        {/* Away Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {awayTeam.logo && (
              <img 
                src={awayTeam.logo} 
                alt={`${awayTeam.name} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${awayTeam.abbreviation}&background=${awayTeam.primaryColor?.replace('#', '')}&color=fff`;
                }}
              />
            )}
            <div>
              <span className="font-medium text-gray-900 dark:text-white">{awayTeam.name}</span>
              <span className="text-xs text-gray-500 block">({awayTeam.city})</span>
            </div>
          </div>
          <span 
            className="font-bold text-2xl"
            style={{ color: awayTeam.primaryColor }}
          >
            {awayScore}
          </span>
        </div>
      </div>

      {venue && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">{venue}</p>
          {weather && (
            <p className="text-sm text-gray-500">
              {weather.temperature}°F, {weather.condition}, Wind: {weather.windSpeed} mph
            </p>
          )}
        </div>
      )}
    </div>
  );
}; 