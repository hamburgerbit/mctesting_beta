/*
  # Add test players

  1. New Data
    - Add 5 test players with different ranks and regions
    - Create auth users first, then profiles
    - Each player has ranks for all game modes
  
  2. Players
    - ShadowBlade (Combat Master, NA)
    - DragonSlayer (Combat Master, EU)
    - PhantomWarrior (Combat Ace, NA)
    - NinjaAssassin (Combat Expert, EU)
    - StormRaider (Combat Initiate, NA)
*/

-- Create test users in auth.users
DO $$
DECLARE
    shadow_id uuid := gen_random_uuid();
    dragon_id uuid := gen_random_uuid();
    phantom_id uuid := gen_random_uuid();
    ninja_id uuid := gen_random_uuid();
    storm_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES 
        (shadow_id, 'shadowblade@test.com', 'test', NOW(), NOW(), NOW()),
        (dragon_id, 'dragonslayer@test.com', 'test', NOW(), NOW(), NOW()),
        (phantom_id, 'phantomwarrior@test.com', 'test', NOW(), NOW(), NOW()),
        (ninja_id, 'ninjaassassin@test.com', 'test', NOW(), NOW(), NOW()),
        (storm_id, 'stormraider@test.com', 'test', NOW(), NOW(), NOW());

    -- Insert profiles
    INSERT INTO profiles (id, username, title, region, avatar_url)
    VALUES 
        (shadow_id, 'ShadowBlade', 'Combat Master', 'NA', 'https://mc-heads.net/avatar/ShadowBlade'),
        (dragon_id, 'DragonSlayer', 'Combat Master', 'EU', 'https://mc-heads.net/avatar/DragonSlayer'),
        (phantom_id, 'PhantomWarrior', 'Combat Ace', 'NA', 'https://mc-heads.net/avatar/PhantomWarrior'),
        (ninja_id, 'NinjaAssassin', 'Combat Expert', 'EU', 'https://mc-heads.net/avatar/NinjaAssassin'),
        (storm_id, 'StormRaider', 'Combat Initiate', 'NA', 'https://mc-heads.net/avatar/StormRaider');

    -- Add ranks for ShadowBlade
    INSERT INTO game_ranks (profile_id, game_mode, rank)
    VALUES
        (shadow_id, 'uhc', 'S+'),
        (shadow_id, 'pots', 'S'),
        (shadow_id, 'netherite', 'S+'),
        (shadow_id, 'sword', 'S'),
        (shadow_id, 'axe', 'A');

    -- Add ranks for DragonSlayer
    INSERT INTO game_ranks (profile_id, game_mode, rank)
    VALUES
        (dragon_id, 'uhc', 'S'),
        (dragon_id, 'pots', 'S+'),
        (dragon_id, 'netherite', 'A'),
        (dragon_id, 'sword', 'S+'),
        (dragon_id, 'axe', 'S');

    -- Add ranks for PhantomWarrior
    INSERT INTO game_ranks (profile_id, game_mode, rank)
    VALUES
        (phantom_id, 'uhc', 'A'),
        (phantom_id, 'pots', 'S'),
        (phantom_id, 'netherite', 'S'),
        (phantom_id, 'sword', 'A'),
        (phantom_id, 'axe', 'S+');

    -- Add ranks for NinjaAssassin
    INSERT INTO game_ranks (profile_id, game_mode, rank)
    VALUES
        (ninja_id, 'uhc', 'B'),
        (ninja_id, 'pots', 'A'),
        (ninja_id, 'netherite', 'S'),
        (ninja_id, 'sword', 'S'),
        (ninja_id, 'axe', 'A');

    -- Add ranks for StormRaider
    INSERT INTO game_ranks (profile_id, game_mode, rank)
    VALUES
        (storm_id, 'uhc', 'C'),
        (storm_id, 'pots', 'B'),
        (storm_id, 'netherite', 'B'),
        (storm_id, 'sword', 'C'),
        (storm_id, 'axe', 'B');
END $$;