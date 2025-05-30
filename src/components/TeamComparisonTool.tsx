import React, { useState, useEffect } from 'react';
import { teams } from '../services/mockData';
import type { Team } from '../types/game';
import TeamComparisonChart from './TeamComparisonChart';

interface TeamStats {
  offense: {
    [key: string]: number;
    passingYards: number;
    rushingYards: number;
    totalYards: number;
    pointsPerGame: number;
    thirdDownPercentage: number;
    redZonePercentage: number;
    turnovers: number;
  };
  defense: {
    [key: string]: number;
    passingYardsAllowed: number;
    rushingYardsAllowed: number;
    totalYardsAllowed: number;
    pointsAllowedPerGame: number;
    sacks: number;
    interceptions: number;
    forcedFumbles: number;
  };
  special: {
    [key: string]: number;
    fieldGoalPercentage: number;
    puntAverage: number;
    kickReturnAverage: number;
    puntReturnAverage: number;
  };
}

interface TeamWithStats extends Team {
  stats: TeamStats;
}

interface TeamComparisonToolProps {
  className?: string;
}

const TeamComparisonTool: React.FC<TeamComparisonToolProps> = ({ className = '' }) => {
  const [team1, setTeam1] = useState<TeamWithStats | null>(null);
  const [team2, setTeam2] = useState<TeamWithStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'offense' | 'defense' | 'special'>('offense');

  // Generate mock stats for a team
  const generateTeamStats = (team: Team): TeamWithStats => {
    // Use team ID as seed for "random" but consistent stats
    const seed = team.id.charCodeAt(0) + (team.id.charCodeAt(1) || 0);
    
    return {
      ...team,
      stats: {
        offense: {
          passingYards: 200 + (seed % 100),
          rushingYards: 100 + (seed % 50),
          totalYards: 300 + (seed % 150),
          pointsPerGame: 20 + (seed % 10),
          thirdDownPercentage: 30 + (seed % 20),
          redZonePercentage: 50 + (seed % 25),
          turnovers: 1 + (seed % 2)
        },
        defense: {
          passingYardsAllowed: 180 + (seed % 100),
          rushingYardsAllowed: 90 + (seed % 60),
          totalYardsAllowed: 270 + (seed % 160),
          pointsAllowedPerGame: 18 + (seed % 12),
          sacks: 2 + (seed % 3),
          interceptions: 1 + (seed % 2),
          forcedFumbles: 1 + (seed % 2)
        },
        special: {
          fieldGoalPercentage: 75 + (seed % 20),
          puntAverage: 40 + (seed % 10),
          kickReturnAverage: 20 + (seed % 8),
          puntReturnAverage: 8 + (seed % 6)
        }
      }
    };
  };

  // Load team stats when a team is selected
  const loadTeamStats = (teamId: string, teamNumber: 1 | 2) => {
    setLoading(true);
    
    // Find the selected team
    const selectedTeam = teams.find(t => t.id === teamId);
    
    if (selectedTeam) {
      // In a real app, we would fetch stats from an API
      // For now, we'll generate mock stats
      setTimeout(() => {
        const teamWithStats = generateTeamStats(selectedTeam);
        
        if (teamNumber === 1) {
          setTeam1(teamWithStats);
        } else {
          setTeam2(teamWithStats);
        }
        
        setLoading(false);
      }, 500); // Simulate API delay
    } else {
      if (teamNumber === 1) {
        setTeam1(null);
      } else {
        setTeam2(null);
      }
      setLoading(false);
    }
  };

  // Get the better team for a specific stat
  const getBetterTeam = (stat1: number, stat2: number, higherIsBetter = true): 1 | 2 | null => {
    if (!team1 || !team2) return null;
    if (stat1 === stat2) return null;
    
    return higherIsBetter 
      ? (stat1 > stat2 ? 1 : 2)
      : (stat1 < stat2 ? 1 : 2);
  };

  // Render a comparison row for a specific stat
  const renderComparisonRow = (
    label: string, 
    team1Stat: number, 
    team2Stat: number, 
    unit: string = '', 
    higherIsBetter: boolean = true
  ) => {
    const betterTeam = getBetterTeam(team1Stat, team2Stat, higherIsBetter);
    
    return (
      <div className="grid grid-cols-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className={`text-right pr-4 ${betterTeam === 1 ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
          {team1Stat}{unit}
        </div>
        <div className="text-center font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
        <div className={`text-left pl-4 ${betterTeam === 2 ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
          {team2Stat}{unit}
        </div>
      </div>
    );
  };

  // Render the comparison stats based on the active tab
  const renderComparisonStats = () => {
    if (!team1 || !team2) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Please select two teams to compare
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'offense':
        return (
          <div className="space-y-1">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Offense</h3>
              <div className="mb-4">
                <TeamComparisonChart
                  team1Name={team1?.name || ''}
                  team2Name={team2?.name || ''}
                  team1Color={team1?.primaryColor || '#3B82F6'}
                  team2Color={team2?.primaryColor || '#EF4444'}
                  data={[
                    {
                      category: 'Passing Yards/Game',
                      team1Value: team1.stats.offense.passingYards,
                      team2Value: team2.stats.offense.passingYards,
                      higherIsBetter: true
                    },
                    {
                      category: 'Rushing Yards/Game',
                      team1Value: team1.stats.offense.rushingYards,
                      team2Value: team2.stats.offense.rushingYards,
                      higherIsBetter: true
                    },
                    {
                      category: 'Total Yards/Game',
                      team1Value: team1.stats.offense.totalYards,
                      team2Value: team2.stats.offense.totalYards,
                      higherIsBetter: true
                    },
                    {
                      category: 'Points/Game',
                      team1Value: team1.stats.offense.pointsPerGame,
                      team2Value: team2.stats.offense.pointsPerGame,
                      higherIsBetter: true
                    },
                    {
                      category: '3rd Down %',
                      team1Value: team1.stats.offense.thirdDownPercentage,
                      team2Value: team2.stats.offense.thirdDownPercentage,
                      higherIsBetter: true
                    },
                    {
                      category: 'Red Zone %',
                      team1Value: team1.stats.offense.redZonePercentage,
                      team2Value: team2.stats.offense.redZonePercentage,
                      higherIsBetter: true
                    },
                    {
                      category: 'Turnovers/Game',
                      team1Value: team1.stats.offense.turnovers,
                      team2Value: team2.stats.offense.turnovers,
                      higherIsBetter: false
                    }
                  ]}
                />
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">{team1?.name}</th>
                    <th className="text-center py-2">Stat</th>
                    <th className="text-right py-2">{team2?.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Passing Yards/Game', key: 'passingYards', higherIsBetter: true },
                    { label: 'Rushing Yards/Game', key: 'rushingYards', higherIsBetter: true },
                    { label: 'Total Yards/Game', key: 'totalYards', higherIsBetter: true },
                    { label: 'Points/Game', key: 'pointsPerGame', higherIsBetter: true },
                    { label: '3rd Down %', key: 'thirdDownPercentage', higherIsBetter: true },
                    { label: 'Red Zone %', key: 'redZonePercentage', higherIsBetter: true },
                    { label: 'Turnovers/Game', key: 'turnovers', higherIsBetter: false }
                  ].map((stat, index) => {
                    const team1Value = team1.stats.offense[stat.key];
                    const team2Value = team2.stats.offense[stat.key];
                    const team1Better = stat.higherIsBetter ? team1Value > team2Value : team1Value < team2Value;
                    const team2Better = stat.higherIsBetter ? team2Value > team1Value : team2Value < team1Value;
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className={`py-2 text-left ${team1Better ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>{team1Value}</td>
                        <td className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">{stat.label}</td>
                        <td className={`py-2 text-right ${team2Better ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>{team2Value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'defense':
        return (
          <div className="space-y-1">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Defense</h3>
              <div className="mb-4">
                <TeamComparisonChart
                  team1Name={team1?.name || ''}
                  team2Name={team2?.name || ''}
                  team1Color={team1?.primaryColor || '#3B82F6'}
                  team2Color={team2?.primaryColor || '#EF4444'}
                  data={[
                    {
                      category: 'Passing Yards Allowed',
                      team1Value: team1.stats.defense.passingYardsAllowed,
                      team2Value: team2.stats.defense.passingYardsAllowed,
                      higherIsBetter: false
                    },
                    {
                      category: 'Rushing Yards Allowed',
                      team1Value: team1.stats.defense.rushingYardsAllowed,
                      team2Value: team2.stats.defense.rushingYardsAllowed,
                      higherIsBetter: false
                    },
                    {
                      category: 'Total Yards Allowed',
                      team1Value: team1.stats.defense.totalYardsAllowed,
                      team2Value: team2.stats.defense.totalYardsAllowed,
                      higherIsBetter: false
                    },
                    {
                      category: 'Points Allowed/Game',
                      team1Value: team1.stats.defense.pointsAllowedPerGame,
                      team2Value: team2.stats.defense.pointsAllowedPerGame,
                      higherIsBetter: false
                    },
                    {
                      category: 'Sacks/Game',
                      team1Value: team1.stats.defense.sacks,
                      team2Value: team2.stats.defense.sacks,
                      higherIsBetter: true
                    },
                    {
                      category: 'Interceptions/Game',
                      team1Value: team1.stats.defense.interceptions,
                      team2Value: team2.stats.defense.interceptions,
                      higherIsBetter: true
                    },
                    {
                      category: 'Forced Fumbles/Game',
                      team1Value: team1.stats.defense.forcedFumbles,
                      team2Value: team2.stats.defense.forcedFumbles,
                      higherIsBetter: true
                    }
                  ]}
                />
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">{team1?.name}</th>
                    <th className="text-center py-2">Stat</th>
                    <th className="text-right py-2">{team2?.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Passing Yards Allowed', key: 'passingYardsAllowed', higherIsBetter: false },
                    { label: 'Rushing Yards Allowed', key: 'rushingYardsAllowed', higherIsBetter: false },
                    { label: 'Total Yards Allowed', key: 'totalYardsAllowed', higherIsBetter: false },
                    { label: 'Points Allowed/Game', key: 'pointsAllowedPerGame', higherIsBetter: false },
                    { label: 'Sacks/Game', key: 'sacks', higherIsBetter: true },
                    { label: 'Interceptions/Game', key: 'interceptions', higherIsBetter: true },
                    { label: 'Forced Fumbles/Game', key: 'forcedFumbles', higherIsBetter: true }
                  ].map((stat, index) => {
                    const team1Value = team1.stats.defense[stat.key];
                    const team2Value = team2.stats.defense[stat.key];
                    const team1Better = stat.higherIsBetter ? team1Value > team2Value : team1Value < team2Value;
                    const team2Better = stat.higherIsBetter ? team2Value > team1Value : team2Value < team1Value;
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className={`py-2 text-left ${team1Better ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>{team1Value}</td>
                        <td className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">{stat.label}</td>
                        <td className={`py-2 text-right ${team2Better ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>{team2Value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'special':
        return (
          <div className="space-y-1">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Special Teams</h3>
              <div className="mb-4">
                <TeamComparisonChart
                  team1Name={team1?.name || ''}
                  team2Name={team2?.name || ''}
                  team1Color={team1?.primaryColor || '#3B82F6'}
                  team2Color={team2?.primaryColor || '#EF4444'}
                  data={[
                    {
                      category: 'Field Goal %',
                      team1Value: team1.stats.special.fieldGoalPercentage,
                      team2Value: team2.stats.special.fieldGoalPercentage,
                      higherIsBetter: true
                    },
                    {
                      category: 'Punt Average',
                      team1Value: team1.stats.special.puntAverage,
                      team2Value: team2.stats.special.puntAverage,
                      higherIsBetter: true
                    },
                    {
                      category: 'Kick Return Average',
                      team1Value: team1.stats.special.kickReturnAverage,
                      team2Value: team2.stats.special.kickReturnAverage,
                      higherIsBetter: true
                    },
                    {
                      category: 'Punt Return Average',
                      team1Value: team1.stats.special.puntReturnAverage,
                      team2Value: team2.stats.special.puntReturnAverage,
                      higherIsBetter: true
                    }
                  ]}
                />
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">{team1?.name}</th>
                    <th className="text-center py-2">Stat</th>
                    <th className="text-right py-2">{team2?.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Field Goal %', key: 'fieldGoalPercentage', higherIsBetter: true },
                    { label: 'Punt Average', key: 'puntAverage', higherIsBetter: true },
                    { label: 'Kick Return Average', key: 'kickReturnAverage', higherIsBetter: true },
                    { label: 'Punt Return Average', key: 'puntReturnAverage', higherIsBetter: true }
                  ].map((stat, index) => {
                    const team1Value = team1.stats.special[stat.key];
                    const team2Value = team2.stats.special[stat.key];
                    const team1Better = stat.higherIsBetter ? team1Value > team2Value : team1Value < team2Value;
                    const team2Better = stat.higherIsBetter ? team2Value > team1Value : team2Value < team1Value;
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className={`py-2 text-left ${team1Better ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>{team1Value}</td>
                        <td className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">{stat.label}</td>
                        <td className={`py-2 text-right ${team2Better ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>{team2Value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Get historical matchup data (mock data)
  const getHistoricalMatchups = () => {
    if (!team1 || !team2) return [];
    
    // Generate consistent but "random" results based on team IDs
    const seed = (team1.id.charCodeAt(0) + team2.id.charCodeAt(0)) % 10;
    
    return [
      {
        date: '2024-12-15',
        winner: seed % 2 === 0 ? team1.id : team2.id,
        score: `${20 + (seed % 15)}-${10 + (seed % 20)}`
      },
      {
        date: '2024-01-20',
        winner: seed % 3 === 0 ? team1.id : team2.id,
        score: `${24 + (seed % 10)}-${21 + (seed % 8)}`
      },
      {
        date: '2023-11-05',
        winner: seed % 2 === 1 ? team1.id : team2.id,
        score: `${17 + (seed % 14)}-${14 + (seed % 10)}`
      }
    ];
  };

  // Render historical matchups
  const renderHistoricalMatchups = () => {
    if (!team1 || !team2) return null;
    
    const matchups = getHistoricalMatchups();
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Recent Matchups</h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          {matchups.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">No recent matchups found</p>
          ) : (
            <div className="space-y-3">
              {matchups.map((matchup, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(matchup.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="font-medium">
                    <span className={matchup.winner === team1.id ? 'text-green-600 dark:text-green-400 font-bold' : ''}>
                      {team1.abbreviation}
                    </span>
                    {' '}{matchup.score.split('-')[0]}{' - '}{matchup.score.split('-')[1]}{' '}
                    <span className={matchup.winner === team2.id ? 'text-green-600 dark:text-green-400 font-bold' : ''}>
                      {team2.abbreviation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`team-comparison-tool ${className}`}>
      <h2 className="text-2xl font-semibold text-primary-700 dark:text-primary-200 mb-4">Team Comparison</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Team 1 Selector */}
        <div>
          <label htmlFor="team1-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team 1
          </label>
          <select
            id="team1-select"
            className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            value={team1?.id || ''}
            onChange={(e) => loadTeamStats(e.target.value, 1)}
          >
            <option value="">Select Team 1</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id} disabled={team.id === team2?.id}>
                {team.city} {team.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Team 2 Selector */}
        <div>
          <label htmlFor="team2-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team 2
          </label>
          <select
            id="team2-select"
            className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            value={team2?.id || ''}
            onChange={(e) => loadTeamStats(e.target.value, 2)}
          >
            <option value="">Select Team 2</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id} disabled={team.id === team1?.id}>
                {team.city} {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Team Headers */}
      {team1 && team2 && (
        <div className="grid grid-cols-3 mb-4">
          <div className="flex flex-col items-center">
            <div 
               className="w-16 h-16 flex items-center justify-center rounded-full mb-2 text-white team-avatar-bg"
               style={{
                 // @ts-ignore
                 '--team-bg': team1.primaryColor
               } as React.CSSProperties}
             >
              {team1.logoUrl ? (
                <img src={team1.logoUrl} alt={`${team1.name} logo`} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-xl font-bold">{team1.abbreviation}</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-center">{team1.city} {team1.name}</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">VS</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div 
               className="w-16 h-16 flex items-center justify-center rounded-full mb-2 text-white team-avatar-bg"
               style={{
                 // @ts-ignore
                 '--team-bg': team2.primaryColor
               } as React.CSSProperties}
             >
              {team2.logoUrl ? (
                <img src={team2.logoUrl} alt={`${team2.name} logo`} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-xl font-bold">{team2.abbreviation}</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-center">{team2.city} {team2.name}</h3>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'offense'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('offense')}
        >
          Offense
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'defense'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('defense')}
        >
          Defense
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'special'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('special')}
        >
          Special Teams
        </button>
      </div>
      
      {/* Comparison Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        {renderComparisonStats()}
      </div>
      
      {/* Historical Matchups */}
      {renderHistoricalMatchups()}
    </div>
  );
};

export default TeamComparisonTool;
