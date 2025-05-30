import React, { useState } from 'react';
import PlayerStatsRadarChart from './PlayerStatsRadarChart';

interface PlayerStat {
  game: string;
  opponent: string;
  date: string;
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  fieldGoals?: number;
  extraPoints?: number;
  fantasyPoints: number;
}

interface PlayerTrend {
  category: string;
  data: number[];
  color: string;
}

interface DetailedPlayerStatsProps {
  player: {
    id: string;
    name: string;
    position: string;
    team: string;
    teamId: string;
    avatarUrl?: string;
    stats: {
      passingYards?: number;
      passingTDs?: number;
      interceptions?: number;
      rushingYards?: number;
      rushingTDs?: number;
      receptions?: number;
      receivingYards?: number;
      receivingTDs?: number;
      fieldGoals?: number;
      extraPoints?: number;
    };
  };
  className?: string;
}

const DetailedPlayerStats: React.FC<DetailedPlayerStatsProps> = ({ player, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gameLog' | 'trends'>('overview');
  
  // Generate mock game log data
  const generateGameLog = (): PlayerStat[] => {
    const opponents = ['KC', 'SF', 'BUF', 'MIA', 'PHI', 'DAL', 'NYG', 'BAL'];
    const gameLog: PlayerStat[] = [];
    
    // Generate last 5 games
    for (let i = 0; i < 5; i++) {
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const date = new Date();
      date.setDate(date.getDate() - (i * 7)); // Weekly games
      
      // Base stats on player position
      const stats: PlayerStat = {
        game: `vs ${opponent}`,
        opponent,
        date: date.toLocaleDateString(),
        fantasyPoints: 0
      };
      
      if (player.position === 'QB') {
        stats.passingYards = Math.floor(200 + Math.random() * 200);
        stats.passingTDs = Math.floor(Math.random() * 4);
        stats.interceptions = Math.floor(Math.random() * 3);
        stats.rushingYards = Math.floor(Math.random() * 40);
        stats.rushingTDs = Math.random() > 0.8 ? 1 : 0;
      } else if (player.position === 'RB') {
        stats.rushingYards = Math.floor(50 + Math.random() * 100);
        stats.rushingTDs = Math.random() > 0.6 ? 1 : 0;
        stats.receptions = Math.floor(Math.random() * 5);
        stats.receivingYards = Math.floor(Math.random() * 50);
        stats.receivingTDs = Math.random() > 0.9 ? 1 : 0;
      } else if (player.position === 'WR' || player.position === 'TE') {
        stats.receptions = Math.floor(2 + Math.random() * 8);
        stats.receivingYards = Math.floor(30 + Math.random() * 100);
        stats.receivingTDs = Math.random() > 0.7 ? 1 : 0;
      } else if (player.position === 'K') {
        stats.fieldGoals = Math.floor(Math.random() * 4);
        stats.extraPoints = Math.floor(Math.random() * 5);
      }
      
      // Calculate fantasy points
      let points = 0;
      if (stats.passingYards) points += stats.passingYards * 0.04;
      if (stats.passingTDs) points += stats.passingTDs * 4;
      if (stats.interceptions) points -= stats.interceptions;
      if (stats.rushingYards) points += stats.rushingYards * 0.1;
      if (stats.rushingTDs) points += stats.rushingTDs * 6;
      if (stats.receptions) points += stats.receptions * 0.5;
      if (stats.receivingYards) points += stats.receivingYards * 0.1;
      if (stats.receivingTDs) points += stats.receivingTDs * 6;
      if (stats.fieldGoals) points += stats.fieldGoals * 3;
      if (stats.extraPoints) points += stats.extraPoints;
      
      stats.fantasyPoints = parseFloat(points.toFixed(1));
      gameLog.push(stats);
    }
    
    return gameLog;
  };
  
  // Generate trend data
  const generateTrends = (): PlayerTrend[] => {
    const gameLog = generateGameLog();
    const trends: PlayerTrend[] = [];
    
    // Fantasy points trend
    trends.push({
      category: 'Fantasy Points',
      data: gameLog.map(game => game.fantasyPoints).reverse(),
      color: '#3B82F6' // blue-500
    });
    
    // Position-specific trends
    if (player.position === 'QB') {
      trends.push({
        category: 'Passing Yards',
        data: gameLog.map(game => game.passingYards || 0).reverse(),
        color: '#EF4444' // red-500
      });
      trends.push({
        category: 'TDs',
        data: gameLog.map(game => (game.passingTDs || 0) + (game.rushingTDs || 0)).reverse(),
        color: '#10B981' // green-500
      });
    } else if (player.position === 'RB') {
      trends.push({
        category: 'Rushing Yards',
        data: gameLog.map(game => game.rushingYards || 0).reverse(),
        color: '#EF4444' // red-500
      });
      trends.push({
        category: 'Total Yards',
        data: gameLog.map(game => (game.rushingYards || 0) + (game.receivingYards || 0)).reverse(),
        color: '#8B5CF6' // purple-500
      });
    } else if (player.position === 'WR' || player.position === 'TE') {
      trends.push({
        category: 'Receiving Yards',
        data: gameLog.map(game => game.receivingYards || 0).reverse(),
        color: '#EF4444' // red-500
      });
      trends.push({
        category: 'Receptions',
        data: gameLog.map(game => game.receptions || 0).reverse(),
        color: '#F59E0B' // amber-500
      });
    }
    
    return trends;
  };
  
  const gameLog = generateGameLog();
  const trends = generateTrends();
  
  // Prepare radar chart data
  const getRadarChartData = () => {
    const stats = player.stats;
    const radarData = [];
    
    if (player.position === 'QB') {
      radarData.push({ category: 'Pass Yds', value: stats.passingYards || 0, maxValue: 400 });
      radarData.push({ category: 'Pass TDs', value: stats.passingTDs || 0, maxValue: 5 });
      radarData.push({ category: 'Comp %', value: 65, maxValue: 100 }); // Mock data
      radarData.push({ category: 'Rush Yds', value: stats.rushingYards || 0, maxValue: 100 });
      radarData.push({ category: 'INTs', value: stats.interceptions || 0, maxValue: 3 });
      radarData.push({ category: 'Yds/Att', value: 8.5, maxValue: 12 }); // Mock data
    } else if (player.position === 'RB') {
      radarData.push({ category: 'Rush Yds', value: stats.rushingYards || 0, maxValue: 200 });
      radarData.push({ category: 'Rush TDs', value: stats.rushingTDs || 0, maxValue: 3 });
      radarData.push({ category: 'Yds/Carry', value: 5.2, maxValue: 8 }); // Mock data
      radarData.push({ category: 'Rec', value: stats.receptions || 0, maxValue: 10 });
      radarData.push({ category: 'Rec Yds', value: stats.receivingYards || 0, maxValue: 100 });
      radarData.push({ category: 'Rec TDs', value: stats.receivingTDs || 0, maxValue: 2 });
    } else if (player.position === 'WR' || player.position === 'TE') {
      radarData.push({ category: 'Rec', value: stats.receptions || 0, maxValue: 15 });
      radarData.push({ category: 'Rec Yds', value: stats.receivingYards || 0, maxValue: 200 });
      radarData.push({ category: 'Rec TDs', value: stats.receivingTDs || 0, maxValue: 3 });
      radarData.push({ category: 'Targets', value: (stats.receptions || 0) + 4, maxValue: 20 }); // Mock data
      radarData.push({ category: 'Yds/Rec', value: stats.receivingYards ? stats.receivingYards / (stats.receptions || 1) : 0, maxValue: 25 });
      radarData.push({ category: 'Catch %', value: 70, maxValue: 100 }); // Mock data
    }
    
    return radarData;
  };
  
  // Render trend chart
  const renderTrendChart = (trend: PlayerTrend) => {
    const maxValue = Math.max(...trend.data);
    const chartHeight = 60;
    
    return (
      <div key={trend.category} className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{trend.category}</span>
          <span className="text-xs text-gray-500">Last 5 Games</span>
        </div>
        <div className="relative h-16">
          {/* Chart lines */}
          <div className="absolute inset-0 flex items-end">
            {trend.data.map((value, i) => (
              <div 
                key={i} 
                className="flex-1 mx-1 flex flex-col items-center justify-end"
              >
                <div 
                  className="w-full rounded-t transition-all duration-300 player-stat-bar"
                  style={{
                    // @ts-ignore
                    '--bar-height': `${(value / maxValue) * chartHeight}px`
                  } as React.CSSProperties}
                ></div>
                <span className="text-xs mt-1">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render game log table
  const renderGameLogTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opp</th>
              {player.position === 'QB' && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pass Yds</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">TD</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">INT</th>
                </>
              )}
              {(player.position === 'RB' || player.position === 'QB') && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rush Yds</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rush TD</th>
                </>
              )}
              {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rec</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rec Yds</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rec TD</th>
                </>
              )}
              {player.position === 'K' && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">FG</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">XP</th>
                </>
              )}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pts</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {gameLog.map((game, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                <td className="px-3 py-2 text-xs">{game.date}</td>
                <td className="px-3 py-2 text-xs">{game.opponent}</td>
                {player.position === 'QB' && (
                  <>
                    <td className="px-3 py-2 text-xs">{game.passingYards}</td>
                    <td className="px-3 py-2 text-xs">{game.passingTDs}</td>
                    <td className="px-3 py-2 text-xs">{game.interceptions}</td>
                  </>
                )}
                {(player.position === 'RB' || player.position === 'QB') && (
                  <>
                    <td className="px-3 py-2 text-xs">{game.rushingYards}</td>
                    <td className="px-3 py-2 text-xs">{game.rushingTDs}</td>
                  </>
                )}
                {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && (
                  <>
                    <td className="px-3 py-2 text-xs">{game.receptions}</td>
                    <td className="px-3 py-2 text-xs">{game.receivingYards}</td>
                    <td className="px-3 py-2 text-xs">{game.receivingTDs}</td>
                  </>
                )}
                {player.position === 'K' && (
                  <>
                    <td className="px-3 py-2 text-xs">{game.fieldGoals}</td>
                    <td className="px-3 py-2 text-xs">{game.extraPoints}</td>
                  </>
                )}
                <td className="px-3 py-2 text-xs font-medium">{game.fantasyPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className={`detailed-player-stats ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-4">
          <img
            src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.name.split(' ').map(n => n[0]).join('')}&background=random`}
            alt={player.name}
            className="w-16 h-16 rounded-full"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold">{player.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{player.position} • {player.team}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'gameLog'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('gameLog')}
        >
          Game Log
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'trends'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Season Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(player.stats).map(([key, value]) => {
                  if (value === undefined) return null;
                  
                  // Format the key for display
                  const formattedKey = key
                    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                  
                  return (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formattedKey}</div>
                      <div className="text-xl font-bold">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Performance</h4>
              <PlayerStatsRadarChart 
                playerName={player.name}
                stats={getRadarChartData()}
                color="#3B82F6" // blue-500
              />
            </div>
          </div>
        )}
        
        {activeTab === 'gameLog' && renderGameLogTable()}
        
        {activeTab === 'trends' && (
          <div>
            {trends.map(trend => renderTrendChart(trend))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedPlayerStats;
