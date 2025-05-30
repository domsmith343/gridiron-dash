import type { Game, Team } from '../types/game';

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