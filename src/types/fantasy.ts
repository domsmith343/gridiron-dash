import type { FantasyPlayer } from './player';

export interface FantasyTeam {
  id: string;
  name: string;
  qb: FantasyPlayer[];
  rb: FantasyPlayer[];
  wr: FantasyPlayer[];
  te: FantasyPlayer[];
  k: FantasyPlayer[];
  def: FantasyPlayer[];
  bench: FantasyPlayer[];
  totalPoints: number;
  projectedPoints: number;
}

export interface FantasyMatchup {
  id: string;
  week: number;
  opponent: string;
  opponentTeam: FantasyTeam;
  myTeam: FantasyTeam;
  status: 'upcoming' | 'live' | 'completed';
  projectedScore: {
    me: number;
    opponent: number;
  };
  actualScore: {
    me: number;
    opponent: number;
  };
}
