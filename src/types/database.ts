export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          wallet_address: string
          username: string
          profile_picture: string | null
          level: number
          experience: number
          total_earnings: number
          rock_tokens: number
          character_style: 'classic' | 'punk' | 'metal' | 'indie' | 'electronic'
          primary_instrument: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
          character_color: string
          character_accessories: string[]
          current_instrument: string | null
          instruments_owned: string[]
          solo_career_stage: number
          total_solo_performances: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username: string
          profile_picture?: string | null
          level?: number
          experience?: number
          total_earnings?: number
          rock_tokens?: number
          character_style?: 'classic' | 'punk' | 'metal' | 'indie' | 'electronic'
          primary_instrument?: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
          character_color?: string
          character_accessories?: string[]
          current_instrument?: string | null
          instruments_owned?: string[]
          solo_career_stage?: number
          total_solo_performances?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          wallet_address?: string
          username?: string
          profile_picture?: string | null
          level?: number
          experience?: number
          total_earnings?: number
          rock_tokens?: number
          character_style?: 'classic' | 'punk' | 'metal' | 'indie' | 'electronic'
          primary_instrument?: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
          character_color?: string
          character_accessories?: string[]
          current_instrument?: string | null
          instruments_owned?: string[]
          solo_career_stage?: number
          total_solo_performances?: number
          updated_at?: string
        }
      }
      bands: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          description?: string | null
          leader_id: string
          creation_cost?: number
          total_power?: number
          total_wins?: number
          total_losses?: number
          rock_tokens_earned?: number
          band_logo?: string | null
          max_singers?: number
          max_drummers?: number
          max_guitarists?: number
          current_singers?: number
          current_drummers?: number
          current_guitarists?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          leader_id?: string
          creation_cost?: number
          total_power?: number
          total_wins?: number
          total_losses?: number
          rock_tokens_earned?: number
          band_logo?: string | null
          current_singers?: number
          current_drummers?: number
          current_guitarists?: number
          updated_at?: string
        }
      }
      band_members: {
        Row: {
          id: string
          band_id: string
          player_id: string
          role: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
          power_contribution: number
          joined_at: string
        }
        Insert: {
          id?: string
          band_id: string
          player_id: string
          role: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
          power_contribution?: number
          joined_at?: string
        }
        Update: {
          role?: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
          power_contribution?: number
        }
      }
      solo_stages: {
        Row: {
          id: string
          stage_number: number
          stage_name: string
          required_level: number
          base_earnings: number
          instrument_reward: string | null
          location: string
          description: string
        }
        Insert: {
          id?: string
          stage_number: number
          stage_name: string
          required_level?: number
          base_earnings?: number
          instrument_reward?: string | null
          location?: string
          description?: string
        }
        Update: {
          stage_name?: string
          required_level?: number
          base_earnings?: number
          instrument_reward?: string | null
          location?: string
          description?: string
        }
      }
      solo_performances: {
        Row: {
          id: string
          player_id: string
          stage_id: string
          earnings: number
          experience_gained: number
          performance_quality: number
          performed_at: string
        }
        Insert: {
          id?: string
          player_id: string
          stage_id: string
          earnings?: number
          experience_gained?: number
          performance_quality?: number
          performed_at?: string
        }
        Update: {
          earnings?: number
          experience_gained?: number
          performance_quality?: number
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          entry_fee: number
          total_prize_pool: number
          max_participants: number
          current_participants: number
          status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed'
          week_number: number
          starts_at: string
          ends_at: string
          winner_band_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          entry_fee?: number
          total_prize_pool?: number
          max_participants?: number
          current_participants?: number
          status?: 'upcoming' | 'registration_open' | 'in_progress' | 'completed'
          week_number?: number
          starts_at?: string
          ends_at?: string
          winner_band_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          entry_fee?: number
          total_prize_pool?: number
          current_participants?: number
          status?: 'upcoming' | 'registration_open' | 'in_progress' | 'completed'
          ends_at?: string
          winner_band_id?: string | null
          updated_at?: string
        }
      }
      tournament_registrations: {
        Row: {
          id: string
          tournament_id: string
          band_id: string
          entry_fee_paid: number
          registered_at: string
          final_score: number | null
          final_rank: number | null
        }
        Insert: {
          id?: string
          tournament_id: string
          band_id: string
          entry_fee_paid?: number
          registered_at?: string
          final_score?: number | null
          final_rank?: number | null
        }
        Update: {
          final_score?: number | null
          final_rank?: number | null
        }
      }
      battles: {
        Row: {
          id: string
          tournament_id: string | null
          band_a_id: string
          band_b_id: string
          band_a_score: number
          band_b_score: number
          winner_band_id: string | null
          entry_fee_total: number
          prize_distributed: number
          status: 'scheduled' | 'in_progress' | 'completed'
          battle_data: Record<string, any> | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          tournament_id?: string | null
          band_a_id: string
          band_b_id: string
          band_a_score?: number
          band_b_score?: number
          winner_band_id?: string | null
          entry_fee_total?: number
          prize_distributed?: number
          status?: 'scheduled' | 'in_progress' | 'completed'
          battle_data?: Record<string, any> | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          band_a_score?: number
          band_b_score?: number
          winner_band_id?: string | null
          prize_distributed?: number
          status?: 'scheduled' | 'in_progress' | 'completed'
          battle_data?: Record<string, any> | null
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      character_style: 'classic' | 'punk' | 'metal' | 'indie' | 'electronic'
      primary_instrument: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
      band_role: 'singer' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'violinist' | 'saxophonist' | 'trumpeter' | 'flautist' | 'cellist' | 'pianist' | 'harmonica_player' | 'djay_producer'
      tournament_status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed'
      battle_status: 'scheduled' | 'in_progress' | 'completed'
    }
  }
}
