export type GameMode = 'overall' | 'uhc' | 'pots' | 'netherite' | 'sword' | 'axe';
export type Rank = 'S+' | 'S' | 'A' | 'B' | 'C';

export interface Player {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  title: string;
  region: string;
  score: number;
  ranks: {
    uhc: Rank;
    pots: Rank;
    netherite: Rank;
    sword: Rank;
    axe: Rank;
  };
}