/*
  # Initial Schema Setup for MCTesting

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `username` (text, unique) - Minecraft username
      - `avatar_url` (text) - Player avatar URL
      - `title` (text) - Player title (e.g., Combat Master)
      - `region` (text) - Player region (NA/EU)
      - `is_admin` (boolean) - Admin status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `game_ranks`
      - `id` (uuid, primary key)
      - `profile_id` (uuid) - References profiles
      - `game_mode` (text) - Game mode (uhc, pots, etc.)
      - `rank` (text) - Player rank (S+, S, A, B, C)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Profiles: Public read, authenticated user can update own profile
      - Game Ranks: Public read, admins can update
*/

-- Create custom types
CREATE TYPE game_mode_enum AS ENUM ('uhc', 'pots', 'netherite', 'sword', 'axe');
CREATE TYPE rank_enum AS ENUM ('S+', 'S', 'A', 'B', 'C');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  title text DEFAULT 'New Player',
  region text CHECK (region IN ('NA', 'EU')),
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_ranks table
CREATE TABLE IF NOT EXISTS game_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_mode game_mode_enum NOT NULL,
  rank rank_enum NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, game_mode)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_ranks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Game ranks policies
CREATE POLICY "Game ranks are viewable by everyone"
  ON game_ranks
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert game ranks"
  ON game_ranks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update game ranks"
  ON game_ranks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_ranks_updated_at
  BEFORE UPDATE ON game_ranks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();