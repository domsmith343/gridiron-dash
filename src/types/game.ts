export type GameStatus = 'LIVE' | 'FINAL' | 'UPCOMING' | 'POSTPONED';

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: GameStatus;
  time?: string;
  quarter?: string;
  startTime?: string;
  venue?: string;
  weather?: {
    temperature: number;
    condition: string;
    windSpeed: number;
  };
}

export interface GameStats {
  homeTeam: {
    totalYards: number;
    passingYards: number;
    rushingYards: number;
    turnovers: number;
    timeOfPossession: string;
  };
  awayTeam: {
    totalYards: number;
    passingYards: number;
    rushingYards: number;
    turnovers: number;
    timeOfPossession: string;
  };
} 