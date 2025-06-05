import React, { useState, useEffect } from 'react';
import { teams, FantasyPlayer, generateMockPlayers } from '../services/mockData';
import DetailedPlayerStats from './DetailedPlayerStats';
import { websocketService } from '../services/websocket';
import FavoriteButton from './FavoriteButton';

// FantasyPlayer interface is now imported from mockData.ts

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

const FantasyFootball: React.FC<FantasyFootballProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'myTeam' | 'topPlayers' | 'matchup'>('myTeam');
  const [selectedPlayer, setSelectedPlayer] = useState<FantasyPlayer | null>(null);
  const [myTeam, setMyTeam] = useState<FantasyTeam | null>(null);
  const [topPlayers, setTopPlayers] = useState<FantasyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');



  // Create a mock fantasy team
  const createMockTeam = (players: FantasyPlayer[]): FantasyTeam => {
    // Select players for the team
    const teamPlayers = [
      players.find(p => p.id === 'p1')!, // QB
      players.find(p => p.id === 'p2')!, // RB1
      players.find(p => p.position === 'RB' && p.id !== 'p2')!, // RB2
      players.find(p => p.id === 'p3')!, // WR1
      players.find(p => p.id === 'p9')!, // WR2
      players.find(p => p.position === 'WR' && p.id !== 'p3' && p.id !== 'p9')!, // WR3
      players.find(p => p.id === 'p4')!, // TE
      players.find(p => p.id === 'p5')!, // K
      players.find(p => p.id === 'p6')! // DEF
    ];
    
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
  };

    // Render the Top Players tab
  const renderTopPlayersTab = () => {
    if (loading) return <div className="text-center py-8">Loading top players...</div>;
    if (!topPlayers.length && !loading) return <div className="text-center py-8">No top players data available.</div>;

    const filteredPlayers = selectedPosition === 'ALL'
      ? topPlayers
      : topPlayers.filter(p => p.position === selectedPosition);

    // Unique positions for filter dropdown
    const positions = ['ALL', ...new Set(topPlayers.map(p => p.position).sort())];

    return (
      <div>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Top Available Players</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="position-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Position:</label>
            <select
              id="position-filter"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedPlayer ? (
          <div className="mb-4">
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="mb-4 flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Top Players
            </button>
            <DetailedPlayerStats player={selectedPlayer} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map(player => (
              <div key={player.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="flex items-start mb-3">
                  <img 
                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff`} 
                    alt={`${player.name} avatar`}
                    className="w-16 h-16 rounded-full mr-4 border-2 border-gray-200 dark:border-gray-700"
                    onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=P&background=cccccc&color=fff')} // Fallback
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-white truncate" title={player.name}>{player.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{player.position} • {player.team}</p>
                  </div>
                  <FavoriteButton itemId={player.id} itemType="player" itemName={player.name} className="ml-2 flex-shrink-0" />
                </div>
                <div className="text-sm space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Actual Pts:</span> 
                    <span className="font-semibold text-gray-800 dark:text-white">{player.actualPoints.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Projected Pts:</span>
                    <span className="text-gray-500 dark:text-gray-400">{player.projectedPoints.toFixed(1)}</span>
                  </div>
                </div>
                {player.status !== 'active' && (
                  <p className={`text-xs font-semibold mb-2 ${ 
                    player.status === 'injured' || player.status === 'out' 
                      ? 'text-red-500' 
                      : player.status === 'questionable' ? 'text-yellow-500' : 'text-gray-500'
                  }`}>
                    Status: {player.status.toUpperCase()}
                  </p>
                )}
                <button 
                  onClick={() => setSelectedPlayer(player)} 
                  className="mt-auto w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium py-2 px-3 rounded-md bg-primary-50 dark:bg-primary-700 dark:hover:bg-primary-600 hover:bg-primary-100 transition-colors"
                >
                  View Detailed Stats
                </button>
              </div> 
            ))}
            {filteredPlayers.length === 0 && !loading && (
              <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                No players match the selected position.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render the Matchup tab (Placeholder)
  const renderMatchupTab = () => {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-xl font-semibold text-gray-800 dark:text-white">Matchup Analysis</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Detailed matchup breakdowns are coming soon. Check back later!</p>
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const players = generateMockPlayers();
      const team = createMockTeam(players);
      setTopPlayers(players.sort((a, b) => b.actualPoints - a.actualPoints));
      setMyTeam(team);
      setLoading(false);
    }, 1000);
    
    // Subscribe to stat updates
    const unsubscribeStatUpdates = websocketService.subscribeToStatUpdates((stats) => {
      // In a real app, we would update fantasy points based on the websocket data
      console.log('Fantasy stat update received:', stats);
      // For now, we'll just use our mock data
    });
    
    return () => {
      unsubscribeStatUpdates();
    };
  }, []);


// ... (rest of the code remains the same)

// Render the My Team tab
const renderMyTeamTab = () => {
  if (!myTeam) return <div className="text-center py-8">Loading your team...</div>;
  
  return (
    <div>
      {selectedPlayer ? (
        <div className="mb-4">
          <button 
            onClick={() => setSelectedPlayer(null)}
            className="mb-4 flex items-center text-sm text-primary-500 hover:text-primary-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Team
          </button>
          
          <DetailedPlayerStats player={selectedPlayer} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">My Team</h3>
            <div className="space-y-3">
              {myTeam.players.map((player, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer" 
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center overflow-hidden">
                    <img 
                      src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.name.split(' ').map(n => n[0]).join('')}&background=random`} 
                      alt={player.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm">{player.actualPoints} pts</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{player.position} • {player.team}</span>
                      <span>Proj: {player.projectedPoints}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


  return (
    <div className={`fantasy-football-container ${className} bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-md`}>
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
          {(['myTeam', 'topPlayers', 'matchup'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedPlayer(null); // Reset selected player when changing tabs
              }}
              className={`whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded-t-md
                ${activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }
              `}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab === 'myTeam' && 'My Team'}
              {tab === 'topPlayers' && 'Top Players'}
              {tab === 'matchup' && 'Matchup'}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="mt-4 min-h-[300px]">
        {loading && (
          <div className="flex justify-center items-center py-12 h-full">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-gray-700 dark:text-gray-300">Loading Fantasy Data...</span>
          </div>
        )}
        {!loading && (
          <>
            {activeTab === 'myTeam' && renderMyTeamTab()}
            {activeTab === 'topPlayers' && renderTopPlayersTab()}
            {activeTab === 'matchup' && renderMatchupTab()}
          </>
        )}
      </div>
    </div>
  );
}; // Closes the FantasyFootball component

export default FantasyFootball;
