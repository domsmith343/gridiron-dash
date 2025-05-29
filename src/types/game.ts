export type GameStatus = 'LIVE' | 'FINAL' | 'UPCOMING' | 'POSTPONED' | 'SCHEDULED';

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city?: string;
  logoUrl?: string;
  logo?: string; // For backward compatibility
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
  gameStatus?: GameStatus; // For backward compatibility
  time?: string;
  quarter?: string;
  timeRemaining?: string;
  startTime?: string;
  gameTime?: string;
  venue?: string;
  stadium?: string; // Alternative name for venue
  channel?: string; // Broadcast channel
  possession?: string; // Team ID that has possession
  redZone?: boolean; // Whether the team with possession is in the red zone
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