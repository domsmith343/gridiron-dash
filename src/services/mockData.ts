import type { Game, Team } from '../types/game';

// FantasyPlayer Interface (moved from FantasyFootball.tsx)
export interface FantasyPlayer {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  team: string;
  teamId: string;
  projectedPoints: number;
  actualPoints: number;
  status: 'active' | 'injured' | 'questionable' | 'out';
  stats: {
    passingYards?: number;
    passingTDs?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTDs?: number;
    receivingYards?: number;
    receivingTDs?: number;
    receptions?: number;
    fieldGoals?: number;
    extraPoints?: number;
  };
  avatarUrl?: string;
}

export const teams: Team[] = [
  {
    id: 'KC',
    name: 'Chiefs',
    abbreviation: 'KC',
    city: 'Kansas City',
    logoUrl: '/images/teams/chiefs.png',
    primaryColor: '#E31837',
    secondaryColor: '#FFB81C'
  },
  {
    id: 'SF',
    name: '49ers',
    abbreviation: 'SF',
    city: 'San Francisco',
    logoUrl: '/images/teams/49ers.png',
    primaryColor: '#AA0000',
    secondaryColor: '#B3995D'
  },
  {
    id: 'BUF',
    name: 'Bills',
    abbreviation: 'BUF',
    city: 'Buffalo',
    logoUrl: '/images/teams/bills.png',
    primaryColor: '#00338D',
    secondaryColor: '#C60C30'
  },
  {
    id: 'MIA',
    name: 'Dolphins',
    abbreviation: 'MIA',
    city: 'Miami',
    logoUrl: '/images/teams/dolphins.png',
    primaryColor: '#008E97',
    secondaryColor: '#FC4C02'
  },
  {
    id: 'PHI',
    name: 'Eagles',
    abbreviation: 'PHI',
    city: 'Philadelphia',
    logoUrl: '/images/teams/eagles.png',
    primaryColor: '#004C54',
    secondaryColor: '#A5ACAF'
  }
];

