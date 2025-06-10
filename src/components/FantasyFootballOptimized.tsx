import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { teams, FantasyPlayer, generateMockPlayers } from '../services/mockData';
import DetailedPlayerStatsImproved from './DetailedPlayerStatsImproved';
import FavoriteButton from './FavoriteButton';
import TabNavigation from './ui/TabNavigation';
import { Card, CardHeader, CardContent } from './ui/Card';
import Loading from './ui/Loading';
import { Button } from './ui/Button';
import { useApi } from '../hooks/useApi';
import { generateAriaAttributes, generateId } from '../utils/accessibility';
import { FantasyPlayer as FantasyPlayerType, Player } from '../types';

interface FantasyTeam {
  id: string;
  name: string;
  owner: string;
  players: FantasyPlayer[];
  projectedPoints: number;
  actualPoints: number;
}

interface FantasyFootballProps {
  className?: string;
}

const FantasyFootballOptimized: React.FC<FantasyFootballProps> = memo(({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'myTeam' | 'topPlayers' | 'matchup'>('myTeam');
  const [selectedPlayer, setSelectedPlayer] = useState<FantasyPlayer | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  // Use our optimized useApi hook for data fetching
  const { data: topPlayers, loading: playersLoading, error: playersError } = useApi<FantasyPlayer[]>(
    () => Promise.resolve(generateMockPlayers()),
    []
  );

  // Create mock fantasy team with useMemo
  const myTeam = useMemo((): FantasyTeam | null => {
    if (!topPlayers?.length) return null;

    // Select players for the team
    const teamPlayers = [
      topPlayers.find(p => p.id === 'p1'), // QB
      topPlayers.find(p => p.id === 'p2'), // RB1
      topPlayers.find(p => p.position === 'RB' && p.id !== 'p2'), // RB2
      topPlayers.find(p => p.id === 'p3'), // WR1
      topPlayers.find(p => p.id === 'p9'), // WR2
      topPlayers.find(p => p.position === 'WR' && p.id !== 'p3' && p.id !== 'p9'), // WR3
      topPlayers.find(p => p.id === 'p4'), // TE
      topPlayers.find(p => p.id === 'p5'), // K
      topPlayers.find(p => p.id === 'p6') // DEF
    ].filter(Boolean) as FantasyPlayer[];
    
    // Calculate total points
    const projectedPoints = teamPlayers.reduce((sum, player) => sum + player.projectedPoints, 0);
    const actualPoints = teamPlayers.reduce((sum, player) => sum + player.actualPoints, 0);
    
    return {
      id: 'team1',
      name: 'Gridiron Champions',
      owner: 'You',
      players: teamPlayers,
      projectedPoints: parseFloat(projectedPoints.toFixed(1)),
      actualPoints: parseFloat(actualPoints.toFixed(1))
    };
  }, [topPlayers]);

  // Filter players by position with useMemo
  const filteredPlayers = useMemo(() => {
    if (!topPlayers) return [];
    return selectedPosition === 'ALL'
      ? topPlayers
      : topPlayers.filter(p => p.position === selectedPosition);
  }, [topPlayers, selectedPosition]);

  // Get unique positions for filter
  const positions = useMemo(() => {
    if (!topPlayers) return ['ALL'];
    return ['ALL', ...new Set(topPlayers.map(p => p.position).sort())];
  }, [topPlayers]);

  // Convert FantasyPlayer to Player for DetailedPlayerStats
  const convertToPlayer = useCallback((fantasyPlayer: FantasyPlayer): Player => ({
    id: fantasyPlayer.id,
    name: fantasyPlayer.name,
    team: fantasyPlayer.team,
    position: fantasyPlayer.position,
    jersey: '',
    photoUrl: fantasyPlayer.avatarUrl,
    stats: fantasyPlayer.stats
  }), []);

  // Render player card with optimization
  const renderPlayerCard = useCallback((player: FantasyPlayer, isTeamMember = false) => {
    const statusColor = {
      active: 'text-green-600 dark:text-green-400',
      injured: 'text-red-600 dark:text-red-400',
      questionable: 'text-yellow-600 dark:text-yellow-400',
      out: 'text-gray-600 dark:text-gray-400'
    }[player.status];

    return (
      <Card key={player.id} className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img
                src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.name.split(' ').map(n => n[0]).join('')}&background=random`}
                alt={`${player.name} avatar`}
                className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                loading="lazy"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{player.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {player.position} • {player.team}
                </p>
                <span className={`text-xs font-medium ${statusColor}`}>
                  {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FavoriteButton 
                itemId={player.id} 
                itemType="player" 
                itemName={player.name}
                size="sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlayer(player)}
                aria-label={`View ${player.name} details`}
              >
                View Stats
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <span className="text-gray-500 dark:text-gray-400 block">Projected</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{player.projectedPoints}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <span className="text-gray-500 dark:text-gray-400 block">Actual</span>
              <span className="font-bold text-green-600 dark:text-green-400">{player.actualPoints}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, []);

  // Render My Team tab
  const renderMyTeamTab = useCallback(() => {
    if (playersLoading) return <Loading variant="spinner" size="lg" />;
    if (!myTeam) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">No team data available.</div>;

    const positionGroups = {
      QB: myTeam.players.filter(p => p.position === 'QB'),
      RB: myTeam.players.filter(p => p.position === 'RB'),
      WR: myTeam.players.filter(p => p.position === 'WR'),
      TE: myTeam.players.filter(p => p.position === 'TE'),
      K: myTeam.players.filter(p => p.position === 'K'),
      DEF: myTeam.players.filter(p => p.position === 'DEF')
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{myTeam.name}</h3>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {myTeam.actualPoints} / {myTeam.projectedPoints}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {Object.entries(positionGroups).map(([position, players]) => (
          <div key={position}>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{position}</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {players.map(player => renderPlayerCard(player, true))}
            </div>
          </div>
        ))}
      </div>
    );
  }, [myTeam, playersLoading, renderPlayerCard]);

  // Render Top Players tab
  const renderTopPlayersTab = useCallback(() => {
    if (playersLoading) return <Loading variant="spinner" size="lg" />;
    if (playersError) return <div className="text-center py-8 text-red-600 dark:text-red-400">Failed to load players</div>;
    if (!filteredPlayers.length) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">No players found</div>;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Top Available Players</h3>
          <div className="flex items-center gap-2">
            <label 
              htmlFor="position-filter" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Filter by Position:
            </label>
            <select
              id="position-filter"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              aria-label="Filter players by position"
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map(player => renderPlayerCard(player))}
        </div>
      </div>
    );
  }, [filteredPlayers, playersLoading, playersError, selectedPosition, positions, renderPlayerCard]);

  const tabsConfig = [
    { id: 'myTeam', label: 'My Team' },
    { id: 'topPlayers', label: 'Top Players' },
    { id: 'matchup', label: 'Matchup' }
  ];

  if (selectedPlayer) {
    return (
      <div className={`fantasy-football ${className}`} {...generateAriaAttributes('fantasy-football')}>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedPlayer(null)}
            className="mb-4"
            aria-label="Back to fantasy football"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {activeTab === 'myTeam' ? 'My Team' : 'Top Players'}
          </Button>
          <DetailedPlayerStatsImproved player={convertToPlayer(selectedPlayer)} />
        </div>
      </div>
    );
  }

  return (
    <div className={`fantasy-football ${className}`} {...generateAriaAttributes('fantasy-football')}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fantasy Football</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your fantasy team and discover top players</p>
      </div>

      <TabNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'myTeam' | 'topPlayers' | 'matchup')}
        className="mb-6"
      />

      <div>
        {activeTab === 'myTeam' && renderMyTeamTab()}
        {activeTab === 'topPlayers' && renderTopPlayersTab()}
        {activeTab === 'matchup' && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Matchup Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">Coming soon! Compare your team against opponents.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
});

FantasyFootballOptimized.displayName = 'FantasyFootballOptimized';

export default FantasyFootballOptimized;
