import type { Game, Team } from '../types/game';

export const teams: Team[] = [
  {
    id: 'KC',
    name: 'Chiefs',
    abbreviation: 'KC',
    city: 'Kansas City',
    logo: '/images/teams/chiefs.png',
    primaryColor: '#E31837',
    secondaryColor: '#FFB81C'
  },
  {
    id: 'SF',
    name: '49ers',
    abbreviation: 'SF',
    city: 'San Francisco',
    logo: '/images/teams/49ers.png',
    primaryColor: '#AA0000',
    secondaryColor: '#B3995D'
  },
  {
    id: 'BUF',
    name: 'Bills',
    abbreviation: 'BUF',
    city: 'Buffalo',
    logo: '/images/teams/bills.png',
    primaryColor: '#00338D',
    secondaryColor: '#C60C30'
  },
  {
    id: 'MIA',
    name: 'Dolphins',
    abbreviation: 'MIA',
    city: 'Miami',
    logo: '/images/teams/dolphins.png',
    primaryColor: '#008E97',
    secondaryColor: '#FC4C02'
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
  }
]; 