import React from 'react';

interface GameCardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'FINAL' | 'UPCOMING';
  time?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  time
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${
          status === 'LIVE' ? 'text-red-500' :
          status === 'FINAL' ? 'text-gray-500' :
          'text-blue-500'
        }`}>
          {status}
        </span>
        {time && <span className="text-sm text-gray-500">{time}</span>}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 dark:text-white">{homeTeam}</span>
          <span className="font-bold text-gray-900 dark:text-white">{homeScore}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 dark:text-white">{awayTeam}</span>
          <span className="font-bold text-gray-900 dark:text-white">{awayScore}</span>
        </div>
      </div>
    </div>
  );
}; 