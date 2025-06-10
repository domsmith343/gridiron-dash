import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Grid, Section, Flex, Stack } from './ui/Layout';
import { LineChart, BarChart, PieChart, ProgressChart } from './ui/Charts';
import { Button } from './ui/Button';
import { TabNavigation } from './ui/TabNavigation';
import { useApi } from '../hooks/useApi';
import { useDataFetching } from '../hooks/useDataFetching';
import { usePerformance } from '../hooks/usePerformance';
import { Loading } from './ui/Loading';
import { TEAM_COLORS, FANTASY_SCORING, API_CONFIG } from '../constants';
import type { Player, Team, Game } from '../types';

// Quick stats component
function QuickStats() {
  const { data: stats } = useApi('/api/dashboard/quick-stats');
  
  const quickStatsData = [
    { label: 'Active Players', value: stats?.activePlayers || 0, change: '+5.2%', trend: 'up' },
    { label: 'Games This Week', value: stats?.gamesThisWeek || 0, change: '', trend: 'neutral' },
    { label: 'Fantasy Leagues', value: stats?.fantasyLeagues || 0, change: '+12.5%', trend: 'up' },
    { label: 'Avg Points/Game', value: stats?.avgPoints || 0, change: '-2.3%', trend: 'down' },
  ];
  
  return (
    <Grid cols={{ default: 2, lg: 4 }} gap={4}>
      {quickStatsData.map((stat, index) => (
        <Card key={index} variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
              {stat.change && (
                <div className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.trend === 'up' && '↗'}
                  {stat.trend === 'down' && '↘'}
                  {stat.change}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
}

// Top performers component
function TopPerformers() {
  const { data: players, loading } = useApi<Player[]>('/api/players/top-performers');
  
  const memoizedPlayers = useMemo(() => {
    if (!players) return [];
    return players.slice(0, 5);
  }, [players]);
  
  if (loading) return <Loading variant="skeleton" />;
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Top Performers This Week</h3>
      </CardHeader>
      <CardContent>
        <Stack space={3}>
          {memoizedPlayers.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{player.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {player.position} • {player.team}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {player.stats?.fantasyPoints || 0} pts
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fantasy</p>
              </div>
            </div>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// Upcoming games component
function UpcomingGames() {
  const { data: games, loading } = useApi<Game[]>('/api/games/upcoming');
  
  if (loading) return <Loading variant="skeleton" />;
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Upcoming Games</h3>
      </CardHeader>
      <CardContent>
        <Stack space={3}>
          {games?.slice(0, 3).map((game) => (
            <div key={game.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(game.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(game.date).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">{game.awayTeam.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{game.awayTeam.record}</p>
                </div>
                <div className="text-gray-400 dark:text-gray-600">@</div>
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">{game.homeTeam.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{game.homeTeam.record}</p>
                </div>
              </div>
            </div>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// Fantasy trends component
function FantasyTrends() {
  const { data: trendsData } = useApi('/api/fantasy/trends');
  
  const chartData = useMemo(() => {
    if (!trendsData) return [];
    
    return [{
      name: 'Fantasy Points',
      data: trendsData.weeklyPoints?.map((point: number, index: number) => ({
        x: index + 1,
        y: point,
        label: `Week ${index + 1}`,
      })) || [],
      color: '#3B82F6',
    }];
  }, [trendsData]);
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Fantasy Trends</h3>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            height={200}
            showGrid={true}
            showTooltip={true}
            showLegend={false}
            smooth={true}
          />
        ) : (
          <Loading variant="skeleton" />
        )}
      </CardContent>
    </Card>
  );
}

// Team performance component
function TeamPerformance() {
  const { data: teamData } = useApi('/api/teams/performance');
  
  const chartData = useMemo(() => {
    if (!teamData) return [];
    
    return teamData.slice(0, 8).map((team: any) => ({
      x: team.name,
      y: team.averagePoints,
      label: team.name,
      color: TEAM_COLORS[team.id] || '#6B7280',
    }));
  }, [teamData]);
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Team Performance</h3>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <BarChart
            data={chartData}
            height={250}
            showValues={true}
            barColor="#10B981"
          />
        ) : (
          <Loading variant="skeleton" />
        )}
      </CardContent>
    </Card>
  );
}

// Position breakdown component
function PositionBreakdown() {
  const { data: positionData } = useApi('/api/players/position-breakdown');
  
  const chartData = useMemo(() => {
    if (!positionData) return [];
    
    return Object.entries(positionData).map(([position, count]) => ({
      x: position,
      y: count as number,
      label: position,
    }));
  }, [positionData]);
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Position Breakdown</h3>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={300}
            height={300}
            showLabels={true}
            showPercentages={true}
          />
        ) : (
          <Loading variant="skeleton" />
        )}
      </CardContent>
    </Card>
  );
}

// Weekly progress component
function WeeklyProgress() {
  const currentWeek = API_CONFIG.CURRENT_WEEK;
  const totalWeeks = 18;
  const progressPercentage = (currentWeek / totalWeeks) * 100;
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Season Progress</h3>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <ProgressChart
            value={currentWeek}
            max={totalWeeks}
            size={150}
            color="#10B981"
            showValue={false}
          />
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              Week {currentWeek} of {totalWeeks}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progressPercentage.toFixed(1)}% Complete
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main dashboard component
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'players', label: 'Players' },
    { id: 'teams', label: 'Teams' },
    { id: 'fantasy', label: 'Fantasy' },
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Grid cols={{ default: 1, lg: 2, xl: 3 }} gap={6}>
            <div className="xl:col-span-3">
              <QuickStats />
            </div>
            <TopPerformers />
            <UpcomingGames />
            <WeeklyProgress />
            <div className="lg:col-span-2">
              <FantasyTrends />
            </div>
            <TeamPerformance />
            <PositionBreakdown />
          </Grid>
        );
      case 'players':
        return (
          <Grid cols={{ default: 1, lg: 2 }} gap={6}>
            <TopPerformers />
            <PositionBreakdown />
          </Grid>
        );
      case 'teams':
        return (
          <Grid cols={{ default: 1, lg: 2 }} gap={6}>
            <TeamPerformance />
            <UpcomingGames />
          </Grid>
        );
      case 'fantasy':
        return (
          <Grid cols={{ default: 1, lg: 2 }} gap={6}>
            <FantasyTrends />
            <TopPerformers />
          </Grid>
        );
      default:
        return null;
    }
  };
  
  return (
    <Section title="Dashboard" subtitle="Your NFL data at a glance">
      <div className="mb-8">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
        />
      </div>
      
      {renderTabContent()}
    </Section>
  );
}
