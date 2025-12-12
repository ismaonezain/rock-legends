'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { getSupabaseClient } from '@/lib/supabase'
import type { Player, Band, BandMember, Tournament, Battle, CharacterCustomization } from '@/types/game'
import { ROCK_TOKEN_RATES, SOLO_STAGES } from '@/types/game'
import { v4 as uuidv4 } from 'uuid'

export function useRockLegendsData() {
  const { address } = useAccount()
  
  // State
  const [player, setPlayer] = useState<Player | null>(null)
  const [playerBand, setPlayerBand] = useState<Band | null>(null)
  const [allBands, setAllBands] = useState<Band[]>([])
  const [bandMembers, setBandMembers] = useState<BandMember[]>([])
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([])
  const [recentBattles, setRecentBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClientSide, setIsClientSide] = useState(false)

  // Check if we're on client side
  useEffect(() => {
    setIsClientSide(true)
  }, [])

  // Check if player exists
  const fetchPlayer = useCallback(async () => {
    if (!address || !isClientSide) return null

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (error && error.message.includes('Demo mode')) {
        console.warn('Demo mode active - using mock player data')
        // Return mock player data for demo
        return {
          id: 'demo-player',
          wallet_address: address.toLowerCase(),
          username: 'Demo Rock Star',
          profile_picture: null,
          level: 5,
          experience: 2500,
          total_earnings: 15000,
          rock_tokens: 3500,
          character_style: 'classic' as const,
          character_color: '#DC2626',
          character_accessories: ['leather_jacket', 'sunglasses'],
          current_instrument: 'electric_guitar',
          instruments_owned: ['acoustic_guitar', 'electric_guitar', 'vintage_microphone'],
          solo_career_stage: 4,
          total_solo_performances: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching player:', err)
      return null
    }
  }, [address, isClientSide])

  // Register new player
  const registerPlayer = useCallback(async (
    username: string, 
    customization: CharacterCustomization,
    profilePicture?: string
  ) => {
    if (!address || !isClientSide) throw new Error('No wallet connected')

    try {
      const newPlayer = {
        id: uuidv4(),
        wallet_address: address.toLowerCase(),
        username,
        profile_picture: profilePicture || null,
        level: 1,
        experience: 0,
        total_earnings: 0,
        rock_tokens: 2000, // Starting tokens
        character_style: customization.style,
        character_color: customization.color,
        character_accessories: customization.accessories,
        current_instrument: 'acoustic_guitar',
        instruments_owned: ['acoustic_guitar'],
        solo_career_stage: 1,
        total_solo_performances: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('players')
        .insert(newPlayer)
        .select()
        .single()

      if (error && error.message.includes('Demo mode')) {
        console.warn('Demo mode - simulating player registration')
        setPlayer(newPlayer as Player)
        return newPlayer as Player
      }

      if (error) throw error

      setPlayer(data)
      return data
    } catch (err) {
      console.error('Error registering player:', err)
      throw err
    }
  }, [address, isClientSide])

  // Perform solo career performance
  const performSolo = useCallback(async (stageNumber: number) => {
    if (!player) throw new Error('No player found')

    try {
      const stage = SOLO_STAGES.find(s => s.stage_number === stageNumber)
      if (!stage) throw new Error('Invalid stage')

      if (player.level < stage.required_level) {
        throw new Error(`Level ${stage.required_level} required for this stage`)
      }

      // Calculate performance quality (70-100%)
      const performanceQuality = Math.floor(Math.random() * 31) + 70
      const earnings = Math.floor(stage.base_earnings * (performanceQuality / 100))
      const experienceGained = Math.floor(earnings / 10)
      const tokensEarned = Math.floor(earnings / ROCK_TOKEN_RATES.SOLO_PERFORMANCE_RATE)

      // Update player stats
      const newExperience = player.experience + experienceGained
      const newLevel = Math.floor(newExperience / 1000) + 1
      const newTotalEarnings = player.total_earnings + earnings
      const newRockTokens = player.rock_tokens + tokensEarned
      const newSoloPerformances = player.total_solo_performances + 1

      // Check if player can advance to next stage
      let newSoloStage = player.solo_career_stage
      if (stageNumber === player.solo_career_stage && newLevel >= (stage.required_level + 2)) {
        newSoloStage = Math.min(SOLO_STAGES.length, stageNumber + 1)
      }

      // Add instrument reward if applicable
      let newInstruments = [...player.instruments_owned]
      if (stage.instrument_reward && !newInstruments.includes(stage.instrument_reward)) {
        newInstruments.push(stage.instrument_reward)
      }

      const updatedPlayer = {
        ...player,
        level: newLevel,
        experience: newExperience,
        total_earnings: newTotalEarnings,
        rock_tokens: newRockTokens,
        solo_career_stage: newSoloStage,
        total_solo_performances: newSoloPerformances,
        instruments_owned: newInstruments,
        updated_at: new Date().toISOString()
      }

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('players')
        .update({
          level: newLevel,
          experience: newExperience,
          total_earnings: newTotalEarnings,
          rock_tokens: newRockTokens,
          solo_career_stage: newSoloStage,
          total_solo_performances: newSoloPerformances,
          instruments_owned: newInstruments,
          updated_at: new Date().toISOString()
        })
        .eq('id', player.id)
        .select()
        .single()

      if (error && error.message.includes('Demo mode')) {
        console.warn('Demo mode - simulating performance update')
        setPlayer(updatedPlayer)
      } else if (error) {
        throw error
      } else {
        setPlayer(data)
      }

      return {
        earnings,
        experienceGained,
        tokensEarned,
        performanceQuality,
        leveledUp: newLevel > player.level,
        newLevel,
        instrumentReward: stage.instrument_reward && !player.instruments_owned.includes(stage.instrument_reward) ? stage.instrument_reward : null,
        stageAdvanced: newSoloStage > player.solo_career_stage
      }
    } catch (err) {
      console.error('Error performing solo:', err)
      throw err
    }
  }, [player])

  // Create a band
  const createBand = useCallback(async (name: string, description?: string) => {
    if (!player) throw new Error('No player found')
    
    if (player.rock_tokens < ROCK_TOKEN_RATES.BAND_CREATION_COST) {
      throw new Error(`Need ${ROCK_TOKEN_RATES.BAND_CREATION_COST} Rock Tokens to create a band`)
    }

    try {
      const bandId = uuidv4()
      
      const newBand = {
        id: bandId,
        name,
        description: description || null,
        leader_id: player.id,
        creation_cost: ROCK_TOKEN_RATES.BAND_CREATION_COST,
        total_power: 0,
        total_wins: 0,
        total_losses: 0,
        rock_tokens_earned: 0,
        max_singers: 2,
        max_drummers: 1,
        max_guitarists: 2,
        current_singers: 0,
        current_drummers: 0,
        current_guitarists: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const updatedPlayer = {
        ...player,
        rock_tokens: player.rock_tokens - ROCK_TOKEN_RATES.BAND_CREATION_COST,
        updated_at: new Date().toISOString()
      }

      const supabase = getSupabaseClient()
      
      // Simulate database operations
      const { error: bandError } = await supabase
        .from('bands')
        .insert(newBand)
        .select()
        .single()

      if (bandError && bandError.message.includes('Demo mode')) {
        console.warn('Demo mode - simulating band creation')
        setPlayerBand(newBand as Band)
        setPlayer(updatedPlayer)
        return newBand as Band
      }

      if (bandError) throw bandError

      setPlayerBand(newBand as Band)
      setPlayer(updatedPlayer)
      return newBand as Band
    } catch (err) {
      console.error('Error creating band:', err)
      throw err
    }
  }, [player])

  // Join a band with specific role
  const joinBand = useCallback(async (bandId: string, role: 'singer' | 'drummer' | 'guitarist_melodist' | 'guitarist_rhythmist') => {
    if (!player) throw new Error('No player found')

    try {
      // In demo mode, simulate joining a band
      const mockBand = {
        id: bandId,
        name: 'Demo Band',
        description: 'A demo band for testing',
        leader_id: 'other-player',
        creation_cost: ROCK_TOKEN_RATES.BAND_CREATION_COST,
        total_power: 150,
        total_wins: 5,
        total_losses: 2,
        rock_tokens_earned: 1000,
        band_logo: null,
        max_singers: 2,
        max_drummers: 1,
        max_guitarists: 2,
        current_singers: role === 'singer' ? 1 : 0,
        current_drummers: role === 'drummer' ? 1 : 0,
        current_guitarists: role.includes('guitarist') ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setPlayerBand(mockBand as Band)
      return mockBand as Band
    } catch (err) {
      console.error('Error joining band:', err)
      throw err
    }
  }, [player])

  // Start a battle (costs entry fee)
  const startBattle = useCallback(async (targetBandId: string) => {
    if (!player || !playerBand) throw new Error('Need player and band to battle')

    const entryFee = ROCK_TOKEN_RATES.BATTLE_ENTRY_FEE

    if (player.rock_tokens < entryFee) {
      throw new Error(`Need ${entryFee} Rock Tokens for battle entry fee`)
    }

    try {
      // Simulate battle creation in demo mode
      const battleId = uuidv4()
      const mockBattle = {
        id: battleId,
        tournament_id: null,
        band_a_id: playerBand.id,
        band_b_id: targetBandId,
        band_a_score: Math.floor(Math.random() * 100),
        band_b_score: Math.floor(Math.random() * 100),
        winner_band_id: null,
        entry_fee_total: entryFee * 2,
        prize_distributed: 0,
        status: 'in_progress' as const,
        battle_data: null,
        created_at: new Date().toISOString(),
        completed_at: null
      }

      const updatedPlayer = {
        ...player,
        rock_tokens: player.rock_tokens - entryFee,
        updated_at: new Date().toISOString()
      }

      setPlayer(updatedPlayer)
      setRecentBattles(prev => [mockBattle as Battle, ...prev.slice(0, 9)])
      
      return mockBattle
    } catch (err) {
      console.error('Error starting battle:', err)
      throw err
    }
  }, [player, playerBand])

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!address || !isClientSide) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Load player
      const playerData = await fetchPlayer()
      setPlayer(playerData)

      // Load mock data for demo
      if (playerData) {
        // Mock bands data
        const mockBands = [
          {
            id: 'band-1',
            name: 'The Rock Stars',
            description: 'A legendary rock band',
            leader_id: 'other-player-1',
            creation_cost: 1000,
            total_power: 200,
            total_wins: 10,
            total_losses: 3,
            rock_tokens_earned: 2000,
            band_logo: null,
            max_singers: 2,
            max_drummers: 1,
            max_guitarists: 2,
            current_singers: 1,
            current_drummers: 1,
            current_guitarists: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'band-2',
            name: 'Electric Dreams',
            description: 'Electronic music innovators',
            leader_id: 'other-player-2',
            creation_cost: 1000,
            total_power: 180,
            total_wins: 8,
            total_losses: 4,
            rock_tokens_earned: 1500,
            band_logo: null,
            max_singers: 2,
            max_drummers: 1,
            max_guitarists: 2,
            current_singers: 2,
            current_drummers: 0,
            current_guitarists: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setAllBands(mockBands as Band[])

        // Mock tournaments
        const mockTournaments = [
          {
            id: 'tournament-1',
            name: 'Weekly Rock Championship',
            entry_fee: 500,
            total_prize_pool: 5000,
            max_participants: 16,
            current_participants: 8,
            status: 'registration_open' as const,
            week_number: 1,
            starts_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            ends_at: new Date(Date.now() + 7 * 86400000).toISOString(), // Next week
            winner_band_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setActiveTournaments(mockTournaments as Tournament[])
      }

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [address, isClientSide, fetchPlayer])

  // Load data when address changes
  useEffect(() => {
    if (isClientSide) {
      loadAllData()
    }
  }, [loadAllData, isClientSide])

  return {
    // State
    player,
    playerBand,
    allBands,
    bandMembers,
    activeTournaments,
    recentBattles,
    loading,
    error,

    // Actions
    registerPlayer,
    performSolo,
    createBand,
    joinBand,
    startBattle,
    refreshData: loadAllData,

    // Computed
    isPlayerRegistered: !!player,
    canCreateBand: player && player.rock_tokens >= ROCK_TOKEN_RATES.BAND_CREATION_COST,
    hasActiveBand: !!playerBand
  }
}