// generateMockPlayers Function (moved from FantasyFootball.tsx)
export const generateMockPlayers = (): FantasyPlayer[] => {
  const players: FantasyPlayer[] = [
    {
      id: 'p1',
      name: 'Patrick Mahomes',
      position: 'QB',
      team: 'Kansas City Chiefs',
      teamId: 'KC',
      projectedPoints: 22.5,
      actualPoints: 24.3,
      status: 'active',
      stats: {
        passingYards: 328,
        passingTDs: 3,
        interceptions: 1,
        rushingYards: 15,
        rushingTDs: 0
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=PM&background=E31837&color=fff'
    },
    {
      id: 'p2',
      name: 'Christian McCaffrey',
      position: 'RB',
      team: 'San Francisco 49ers',
      teamId: 'SF',
      projectedPoints: 18.7,
      actualPoints: 21.2,
      status: 'active',
      stats: {
        rushingYards: 102,
        rushingTDs: 1,
        receptions: 6,
        receivingYards: 52,
        receivingTDs: 1
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=CM&background=AA0000&color=fff'
    },
    {
      id: 'p3',
      name: 'Tyreek Hill',
      position: 'WR',
      team: 'Miami Dolphins',
      teamId: 'MIA',
      projectedPoints: 17.3,
      actualPoints: 19.8,
      status: 'active',
      stats: {
        receptions: 8,
        receivingYards: 138,
        receivingTDs: 1
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=TH&background=008E97&color=fff'
    },
    {
      id: 'p4',
      name: 'Travis Kelce',
      position: 'TE',
      team: 'Kansas City Chiefs',
      teamId: 'KC',
      projectedPoints: 14.2,
      actualPoints: 12.7,
      status: 'active',
      stats: {
        receptions: 7,
        receivingYards: 87,
        receivingTDs: 0
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=TK&background=E31837&color=fff'
    },
    {
      id: 'p5',
      name: 'Justin Tucker',
      position: 'K',
      team: 'Baltimore Ravens',
      teamId: 'BAL',
      projectedPoints: 8.5,
      actualPoints: 9.0,
      status: 'active',
      stats: {
        fieldGoals: 3,
        extraPoints: 3
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=JT&background=241773&color=fff'
    },
    {
      id: 'p6',
      name: 'San Francisco',
      position: 'DEF',
      team: 'San Francisco 49ers',
      teamId: 'SF',
      projectedPoints: 7.8,
      actualPoints: 12.0,
      status: 'active',
      stats: {},
      avatarUrl: 'https://ui-avatars.com/api/?name=SF&background=AA0000&color=fff'
    },
    {
      id: 'p7',
      name: 'Josh Allen',
      position: 'QB',
      team: 'Buffalo Bills',
      teamId: 'BUF',
      projectedPoints: 21.3,
      actualPoints: 26.7,
      status: 'active',
      stats: {
        passingYards: 287,
        passingTDs: 2,
        interceptions: 0,
        rushingYards: 56,
        rushingTDs: 1
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=JA&background=00338D&color=fff'
    },
    {
      id: 'p8',
      name: 'Jalen Hurts',
      position: 'QB',
      team: 'Philadelphia Eagles',
      teamId: 'PHI',
      projectedPoints: 20.5,
      actualPoints: 22.1,
      status: 'active',
      stats: {
        passingYards: 243,
        passingTDs: 1,
        interceptions: 0,
        rushingYards: 45,
        rushingTDs: 2
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=JH&background=004C54&color=fff'
    },
    {
      id: 'p9',
      name: 'A.J. Brown',
      position: 'WR',
      team: 'Philadelphia Eagles',
      teamId: 'PHI',
      projectedPoints: 15.8,
      actualPoints: 17.2,
      status: 'active',
      stats: {
        receptions: 7,
        receivingYards: 112,
        receivingTDs: 1
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=AJB&background=004C54&color=fff'
    },
    {
      id: 'p10',
      name: 'Saquon Barkley',
      position: 'RB',
      team: 'Philadelphia Eagles',
      teamId: 'PHI',
      projectedPoints: 16.5,
      actualPoints: 0, // Assuming game not played or player injured
      status: 'injured',
      stats: {
        rushingYards: 0,
        rushingTDs: 0,
        receptions: 0,
        receivingYards: 0
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=SB&background=004C54&color=fff'
    },
    {
      id: 'p11',
      name: 'Garrett Wilson',
      position: 'WR',
      team: 'New York Jets',
      teamId: 'NYJ', // Assuming NYJ is a valid teamId
      projectedPoints: 14.0,
      actualPoints: 15.5,
      status: 'active',
      stats: {
        receptions: 6,
        receivingYards: 95,
        receivingTDs: 1
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=GW&background=003F2D&color=fff'
    },
    {
      id: 'p12',
      name: 'Mark Andrews',
      position: 'TE',
      team: 'Baltimore Ravens',
      teamId: 'BAL',
      projectedPoints: 11.5,
      actualPoints: 10.2,
      status: 'active',
      stats: {
        receptions: 5,
        receivingYards: 62,
        receivingTDs: 0
      },
      avatarUrl: 'https://ui-avatars.com/api/?name=MA&background=241773&color=fff'
    }
    // Add more players as needed to have a richer dataset
  ];
  return players;
};

export const mockGames: Game[] = [
  {
    id: '1',
    homeTeam: teams[0],
    awayTeam: teams[1],
    homeScore: 25,
    awayScore: 22,
    status: 'LIVE',
    quarter: 'Q4',
    time: '2:00',
    venue: 'Arrowhead Stadium',
    weather: {
      temperature: 45,
      condition: 'Partly Cloudy',
      windSpeed: 8
    }
  },
  {
    id: '2',
    homeTeam: teams[2],
    awayTeam: teams[3],
    homeScore: 31,
    awayScore: 28,
    status: 'FINAL',
    venue: 'Highmark Stadium'
  },
  {
    id: '3',
    homeTeam: teams[1],
    awayTeam: teams[0],
    homeScore: 0,
    awayScore: 0,
    status: 'UPCOMING',
    startTime: '8:20 PM ET',
    venue: 'Levi\'s Stadium'
  },
  {
    id: '4',
    homeTeam: teams[4], // Philadelphia Eagles
    awayTeam: teams[2], // Buffalo Bills
    homeScore: 17,
    awayScore: 14,
    status: 'LIVE',
    quarter: 'Q3',
    time: '8:45',
    venue: 'Lincoln Financial Field',
    weather: {
      temperature: 62,
      condition: 'Clear',
      windSpeed: 5
    }
  }
]; 