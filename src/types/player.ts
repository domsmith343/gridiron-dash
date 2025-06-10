export interface PlayerStats {
  passingYards?: number;
  touchdowns?: number;
  interceptions?: number;
  receptions?: number;
  receivingYards?: number;
  rushingYards?: number;
  rushingTDs?: number;
  sacks?: number;
  tackles?: number;
  forcedFumbles?: number;
  fieldGoals?: number;
  extraPoints?: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  jersey?: string;
  photoUrl?: string;
  stats: PlayerStats;
}

export interface FantasyPlayer {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  team: string;
  teamId: string;
  projectedPoints: number;
  actualPoints: number;
  status: 'active' | 'injured' | 'questionable' | 'out';
  stats: PlayerStats;
  avatarUrl?: string;
}

export interface PlayerGameStats {
  game: string;
  opponent: string;
  date: string;
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  fieldGoals?: number;
  extraPoints?: number;
  fantasyPoints: number;
}

export interface PlayerTrend {
  category: string;
  data: number[];
  color: string;
}
