'use client'

// Supabase Setup & Configuration Helper
export const SUPABASE_SETUP = {
  // Environment Variables Required
  requiredEnvVars: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ],
  
  // Database Schema SQL for Supabase
  createTablesSQL: `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE character_style AS ENUM ('classic', 'punk', 'metal', 'indie', 'electronic');
CREATE TYPE instrument_role AS ENUM (
  'singer', 'guitarist', 'bassist', 'drummer', 'keyboardist', 
  'violinist', 'saxophonist', 'trumpeter', 'flautist', 'cellist', 
  'pianist', 'harmonica_player', 'djay_producer'
);
CREATE TYPE tournament_status AS ENUM ('upcoming', 'registration_open', 'in_progress', 'completed');
CREATE TYPE battle_status AS ENUM ('scheduled', 'in_progress', 'completed');

-- Players table
CREATE TABLE players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    profile_picture TEXT,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    total_earnings BIGINT DEFAULT 0,
    rock_tokens INTEGER DEFAULT 2000,
    character_style character_style DEFAULT 'classic',
    character_color VARCHAR(20) DEFAULT '#B45309',
    character_accessories TEXT[] DEFAULT '{}',
    primary_instrument instrument_role NOT NULL,
    current_instrument VARCHAR(100),
    instruments_owned TEXT[] DEFAULT ARRAY['acoustic_guitar'],
    solo_career_stage INTEGER DEFAULT 1,
    total_solo_performances INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bands table  
CREATE TABLE bands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES players(id) ON DELETE CASCADE,
    creation_cost INTEGER DEFAULT 1000,
    total_power INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    rock_tokens_earned BIGINT DEFAULT 0,
    band_logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Band members table
CREATE TABLE band_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    role instrument_role NOT NULL,
    power_contribution INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(band_id, player_id)
);

-- Solo stages table (pre-populated data)
CREATE TABLE solo_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stage_number INTEGER UNIQUE NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    required_level INTEGER DEFAULT 1,
    base_earnings INTEGER DEFAULT 50,
    instrument_reward VARCHAR(100),
    location VARCHAR(100),
    description TEXT
);

-- Solo performances table
CREATE TABLE solo_performances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES solo_stages(id),
    earnings INTEGER DEFAULT 0,
    experience_gained INTEGER DEFAULT 0,
    performance_quality INTEGER DEFAULT 0,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    entry_fee INTEGER DEFAULT 500,
    total_prize_pool BIGINT DEFAULT 0,
    max_participants INTEGER DEFAULT 32,
    current_participants INTEGER DEFAULT 0,
    status tournament_status DEFAULT 'upcoming',
    week_number INTEGER NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    winner_band_id UUID REFERENCES bands(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament registrations table
CREATE TABLE tournament_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
    entry_fee_paid INTEGER DEFAULT 0,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    final_score INTEGER,
    final_rank INTEGER,
    UNIQUE(tournament_id, band_id)
);

-- Battles table
CREATE TABLE battles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id),
    band_a_id UUID REFERENCES bands(id) ON DELETE CASCADE,
    band_b_id UUID REFERENCES bands(id) ON DELETE CASCADE,
    band_a_score INTEGER DEFAULT 0,
    band_b_score INTEGER DEFAULT 0,
    winner_band_id UUID REFERENCES bands(id),
    entry_fee_total INTEGER DEFAULT 0,
    prize_distributed BIGINT DEFAULT 0,
    status battle_status DEFAULT 'scheduled',
    battle_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Insert default solo stages
INSERT INTO solo_stages (stage_number, stage_name, required_level, base_earnings, instrument_reward, location, description) VALUES
(1, 'Street Corner', 1, 50, NULL, 'Downtown', 'Start your music career by playing for passersby'),
(2, 'Coffee Shop', 3, 100, 'acoustic_guitar', 'Arts District', 'Intimate performances for coffee lovers'),
(3, 'Local Bar', 5, 200, NULL, 'Music Quarter', 'Play for a crowd that knows good music'),
(4, 'Underground Club', 8, 350, 'electric_guitar', 'Underground Scene', 'Raw energy and underground vibes'),
(5, 'Music Festival', 12, 600, 'vintage_microphone', 'Festival Grounds', 'Perform for thousands of music fans'),
(6, 'Concert Hall', 15, 1000, NULL, 'Cultural Center', 'Classical venue with perfect acoustics'),
(7, 'Arena', 20, 1500, 'synthesizer', 'Sports & Entertainment Complex', 'Big stage, big lights, big crowd'),
(8, 'Stadium', 25, 2500, 'legendary_guitar', 'Mega Stadium', 'The ultimate venue - rock legend status!');

-- Create indexes for performance
CREATE INDEX idx_players_wallet ON players(wallet_address);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_band_members_band ON band_members(band_id);
CREATE INDEX idx_band_members_player ON band_members(player_id);
CREATE INDEX idx_battles_tournament ON battles(tournament_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_solo_performances_player ON solo_performances(player_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE solo_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Public read access for tournaments and solo_stages
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read solo_stages" ON solo_stages FOR SELECT USING (true);

-- Players can read their own data and public info
CREATE POLICY "Players can read own data" ON players FOR SELECT USING (true);
CREATE POLICY "Players can update own data" ON players FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Bands are publicly readable, manageable by leaders
CREATE POLICY "Public read bands" ON bands FOR SELECT USING (true);
CREATE POLICY "Band leaders can manage" ON bands FOR ALL USING (auth.uid()::text = (SELECT wallet_address FROM players WHERE id = leader_id));

-- Band members are publicly readable
CREATE POLICY "Public read band_members" ON band_members FOR SELECT USING (true);
CREATE POLICY "Players can join bands" ON band_members FOR INSERT WITH CHECK (auth.uid()::text = (SELECT wallet_address FROM players WHERE id = player_id));

-- Solo performances belong to players
CREATE POLICY "Players can manage own performances" ON solo_performances FOR ALL USING (auth.uid()::text = (SELECT wallet_address FROM players WHERE id = player_id));

-- Tournament registrations
CREATE POLICY "Public read registrations" ON tournament_registrations FOR SELECT USING (true);
CREATE POLICY "Players can register bands" ON tournament_registrations FOR INSERT WITH CHECK (
  auth.uid()::text = (SELECT p.wallet_address FROM players p JOIN bands b ON p.id = b.leader_id WHERE b.id = band_id)
);

-- Battles are publicly readable
CREATE POLICY "Public read battles" ON battles FOR SELECT USING (true);
`,

  // Setup Instructions
  instructions: `
🚀 SUPABASE SETUP INSTRUCTIONS

1. **Create Supabase Project:**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Choose organization and set project name: "rock-legends-game"
   - Generate strong password and select region

2. **Configure Environment Variables:**
   Add these to your project settings or .env.local:
   
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

3. **Run Database Schema:**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"
   - Paste and run the SQL schema provided above
   - This will create all tables, indexes, and policies

4. **Verify Setup:**
   - Check "Table Editor" to see all tables created
   - Test connection by trying to create a character in the app

5. **Optional - Enable Realtime:**
   - Go to "Database" → "Replication"  
   - Enable realtime for: battles, tournaments, band_members
   - This enables live updates during battles

🎸 Your Rock Legends database is ready to rock!
`
}

// Database helper functions
export const setupSupabase = async () => {
  const missing = SUPABASE_SETUP.requiredEnvVars.filter(
    env => !process.env[env] || process.env[env]?.includes('placeholder')
  )
  
  if (missing.length > 0) {
    console.warn('Missing Supabase environment variables:', missing)
    console.log('\n' + SUPABASE_SETUP.instructions)
    return false
  }
  
  return true
}

export { SUPABASE_SETUP as default }
