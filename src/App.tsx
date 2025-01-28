import React, { useState } from 'react';
import { Trophy, Sword, FlaskRound, Target, Axe, Shield, Search, MapPin } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useAuth } from './hooks/useAuth';
import { signInWithDiscord } from './lib/supabase';
import type { GameMode } from './types';

function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode>('overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'NA' | 'EU'>('all');
  const { user, isAdmin } = useAuth();
  const { entries: allLeaderboardEntries, loading } = useLeaderboard(selectedMode);

  const handleDiscordLogin = async () => {
    try {
      await signInWithDiscord();
    } catch (error) {
      console.error('Failed to login with Discord:', error);
    }
  };

  const gameModeIcons = {
    overall: <Trophy className="w-6 h-6" />,
    uhc: <Sword className="w-6 h-6" />,
    pots: <FlaskRound className="w-6 h-6" />,
    netherite: <Target className="w-6 h-6" />,
    sword: <Sword className="w-6 h-6 rotate-45" />,
    axe: <Axe className="w-6 h-6" />
  };

  const gameModeLabels = {
    overall: 'Overall',
    uhc: 'UHC',
    pots: 'Pots',
    netherite: 'Netherite',
    sword: 'Sword',
    axe: 'Axe'
  };

  const filteredEntries = allLeaderboardEntries.filter(entry => {
    const matchesSearch = entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (entry.minecraft_username?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesRegion = selectedRegion === 'all' || entry.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <Router>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900 via-gray-900 to-black text-white">
        {/* Header */}
        <header className="bg-black/30 backdrop-blur-md border-b border-emerald-900/50 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-900/20 group-hover:shadow-emerald-900/40 transition-all duration-300">
                  <Sword className="w-6 h-6 text-white transform group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 text-transparent bg-clip-text">
                  MCTesting
                </h1>
              </Link>
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all duration-300"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                {!user ? (
                  <button 
                    onClick={handleDiscordLogin}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span className="font-semibold">Login with Discord</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-xl">
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.user_metadata.full_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Routes>
          <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
          <Route path="/" element={
            <main className="container mx-auto px-4 py-8">
              {/* Search and Filters */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by Discord or Minecraft username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 pl-11 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as 'all' | 'NA' | 'EU')}
                    className="bg-transparent focus:outline-none"
                  >
                    <option value="all" className="bg-gray-900">All Regions</option>
                    <option value="NA" className="bg-gray-900">North America</option>
                    <option value="EU" className="bg-gray-900">Europe</option>
                  </select>
                </div>
              </div>

              {/* Game Mode Selection */}
              <div className="flex flex-wrap gap-3 mb-8">
                {Object.entries(gameModeIcons).map(([mode, icon]) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode as GameMode)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      selectedMode === mode
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-900/20'
                        : 'bg-gray-800/50 hover:bg-gray-800/80 text-gray-300 hover:text-white'
                    }`}
                  >
                    {icon}
                    <span className="capitalize">{gameModeLabels[mode as GameMode]}</span>
                  </button>
                ))}
              </div>

              {/* Leaderboard */}
              <div className="bg-black/40 backdrop-blur-lg border border-emerald-900/30 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-blue-400 text-transparent bg-clip-text">
                  Leaderboard - {gameModeLabels[selectedMode].toUpperCase()}
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No players found matching your search criteria
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 bg-gray-800/30 p-6 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group"
                      >
                        <div className="text-2xl font-bold text-emerald-400 w-8 group-hover:scale-110 transition-transform">
                          #{index + 1}
                        </div>
                        <div className="flex-1 flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
                            <img
                              src={entry.avatar_url || `https://mc-heads.net/avatar/${entry.minecraft_username || 'steve'}`}
                              alt={entry.username}
                              className="relative w-12 h-12 rounded-xl border-2 border-emerald-500/50 group-hover:border-emerald-400 transition-colors"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              {entry.username}
                              {entry.minecraft_username && (
                                <span className="text-sm text-gray-400">
                                  (MC: {entry.minecraft_username})
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2">
                              <p className="text-emerald-400 text-sm">{entry.title}</p>
                              <span className="text-sm text-gray-400 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {entry.region}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {selectedMode !== 'overall' ? (
                            <div className="text-xl font-bold px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-700">
                              {entry.ranks[selectedMode] || 'Unranked'}
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              {Object.entries(entry.ranks).map(([mode, rank]) => (
                                <div
                                  key={mode}
                                  className="flex items-center gap-2 bg-gray-800/80 px-3 py-2 rounded-lg border border-gray-700"
                                >
                                  {gameModeIcons[mode as GameMode]}
                                  <span className="font-bold">{rank}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;