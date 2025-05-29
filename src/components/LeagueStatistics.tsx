import React, { useEffect, useState } from 'react';
import styles from './LeagueStatistics.module.css';

interface StatLeader {
  player: string;
  team: string;
  value: number | string;
  change?: 'up' | 'down' | 'none';
}

interface TeamStat {
  team: string;
  abbreviation: string;
  value: number | string;
  change?: 'up' | 'down' | 'none';
}

interface LeagueStatisticsProps {
  category?: 'offense' | 'defense' | 'players' | 'all';
}

export const LeagueStatistics: React.FC<LeagueStatisticsProps> = ({ 
  category = 'all' 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>(category);
  const [teamStats, setTeamStats] = useState<{[key: string]: TeamStat[]}>({});
  const [playerStats, setPlayerStats] = useState<{[key: string]: StatLeader[]}>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Mock data
        const mockTeamStats = {
          offense: [
            { team: 'Kansas City Chiefs', abbreviation: 'KC', value: 29.2, change: 'up' as const },
            { team: 'Buffalo Bills', abbreviation: 'BUF', value: 28.4, change: 'down' as const },
            { team: 'San Francisco 49ers', abbreviation: 'SF', value: 27.6, change: 'up' as const },
            { team: 'Miami Dolphins', abbreviation: 'MIA', value: 26.7, change: 'none' as const }
          ],
          defense: [
            { team: 'San Francisco 49ers', abbreviation: 'SF', value: 15.7, change: 'up' as const },
            { team: 'Baltimore Ravens', abbreviation: 'BAL', value: 16.5, change: 'up' as const },
            { team: 'Pittsburgh Steelers', abbreviation: 'PIT', value: 18.2, change: 'down' as const },
            { team: 'Cleveland Browns', abbreviation: 'CLE', value: 19.0, change: 'none' as const }
          ]
        };
        
        const mockPlayerStats = {
          passing: [
            { player: 'Patrick Mahomes', team: 'KC', value: '4,183 yds', change: 'up' as const },
            { player: 'Josh Allen', team: 'BUF', value: '3,947 yds', change: 'up' as const },
            { player: 'Lamar Jackson', team: 'BAL', value: '3,678 yds', change: 'down' as const },
            { player: 'Joe Burrow', team: 'CIN', value: '3,502 yds', change: 'none' as const }
          ],
          rushing: [
            { player: 'Christian McCaffrey', team: 'SF', value: '1,459 yds', change: 'up' as const },
            { player: 'Derrick Henry', team: 'BAL', value: '1,167 yds', change: 'down' as const },
            { player: 'Saquon Barkley', team: 'PHI', value: '1,055 yds', change: 'up' as const },
            { player: 'Kyren Williams', team: 'LAR', value: '953 yds', change: 'none' as const }
          ],
          receiving: [
            { player: 'CeeDee Lamb', team: 'DAL', value: '1,749 yds', change: 'up' as const },
            { player: 'Tyreek Hill', team: 'MIA', value: '1,717 yds', change: 'down' as const },
            { player: 'Ja\'Marr Chase', team: 'CIN', value: '1,216 yds', change: 'none' as const },
            { player: 'Amon-Ra St. Brown', team: 'DET', value: '1,515 yds', change: 'up' as const }
          ]
        };
        
        setTeamStats(mockTeamStats);
        setPlayerStats(mockPlayerStats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const renderChangeIndicator = (change?: 'up' | 'down' | 'none') => {
    if (change === 'up') {
      return <span className={styles.trendUp}>↑</span>;
    } else if (change === 'down') {
      return <span className={styles.trendDown}>↓</span>;
    }
    return null;
  };

  const renderTeamStats = (statType: string) => {
    const stats = teamStats[statType] || [];
    
    return (
      <div className={styles.statsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.teamColumn}>Team</div>
          <div className={styles.valueColumn}>
            {statType === 'offense' ? 'Points/Game' : 'Points Allowed/Game'}
          </div>
        </div>
        {stats.map((stat, index) => (
          <div key={index} className={styles.tableRow}>
            <div className={styles.teamColumn}>
              <span className={styles.teamAbbr}>{stat.abbreviation}</span>
              <span className={styles.teamName}>{stat.team}</span>
            </div>
            <div className={styles.valueColumn}>
              {stat.value} {renderChangeIndicator(stat.change)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPlayerStats = (statType: string) => {
    const stats = playerStats[statType] || [];
    
    return (
      <div className={styles.statsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.playerColumn}>Player</div>
          <div className={styles.valueColumn}>
            {statType === 'passing' ? 'Passing Yards' : 
             statType === 'rushing' ? 'Rushing Yards' : 'Receiving Yards'}
          </div>
        </div>
        {stats.map((stat, index) => (
          <div key={index} className={styles.tableRow}>
            <div className={styles.playerColumn}>
              <span className={styles.playerName}>{stat.player}</span>
              <span className={styles.playerTeam}>{stat.team}</span>
            </div>
            <div className={styles.valueColumn}>
              {stat.value} {renderChangeIndicator(stat.change)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className={styles.statisticsContainer}>
      <div className={styles.tabsContainer} role="tablist" aria-label="Statistics Categories">
        <button 
          className={`${styles.tab} ${activeTab === 'offense' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('offense')}
          aria-selected="true"
          role="tab"
          id="tab-offense"
          aria-controls="panel-offense"
          tabIndex={activeTab === 'offense' ? 0 : -1}
        >
          Offense
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'defense' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('defense')}
          aria-selected="false"
          role="tab"
          id="tab-defense"
          aria-controls="panel-defense"
          tabIndex={activeTab === 'defense' ? 0 : -1}
        >
          Defense
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'passing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('passing')}
          aria-selected="false"
          role="tab"
          id="tab-passing"
          aria-controls="panel-passing"
          tabIndex={activeTab === 'passing' ? 0 : -1}
        >
          Passing
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'rushing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('rushing')}
          aria-selected="false"
          role="tab"
          id="tab-rushing"
          aria-controls="panel-rushing"
          tabIndex={activeTab === 'rushing' ? 0 : -1}
        >
          Rushing
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'receiving' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('receiving')}
          aria-selected="false"
          role="tab"
          id="tab-receiving"
          aria-controls="panel-receiving"
          tabIndex={activeTab === 'receiving' ? 0 : -1}
        >
          Receiving
        </button>
      </div>
      
      <div className={styles.statsContent}>
        <div 
          role="tabpanel" 
          id="panel-offense" 
          aria-labelledby="tab-offense"
          hidden={activeTab !== 'offense'}
        >
          {renderTeamStats('offense')}
        </div>
        
        <div 
          role="tabpanel" 
          id="panel-defense" 
          aria-labelledby="tab-defense"
          hidden={activeTab !== 'defense'}
        >
          {renderTeamStats('defense')}
        </div>
        
        <div 
          role="tabpanel" 
          id="panel-passing" 
          aria-labelledby="tab-passing"
          hidden={activeTab !== 'passing'}
        >
          {renderPlayerStats('passing')}
        </div>
        
        <div 
          role="tabpanel" 
          id="panel-rushing" 
          aria-labelledby="tab-rushing"
          hidden={activeTab !== 'rushing'}
        >
          {renderPlayerStats('rushing')}
        </div>
        
        <div 
          role="tabpanel" 
          id="panel-receiving" 
          aria-labelledby="tab-receiving"
          hidden={activeTab !== 'receiving'}
        >
          {renderPlayerStats('receiving')}
        </div>
      </div>
    </div>
  );
};

export default LeagueStatistics;
