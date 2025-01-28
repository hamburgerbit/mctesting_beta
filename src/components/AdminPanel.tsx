import React, { useState } from 'react';
import { Search, Save, X, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { GameMode, Rank } from '../types';

interface PlayerRankUpdate {
  playerId: string;
  gameMode: GameMode;
  rank: Rank;
}

const AdminPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [rankUpdates, setRankUpdates] = useState<PlayerRankUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minecraftUsername, setMinecraftUsername] = useState('');

  const gameModes: GameMode[] = ['uhc', 'pots', 'netherite', 'sword', 'axe'];
  const ranks: Rank[] = ['S+', 'S', 'A', 'B', 'C'];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          game_ranks (
            game_mode,
            rank
          )
        `)
        .or(`username.ilike.%${searchQuery}%,minecraft_username.ilike.%${searchQuery}%`)
        .single();

      if (error) throw error;
      setSelectedPlayer(data);
      setMinecraftUsername(data.minecraft_username || '');
    } catch (err) {
      console.error('Error searching player:', err);
      setError('Player not found');
    }
  };

  const handleRankChange = (gameMode: GameMode, rank: Rank) => {
    setRankUpdates(prev => [
      ...prev.filter(update => update.gameMode !== gameMode),
      { playerId: selectedPlayer.id, gameMode, rank }
    ]);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // Update Minecraft username if changed
      if (minecraftUsername !== selectedPlayer.minecraft_username) {
        const { error: usernameError } = await supabase
          .from('profiles')
          .update({ minecraft_username: minecraftUsername || null })
          .eq('id', selectedPlayer.id);

        if (usernameError) throw usernameError;
      }

      // Update ranks
      if (rankUpdates.length > 0) {
        const { error } = await supabase
          .from('game_ranks')
          .upsert(
            rankUpdates.map(update => ({
              profile_id: update.playerId,
              game_mode: update.gameMode,
              rank: update.rank
            }))
          );

        if (error) throw error;
      }
      
      // Refresh player data
      const { data, error: refreshError } = await supabase
        .from('profiles')
        .select(`
          *,
          game_ranks (
            game_mode,
            rank
          )
        `)
        .eq('id', selectedPlayer.id)
        .single();

      if (refreshError) throw refreshError;
      
      setSelectedPlayer(data);
      setRankUpdates([]);
      setError(null);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel - Player Management</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        {/* Search Bar */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by Discord or Minecraft username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {/* Player Info and Rank Management */}
        {selectedPlayer && (
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPlayer.avatar_url || `https://mc-heads.net/avatar/${selectedPlayer.minecraft_username || 'steve'}`}
                  alt={selectedPlayer.username}
                  className="w-16 h-16 rounded-xl border-2 border-gray-700"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{selectedPlayer.username}</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Minecraft Username"
                      value={minecraftUsername}
                      onChange={(e) => setMinecraftUsername(e.target.value)}
                      className="bg-gray-700/50 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-emerald-400">{selectedPlayer.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rank Selection Grid */}
            <div className="grid gap-6">
              {gameModes.map(mode => (
                <div key={mode} className="flex items-center gap-4">
                  <span className="w-24 font-medium capitalize">
                    {mode === 'uhc' ? 'UHC' : mode}
                  </span>
                  <div className="flex gap-2">
                    {ranks.map(rank => {
                      const isSelected = rankUpdates.some(
                        update => update.gameMode === mode && update.rank === rank
                      ) || (!rankUpdates.some(update => update.gameMode === mode) && 
                           selectedPlayer.game_ranks?.some((r: any) => r.game_mode === mode && r.rank === rank));
                      return (
                        <button
                          key={rank}
                          onClick={() => handleRankChange(mode, rank)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-700/50 hover:bg-gray-700'
                          }`}
                        >
                          {rank}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Changes */}
            {(rankUpdates.length > 0 || minecraftUsername !== selectedPlayer.minecraft_username) && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;