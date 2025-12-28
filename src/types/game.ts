import type { InstrumentRole } from '@/types/instruments'

export interface Player {
  id: string
  wallet_address: string
  username: string
  profile_picture: string | null
  level: number
  experience: number
  total_earnings: number
  rock_tokens: number
  character_style: CharacterStyle
  character_color: string
  character_accessories: string[]
  primary_instrument: InstrumentRole
  current_instrument: string | null
  instruments_owned: string[]
  solo_career_stage: number
  total_solo_performances: number
  created_at: string
  updated_at: string
}

export interface Band {
  id: string
  name: string
  description: string | null
  leader_id: string
  creation_cost: number
  total_power: number
  total_wins: number
  total_losses: number
  rock_tokens_earned: number
  band_logo: string | null
  max_singers: number
  max_drummers: number
  max_guitarists: number
  current_singers: number
  current_drummers: number
  current_guitarists: number
  created_at: string
  updated_at: string
}

export interface BandMember {
  id: string
  band_id: string
  player_id: string
  role: InstrumentRole
  power_contribution: number
  joined_at: string
}

export interface SoloStage {
  id: string
  stage_number: number
  stage_name: string
  required_level: number
  base_earnings: number
  instrument_reward: string | null
  location: string
  description: string
}

export interface Tournament {
  id: string
  name: string
  entry_fee: number
  total_prize_pool: number
  max_participants: number
  current_participants: number
  status: TournamentStatus
  week_number: number
  starts_at: string
  ends_at: string
  winner_band_id: string | null
  created_at: string
  updated_at: string
}

export interface Battle {
  id: string
  tournament_id: string | null
  band_a_id: string
  band_b_id: string
  band_a_score: number
  band_b_score: number
  winner_band_id: string | null
  entry_fee_total: number
  prize_distributed: number
  status: BattleStatus
  battle_data: Record<string, any> | null
  created_at: string
  completed_at: string | null
}

export type CharacterStyle = 'classic' | 'punk' | 'metal' | 'indie' | 'electronic'
export type TournamentStatus = 'upcoming' | 'registration_open' | 'in_progress' | 'completed'
export type BattleStatus = 'scheduled' | 'in_progress' | 'completed'

export interface Instrument {
  id: string
  name: string
  type: 'guitar' | 'bass' | 'drums' | 'microphone' | 'keyboard' | 'synthesizer'
  power_boost: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  price: number
  description: string
  character_styles: CharacterStyle[]
}

export interface CharacterCustomization {
  style: CharacterStyle
  color: string
  accessories: string[]
  primaryInstrument: InstrumentRole
  personality?: string
  backstory?: string
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'acoustic_guitar',
    name: 'Acoustic Guitar',
    type: 'guitar',
    power_boost: 10,
    rarity: 'common',
    price: 0,
    description: 'A basic acoustic guitar for beginners',
    character_styles: ['classic', 'indie']
  },
  {
    id: 'electric_guitar',
    name: 'Electric Guitar',
    type: 'guitar',
    power_boost: 25,
    rarity: 'rare',
    price: 500,
    description: 'A powerful electric guitar for rock performances',
    character_styles: ['punk', 'metal', 'classic']
  },
  {
    id: 'bass_guitar',
    name: 'Bass Guitar',
    type: 'bass',
    power_boost: 20,
    rarity: 'rare',
    price: 400,
    description: 'Deep bass tones for the rhythm section',
    character_styles: ['punk', 'metal', 'indie']
  },
  {
    id: 'drum_kit_basic',
    name: 'Basic Drum Kit',
    type: 'drums',
    power_boost: 15,
    rarity: 'common',
    price: 0,
    description: 'A standard drum kit for keeping the beat',
    character_styles: ['classic', 'punk', 'metal', 'indie']
  },
  {
    id: 'drum_kit_pro',
    name: 'Professional Drum Kit',
    type: 'drums',
    power_boost: 40,
    rarity: 'epic',
    price: 1200,
    description: 'High-end drums for powerful performances',
    character_styles: ['metal', 'punk']
  },
  {
    id: 'vintage_microphone',
    name: 'Vintage Microphone',
    type: 'microphone',
    power_boost: 30,
    rarity: 'rare',
    price: 600,
    description: 'A classic microphone with warm tone',
    character_styles: ['classic', 'indie']
  },
  {
    id: 'synthesizer',
    name: 'Digital Synthesizer',
    type: 'synthesizer',
    power_boost: 35,
    rarity: 'epic',
    price: 1000,
    description: 'Modern electronic sounds and effects',
    character_styles: ['electronic', 'indie']
  },
  {
    id: 'legendary_guitar',
    name: 'Lightning Axe',
    type: 'guitar',
    power_boost: 60,
    rarity: 'legendary',
    price: 2500,
    description: 'A legendary guitar that sparks with electric energy',
    character_styles: ['metal', 'punk', 'electronic']
  }
]

