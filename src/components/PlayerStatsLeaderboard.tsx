import React, { useState, useEffect } from 'react';
import { websocketService } from '../services/websocket';

// Define player stats types
interface PlayerStats {
  id: string;
  name: string;
  team: string;
  teamId: string;
  position: string;
  passingYards?: number;
  passingTDs?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receivingYards?: number;
  receivingTDs?: number;
  tackles?: number;
  sacks?: number;
  interceptions?: number;
  avatarUrl?: string;
}

interface PlayerStatsLeaderboardProps {
  className?: string;
  limit?: number;
}

const PlayerStatsLeaderboard: React.FC<PlayerStatsLeaderboardProps> = ({ 
  className = '',
  limit = 5
}) => {
  const [category, setCategory] = useState<'passing' | 'rushing' | 'receiving' | 'defense'>('passing');
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock player data (in a real app, this would come from an API)
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call with timeout
    const timeout = setTimeout(() => {
      // Generate mock player stats
      const mockPlayers: PlayerStats[] = [
        {
          id: 'p1',
          name: 'Patrick Mahomes',
          team: 'Kansas City Chiefs',
          teamId: 'KC',
          position: 'QB',
          passingYards: 4031,
          passingTDs: 36,
          rushingYards: 358,
          rushingTDs: 3,
          avatarUrl: 'https://ui-avatars.com/api/?name=PM&background=E31837&color=fff'
        },
        {
          id: 'p2',
          name: 'Josh Allen',
          team: 'Buffalo Bills',
          teamId: 'BUF',
          position: 'QB',
          passingYards: 3812,
          passingTDs: 29,
          rushingYards: 762,
          rushingTDs: 7,
          avatarUrl: 'https://ui-avatars.com/api/?name=JA&background=00338D&color=fff'
        },
        {
          id: 'p3',
          name: 'Jalen Hurts',
          team: 'Philadelphia Eagles',
          teamId: 'PHI',
          position: 'QB',
          passingYards: 3701,
          passingTDs: 23,
          rushingYards: 613,
          rushingTDs: 13,
          avatarUrl: 'https://ui-avatars.com/api/?name=JH&background=004C54&color=fff'
        },
        {
          id: 'p4',
          name: 'Brock Purdy',
          team: 'San Francisco 49ers',
          teamId: 'SF',
          position: 'QB',
          passingYards: 3553,
          passingTDs: 22,
          rushingYards: 144,
          rushingTDs: 2,
          avatarUrl: 'https://ui-avatars.com/api/?name=BP&background=AA0000&color=fff'
        },
        {
          id: 'p5',
          name: 'Tua Tagovailoa',
          team: 'Miami Dolphins',
          teamId: 'MIA',
          position: 'QB',
          passingYards: 3421,
          passingTDs: 25,
          rushingYards: 67,
          rushingTDs: 0,
          avatarUrl: 'https://ui-avatars.com/api/?name=TT&background=008E97&color=fff'
        },
        {
          id: 'p6',
          name: 'Christian McCaffrey',
          team: 'San Francisco 49ers',
          teamId: 'SF',
          position: 'RB',
          rushingYards: 1459,
          rushingTDs: 14,
          receivingYards: 564,
          receivingTDs: 7,
          avatarUrl: 'https://ui-avatars.com/api/?name=CM&background=AA0000&color=fff'
        },
        {
          id: 'p7',
          name: 'Derrick Henry',
          team: 'Tennessee Titans',
          teamId: 'TEN',
          position: 'RB',
          rushingYards: 1167,
          rushingTDs: 12,
          receivingYards: 214,
          receivingTDs: 0,
          avatarUrl: 'https://ui-avatars.com/api/?name=DH&background=0C2340&color=fff'
        },
        {
          id: 'p8',
          name: 'Saquon Barkley',
          team: 'New York Giants',
          teamId: 'NYG',
          position: 'RB',
          rushingYards: 962,
          rushingTDs: 6,
          receivingYards: 280,
          receivingTDs: 4,
          avatarUrl: 'https://ui-avatars.com/api/?name=SB&background=0B2265&color=fff'
        },
        {
          id: 'p9',
          name: 'Tyreek Hill',
          team: 'Miami Dolphins',
          teamId: 'MIA',
          position: 'WR',
          receivingYards: 1799,
          receivingTDs: 13,
          rushingYards: 32,
          rushingTDs: 0,
          avatarUrl: 'https://ui-avatars.com/api/?name=TH&background=008E97&color=fff'
        },
        {
          id: 'p10',
          name: 'CeeDee Lamb',
          team: 'Dallas Cowboys',
          teamId: 'DAL',
          position: 'WR',
          receivingYards: 1749,
          receivingTDs: 12,
          rushingYards: 113,
          rushingTDs: 1,
          avatarUrl: 'https://ui-avatars.com/api/?name=CL&background=003594&color=fff'
        },
        {
          id: 'p11',
          name: 'A.J. Brown',
          team: 'Philadelphia Eagles',
          teamId: 'PHI',
          position: 'WR',
          receivingYards: 1456,
          receivingTDs: 7,
          avatarUrl: 'https://ui-avatars.com/api/?name=AB&background=004C54&color=fff'
        },
        {
          id: 'p12',
          name: 'T.J. Watt',
          team: 'Pittsburgh Steelers',
          teamId: 'PIT',
          position: 'LB',
          sacks: 19,
          tackles: 68,
          interceptions: 1,
          avatarUrl: 'https://ui-avatars.com/api/?name=TW&background=FFB612&color=000'
        },
        {
          id: 'p13',
          name: 'Myles Garrett',
          team: 'Cleveland Browns',
          teamId: 'CLE',
          position: 'DE',
          sacks: 14,
          tackles: 42,
          interceptions: 0,
          avatarUrl: 'https://ui-avatars.com/api/?name=MG&background=311D00&color=fff'
        },
        {
          id: 'p14',
          name: 'Micah Parsons',
          team: 'Dallas Cowboys',
          teamId: 'DAL',
          position: 'LB',
          sacks: 13,
          tackles: 64,
          interceptions: 0,
          avatarUrl: 'https://ui-avatars.com/api/?name=MP&background=003594&color=fff'
        },
        {
          id: 'p15',
          name: 'DaRon Bland',
          team: 'Dallas Cowboys',
          teamId: 'DAL',
          position: 'CB',
          interceptions: 8,
          tackles: 58,
          sacks: 0,
          avatarUrl: 'https://ui-avatars.com/api/?name=DB&background=003594&color=fff'
        }
      ];
      
      setPlayers(mockPlayers);
      setLoading(false);
    }, 1000);
    
    // Subscribe to stat updates
    const unsubscribeStatUpdates = websocketService.subscribeToStatUpdates((stats) => {
      // In a real app, we would update player stats based on the websocket data
      console.log('Stat update received:', stats);
      // For now, we'll just use our mock data
    });
    
    return () => {
      clearTimeout(timeout);
      unsubscribeStatUpdates();
    };
  }, []);
  
  // Sort and filter players based on selected category
  const getLeaderboardData = () => {
    let sortedPlayers = [...players];
    
    switch (category) {
      case 'passing':
        sortedPlayers = sortedPlayers
          .filter(p => p.passingYards !== undefined)
          .sort((a, b) => (b.passingYards || 0) - (a.passingYards || 0));
        break;
      case 'rushing':
        sortedPlayers = sortedPlayers
          .filter(p => p.rushingYards !== undefined)
          .sort((a, b) => (b.rushingYards || 0) - (a.rushingYards || 0));
        break;
      case 'receiving':
        sortedPlayers = sortedPlayers
          .filter(p => p.receivingYards !== undefined)
          .sort((a, b) => (b.receivingYards || 0) - (a.receivingYards || 0));
        break;
      case 'defense':
        sortedPlayers = sortedPlayers
          .filter(p => p.sacks !== undefined || p.interceptions !== undefined)
          .sort((a, b) => {
            // Sort by combined defensive stats (sacks + interceptions)
            const aTotal = (a.sacks || 0) + (a.interceptions || 0) * 2; // Weight interceptions higher
            const bTotal = (b.sacks || 0) + (b.interceptions || 0) * 2;
            return bTotal - aTotal;
          });
        break;
    }
    
    return sortedPlayers.slice(0, limit);
  };
  
  // Get the appropriate stat value based on category
  const getStatValue = (player: PlayerStats) => {
    switch (category) {
      case 'passing':
        return `${player.passingYards} YDS, ${player.passingTDs} TD`;
      case 'rushing':
        return `${player.rushingYards} YDS, ${player.rushingTDs} TD`;
      case 'receiving':
        return `${player.receivingYards} YDS, ${player.receivingTDs} TD`;
      case 'defense':
        if (player.position === 'CB' || player.position === 'S') {
          return `${player.interceptions} INT, ${player.tackles} TKL`;
        } else {
          return `${player.sacks} SACK, ${player.tackles} TKL`;
        }
    }
  };
  
  return (
    <div className={`player-stats-leaderboard ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Player Leaders</h3>
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
          <button
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              category === 'passing' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setCategory('passing')}
          >
            Passing
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              category === 'rushing' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setCategory('rushing')}
          >
            Rushing
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              category === 'receiving' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setCategory('receiving')}
          >
            Receiving
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              category === 'defense' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setCategory('defense')}
          >
            Defense
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {getLeaderboardData().map((player, index) => (
            <li key={player.id} className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-8 text-center font-semibold text-gray-500 dark:text-gray-400">
                {index + 1}
              </div>
              <div className="flex-shrink-0 ml-2">
                <img
                  src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.name.split(' ').map(n => n[0]).join('')}&background=random`}
                  alt={player.name}
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{player.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{player.position} • {player.team}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{getStatValue(player)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerStatsLeaderboard;
