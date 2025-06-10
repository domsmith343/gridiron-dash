import React, { useState, memo, useMemo, useCallback } from 'react';
import PlayerStatsRadarChart from './PlayerStatsRadarChart';
import TabNavigation from './ui/TabNavigation';
import { Card, CardHeader, CardContent } from './ui/Card';
import { generateAriaAttributes, generateId } from '../utils/accessibility';
import { Player, PlayerGameStats, PlayerTrend } from '../types';

interface DetailedPlayerStatsProps {
  player: Player;
  className?: string;
}

const DetailedPlayerStatsImproved: React.FC<DetailedPlayerStatsProps> = memo(({ player, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gameLog' | 'trends'>('overview');
  
  // Generate mock game log data with useMemo for performance
  const gameLog = useMemo((): PlayerGameStats[] => {
    const opponents = ['KC', 'SF', 'BUF', 'MIA', 'PHI', 'DAL', 'NYG', 'BAL'];
    const games: PlayerGameStats[] = [];
    
    // Generate last 5 games
    for (let i = 0; i < 5; i++) {
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const date = new Date();
      date.setDate(date.getDate() - (i * 7)); // Weekly games
      
      // Base stats on player position
      const stats: PlayerGameStats = {
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
      games.push(stats);
    }
    
    return games;
  }, [player.position]);
  
  // Generate trend data with useMemo
  const trends = useMemo((): PlayerTrend[] => {
    const trendData: PlayerTrend[] = [];
    
    // Fantasy points trend
    trendData.push({
      category: 'Fantasy Points',
      data: gameLog.map((game: PlayerGameStats) => game.fantasyPoints).reverse(),
      color: '#3B82F6' // blue-500
    });
    
    // Position-specific trends
    if (player.position === 'QB') {
      trendData.push({
        category: 'Passing Yards',
        data: gameLog.map((game: PlayerGameStats) => game.passingYards || 0).reverse(),
        color: '#EF4444' // red-500
      });
      trendData.push({
        category: 'TDs',
        data: gameLog.map((game: PlayerGameStats) => (game.passingTDs || 0) + (game.rushingTDs || 0)).reverse(),
        color: '#10B981' // green-500
      });
    } else if (player.position === 'RB') {
      trendData.push({
        category: 'Rushing Yards',
        data: gameLog.map((game: PlayerGameStats) => game.rushingYards || 0).reverse(),
        color: '#EF4444' // red-500
      });
      trendData.push({
        category: 'Total Yards',
        data: gameLog.map((game: PlayerGameStats) => (game.rushingYards || 0) + (game.receivingYards || 0)).reverse(),
        color: '#8B5CF6' // purple-500
      });
    } else if (player.position === 'WR' || player.position === 'TE') {
      trendData.push({
        category: 'Receiving Yards',
        data: gameLog.map((game: PlayerGameStats) => game.receivingYards || 0).reverse(),
        color: '#EF4444' // red-500
      });
      trendData.push({
        category: 'Receptions',
        data: gameLog.map((game: PlayerGameStats) => game.receptions || 0).reverse(),
        color: '#F59E0B' // amber-500
      });
    }
    
    return trendData;
  }, [gameLog, player.position]);
  
  // Prepare radar chart data with useMemo
  const radarChartData = useMemo(() => {
    const stats = player.stats;
    const radarData: Array<{ category: string; value: number; maxValue: number }> = [];
    
    if (player.position === 'QB') {
      radarData.push({ category: 'Pass Yds', value: stats.passingYards || 0, maxValue: 400 });
      radarData.push({ category: 'Pass TDs', value: stats.touchdowns || 0, maxValue: 5 });
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
      radarData.push({ category: 'Rec TDs', value: 0, maxValue: 2 }); // Would need receivingTDs in stats
    } else if (player.position === 'WR' || player.position === 'TE') {
      radarData.push({ category: 'Rec', value: stats.receptions || 0, maxValue: 15 });
      radarData.push({ category: 'Rec Yds', value: stats.receivingYards || 0, maxValue: 200 });
      radarData.push({ category: 'Rec TDs', value: 0, maxValue: 3 }); // Would need receivingTDs in stats
      radarData.push({ category: 'Targets', value: (stats.receptions || 0) + 4, maxValue: 20 }); // Mock data
      radarData.push({ category: 'Yds/Rec', value: stats.receivingYards ? stats.receivingYards / (stats.receptions || 1) : 0, maxValue: 25 });
      radarData.push({ category: 'Catch %', value: 70, maxValue: 100 }); // Mock data
    }
    
    return radarData;
  }, [player.stats, player.position]);
  
  // Render trend chart with better accessibility and no inline styles
  const renderTrendChart = useCallback((trend: PlayerTrend) => {
    const maxValue = Math.max(...trend.data);
    
    return (
      <Card key={trend.category} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white">{trend.category}</h5>
            <span className="text-xs text-gray-500 dark:text-gray-400">Last 5 Games</span>
          </div>
          <div className="h-16 flex items-end space-x-2" role="img" aria-label={`${trend.category} trend chart`}>
            {trend.data.map((value: number, i: number) => (
              <div 
                key={i} 
                className="flex-1 flex flex-col items-center justify-end"
                aria-label={`Game ${i + 1}: ${value}`}
              >
                <div 
                  className="w-full rounded-t transition-all duration-300 opacity-80 hover:opacity-100"
                  style={{ 
                    height: `${Math.max((value / maxValue) * 60, 2)}px`,
                    backgroundColor: trend.color 
                  }}
                />
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }, []);
  
  // Render game log table with accessibility improvements
  const renderGameLogTable = useCallback(() => {
    const tableId = generateId('game-log-table');
    
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table 
              id={tableId}
              className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
              role="table"
              aria-label={`${player.name} game log statistics`}
            >
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr role="row">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Opp</th>
                  {player.position === 'QB' && (
                    <>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Pass Yds</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">TD</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">INT</th>
                    </>
                  )}
                  {(player.position === 'RB' || player.position === 'QB') && (
                    <>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Rush Yds</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Rush TD</th>
                    </>
                  )}
                  {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && (
                    <>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Rec</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Rec Yds</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Rec TD</th>
                    </>
                  )}
                  {player.position === 'K' && (
                    <>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">FG</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">XP</th>
                    </>
                  )}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader">Pts</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {gameLog.map((game: PlayerGameStats, index: number) => (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                    role="row"
                  >
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.date}</td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.opponent}</td>
                    {player.position === 'QB' && (
                      <>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.passingYards}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.passingTDs}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.interceptions}</td>
                      </>
                    )}
                    {(player.position === 'RB' || player.position === 'QB') && (
                      <>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.rushingYards}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.rushingTDs}</td>
                      </>
                    )}
                    {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && (
                      <>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.receptions}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.receivingYards}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.receivingTDs}</td>
                      </>
                    )}
                    {player.position === 'K' && (
                      <>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.fieldGoals}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100" role="gridcell">{game.extraPoints}</td>
                      </>
                    )}
                    <td className="px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400" role="gridcell">{game.fantasyPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }, [gameLog, player.name, player.position]);

  const tabsConfig = [
    { id: 'overview', label: 'Overview' },
    { id: 'gameLog', label: 'Game Log' },
    { id: 'trends', label: 'Trends' }
  ];

  return (
    <div className={`detailed-player-stats ${className}`} {...generateAriaAttributes('detailed-stats', player.name)}>
      {/* Player Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <img
                src={player.photoUrl || `https://ui-avatars.com/api/?name=${player.name.split(' ').map((n: string) => n[0]).join('')}&background=random`}
                alt={`${player.name} avatar`}
                className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700"
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{player.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{player.position} • {player.team}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'overview' | 'gameLog' | 'trends')}
        className="mb-6"
      />
      
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Season Stats</h4>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(player.stats).map(([key, value]) => {
                    if (value === undefined || value === null) return null;
                    
                    // Format the key for display
                    const formattedKey = key
                      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                    
                    return (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formattedKey}</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{String(value)}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h4>
              </CardHeader>
              <CardContent>
                <PlayerStatsRadarChart 
                  playerName={player.name}
                  stats={radarChartData}
                  color="#3B82F6" // blue-500
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'gameLog' && renderGameLogTable()}
        
        {activeTab === 'trends' && (
          <div className="space-y-4">
            {trends.map(trend => renderTrendChart(trend))}
          </div>
        )}
      </div>
    </div>
  );
});

DetailedPlayerStatsImproved.displayName = 'DetailedPlayerStatsImproved';

export default DetailedPlayerStatsImproved;
