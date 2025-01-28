import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { GameMode } from '../types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type GameRank = Database['public']['Tables']['game_ranks']['Row'];

interface LeaderboardEntry extends Profile {
  ranks: Record<GameMode, string>;
}

export function useLeaderboard(mode: GameMode = 'overall') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        // Get all profiles and their game ranks
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            game_ranks (
              game_mode,
              rank
            )
          `);

        if (profileError) throw profileError;

        // Transform the data into leaderboard entries
        const transformedData = data.map((profile) => {
          const ranks = (profile.game_ranks as GameRank[]).reduce(
            (acc, { game_mode, rank }) => ({
              ...acc,
              [game_mode]: rank,
            }),
            {} as Record<GameMode, string>
          );

          return {
            ...profile,
            ranks,
          };
        });

        // Sort based on ranks if specific mode, or overall score
        const sortedData = mode === 'overall'
          ? transformedData.sort((a, b) => calculateOverallScore(b.ranks) - calculateOverallScore(a.ranks))
          : transformedData.sort((a, b) => rankToScore(b.ranks[mode]) - rankToScore(a.ranks[mode]));

        setEntries(sortedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [mode]);

  return { entries, loading, error };
}

function rankToScore(rank: string): number {
  const scores: Record<string, number> = {
    'S+': 5,
    'S': 4,
    'A': 3,
    'B': 2,
    'C': 1,
  };
  return scores[rank] || 0;
}

function calculateOverallScore(ranks: Record<GameMode, string>): number {
  return Object.values(ranks).reduce((sum, rank) => sum + rankToScore(rank), 0);
}