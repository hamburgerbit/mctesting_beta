/*
  # Add Minecraft username support

  1. Changes
    - Add `minecraft_username` column to profiles table
    - Make `username` non-unique (since it will now be Discord username)
    - Add unique constraint to `minecraft_username`
  
  2. Security
    - Maintain existing RLS policies
*/

-- Remove unique constraint from username
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Add minecraft_username column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS minecraft_username text UNIQUE;

-- Add index for minecraft username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_minecraft_username
ON profiles(minecraft_username);