export const SOLO_STAGES: SoloStage[] = [
  {
    id: 'stage_1',
    stage_number: 1,
    stage_name: 'Street Corner',
    required_level: 1,
    base_earnings: 50,
    instrument_reward: null,
    location: 'Downtown',
    description: 'Start your music career by playing for passersby'
  },
  {
    id: 'stage_2',
    stage_number: 2,
    stage_name: 'Coffee Shop',
    required_level: 3,
    base_earnings: 100,
    instrument_reward: 'acoustic_guitar',
    location: 'Arts District',
    description: 'Intimate performances for coffee lovers'
  },
  {
    id: 'stage_3',
    stage_number: 3,
    stage_name: 'Local Bar',
    required_level: 5,
    base_earnings: 200,
    instrument_reward: null,
    location: 'Music Quarter',
    description: 'Play for a crowd that knows good music'
  },
  {
    id: 'stage_4',
    stage_number: 4,
    stage_name: 'Underground Club',
    required_level: 8,
    base_earnings: 350,
    instrument_reward: 'electric_guitar',
    location: 'Underground Scene',
    description: 'Raw energy and underground vibes'
  },
  {
    id: 'stage_5',
    stage_number: 5,
    stage_name: 'Music Festival',
    required_level: 12,
    base_earnings: 600,
    instrument_reward: 'vintage_microphone',
    location: 'Festival Grounds',
    description: 'Perform for thousands of music fans'
  },
  {
    id: 'stage_6',
    stage_number: 6,
    stage_name: 'Concert Hall',
    required_level: 15,
    base_earnings: 1000,
    instrument_reward: null,
    location: 'Cultural Center',
    description: 'Classical venue with perfect acoustics'
  },
  {
    id: 'stage_7',
    stage_number: 7,
    stage_name: 'Arena',
    required_level: 20,
    base_earnings: 1500,
    instrument_reward: 'synthesizer',
    location: 'Sports & Entertainment Complex',
    description: 'Big stage, big lights, big crowd'
  },
  {
    id: 'stage_8',
    stage_number: 8,
    stage_name: 'Stadium',
    required_level: 25,
    base_earnings: 2500,
    instrument_reward: 'legendary_guitar',
    location: 'Mega Stadium',
    description: 'The ultimate venue - rock legend status!'
  }
]

export const CHARACTER_STYLES: Record<CharacterStyle, {
  name: string
  description: string
  colors: string[]
  accessories: string[]
  personality: string
}> = {
  classic: {
    name: 'Classic Rock',
    description: 'Timeless rock style with vintage appeal',
    colors: ['#B45309', '#DC2626', '#1F2937', '#6B7280'],
    accessories: ['leather_jacket', 'sunglasses', 'bandana', 'vintage_watch'],
    personality: 'Confident and charismatic with old-school charm'
  },
  punk: {
    name: 'Punk Rock',
    description: 'Rebellious attitude with aggressive style',
    colors: ['#DC2626', '#000000', '#7C2D12', '#991B1B'],
    accessories: ['spike_bracelet', 'safety_pins', 'torn_jeans', 'combat_boots'],
    personality: 'Rebellious and energetic with raw authenticity'
  },
  metal: {
    name: 'Heavy Metal',
    description: 'Dark and powerful with metal edge',
    colors: ['#000000', '#374151', '#7C2D12', '#450A0A'],
    accessories: ['chain_necklace', 'skull_ring', 'leather_gloves', 'metal_studs'],
    personality: 'Intense and powerful with commanding presence'
  },
  indie: {
    name: 'Indie Alternative',
    description: 'Creative and artistic independent style',
    colors: ['#059669', '#7C3AED', '#DC2626', '#F59E0B'],
    accessories: ['vintage_glasses', 'scarf', 'beanie', 'acoustic_pick'],
    personality: 'Creative and thoughtful with artistic vision'
  },
  electronic: {
    name: 'Electronic/EDM',
    description: 'Futuristic style with digital edge',
    colors: ['#06B6D4', '#8B5CF6', '#EC4899', '#10B981'],
    accessories: ['led_headphones', 'neon_bracelet', 'tech_gloves', 'holographic_shirt'],
    personality: 'Innovative and tech-savvy with futuristic vision'
  }
}

export const ROCK_TOKEN_RATES = {
  BAND_CREATION_COST: 1000,
  TOURNAMENT_ENTRY_BASE: 500,
  SOLO_PERFORMANCE_RATE: 10, // tokens per 100 earnings
  BATTLE_ENTRY_FEE: 200,
  WEEKLY_TOURNAMENT_PRIZE: 5000
}
