'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { getSpacetimeConnection, subscribeToSpacetimeUpdates } from '@/lib/spacetimedb'
import type { Player, Band, BandMember, Tournament, Battle, CharacterCustomization } from '@/types/game'
import { SOLO_STAGES } from '@/types/game'
import type { InstrumentRole } from '@/types/instruments'

// Map SpacetimeDB types to our game types
const mapSpacetimePlayer = (stdbPlayer: any): Player | null => {
  if (!stdbPlayer) return null
  
  return {
    id: stdbPlayer.identity,
    wallet_address: stdbPlayer.identity, // SpacetimeDB uses identity for wallet addresses
    username: stdbPlayer.username,
    profile_picture: stdbPlayer.style.profilePicture || null,
    level: stdbPlayer.level,
    experience: Number(stdbPlayer.xp),
    total_earnings: Number(stdbPlayer.totalEarnings),
    rock_tokens: Number(stdbPlayer.rockTokens),
    character_style: stdbPlayer.style.outfitStyle || 'classic',
    character_color: stdbPlayer.style.primaryColor || '#DC2626',
    character_accessories: stdbPlayer.style.accessories || [],
    current_instrument: stdbPlayer.instrumentsOwned[0]?.favoriteInstrumentName || 'acoustic_guitar',
    instruments_owned: stdbPlayer.instrumentsOwned.map((inst: any) => inst.favoriteInstrumentName) || ['acoustic_guitar'],
    solo_career_stage: stdbPlayer.soloStageIndex + 1, // Convert 0-based to 1-based
    total_solo_performances: Number(stdbPlayer.soloStageIndex),
    created_at: stdbPlayer.createdAt.toISOString(),
    updated_at: stdbPlayer.updatedAt.toISOString()
  }
}

const mapSpacetimeBand = (stdbBand: any): Band | null => {
  if (!stdbBand) return null
  
  return {
    id: stdbBand.bandId.toString(),
    name: stdbBand.name,
    description: stdbBand.styleTag,
    leader_id: stdbBand.leader,
    creation_cost: 1000, // Default cost
    total_power: Number(stdbBand.tokensTreasury) / 100, // Convert treasury to power approximation
    total_wins: stdbBand.battleWins,
    total_losses: stdbBand.battleLosses,
    rock_tokens_earned: Number(stdbBand.tokensTreasury),
    band_logo: null,
    max_singers: 2,
    max_drummers: 1,
    max_guitarists: 3,
    current_singers: 0, // Will be calculated from memberships
    current_drummers: 0,
    current_guitarists: 0,
    created_at: stdbBand.createdAt.toISOString(),
    updated_at: stdbBand.updatedAt.toISOString()
  }
}

const mapSpacetimeBattle = (stdbBattle: any): Battle | null => {
  if (!stdbBattle) return null
  
  return {
    id: stdbBattle.battleId.toString(),
    tournament_id: null,
    band_a_id: stdbBattle.bandAId.toString(),
    band_b_id: stdbBattle.bandBId.toString(),
    band_a_score: Number(stdbBattle.bandAScore),
    band_b_score: Number(stdbBattle.bandBScore),
    winner_band_id: stdbBattle.winnerBandId?.toString() || null,
    entry_fee_total: Number(stdbBattle.entryFee) * 2,
    prize_distributed: Number(stdbBattle.prizePool),
    status: stdbBattle.state.tag === 'Finished' ? 'completed' : 
           stdbBattle.state.tag === 'InProgress' ? 'in_progress' : 'waiting',
    battle_data: null,
    created_at: stdbBattle.createdAt.toISOString(),
    completed_at: stdbBattle.state.tag === 'Finished' ? stdbBattle.updatedAt.toISOString() : null
  }
}

const mapSpacetimeTournament = (stdbTournament: any): Tournament | null => {
  if (!stdbTournament) return null
  
  return {
    id: stdbTournament.tournamentId.toString(),
    name: stdbTournament.name,
    entry_fee: Number(stdbTournament.entryFee),
    total_prize_pool: Number(stdbTournament.prizePool),
    max_participants: 16,
    current_participants: 0, // Will be calculated from entries
    status: stdbTournament.state.tag === 'Completed' ? 'completed' : 
           stdbTournament.state.tag === 'InProgress' ? 'in_progress' : 'registration_open',
    week_number: Number(stdbTournament.weekNumber),
    starts_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    ends_at: new Date(Date.now() + 7 * 86400000).toISOString(), // Next week
    winner_band_id: null,
    created_at: stdbTournament.createdAt.toISOString(),
    updated_at: stdbTournament.updatedAt.toISOString()
  }
}

// Map game instrument to SpacetimeDB InstrumentRole
const mapInstrumentToSpacetime = (instrument: string): string => {
  const mapping: Record<string, string> = {
    'singer': 'Singer',
    'guitarist': 'LeadGuitarist',
    'guitarist_melodist': 'LeadGuitarist',
    'guitarist_rhythmist': 'RhythmGuitarist',
    'bassist': 'Bassist',
    'drummer': 'Drummer',
    'keyboardist': 'Keyboardist',
    'violinist': 'Violinist',
    'saxophonist': 'Saxophonist',
    'trumpeter': 'Trumpeter',
    'djay_producer': 'DJ'
  }
  return mapping[instrument] || 'Singer'
}

export function useSpacetimeData() {
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
  const [connection, setConnection] = useState<any>(null)

  // Initialize SpacetimeDB connection
  useEffect(() => {
    const initConnection = async () => {
      try {
        const conn = await getSpacetimeConnection()
        setConnection(conn)
        
        // Subscribe to real-time updates
        await subscribeToSpacetimeUpdates({
          onPlayerUpdate: (updatedPlayer) => {
            const mappedPlayer = mapSpacetimePlayer(updatedPlayer)
            if (mappedPlayer && mappedPlayer.wallet_address === address?.toLowerCase()) {
              setPlayer(mappedPlayer)
            }
          },
          onBandUpdate: (updatedBand) => {
            const mappedBand = mapSpacetimeBand(updatedBand)
            if (mappedBand) {
              setAllBands(prev => prev.map(band => 
                band.id === mappedBand.id ? mappedBand : band
              ))
              
              // Update player band if this is their band
              if (player?.current_band === mappedBand.id) {
                setPlayerBand(mappedBand)
              }
            }
          },
          onBattleUpdate: (updatedBattle) => {
            const mappedBattle = mapSpacetimeBattle(updatedBattle)
            if (mappedBattle) {
              setRecentBattles(prev => {
                const filtered = prev.filter(b => b.id !== mappedBattle.id)
                return [mappedBattle, ...filtered].slice(0, 10)
              })
            }
          },
          onTournamentUpdate: (updatedTournament) => {
            const mappedTournament = mapSpacetimeTournament(updatedTournament)
            if (mappedTournament) {
              setActiveTournaments(prev => prev.map(tournament => 
                tournament.id === mappedTournament.id ? mappedTournament : tournament
              ))
            }
          }
        })
        
      } catch (err) {
        console.error('Failed to initialize SpacetimeDB connection:', err)
      }
    }
    
    initConnection()
  }, [address, player])

  // Fetch player data
  const fetchPlayer = useCallback(async () => {
    if (!address || !connection) return null

    try {
      const stdbPlayer = connection.db.playerProfile.identity.find(address.toLowerCase())
      return mapSpacetimePlayer(stdbPlayer)
    } catch (err) {
      console.error('Error fetching player:', err)
      return null
    }
  }, [address, connection])

  // Register new player
  const registerPlayer = useCallback(async (
    username: string,
    customization: CharacterCustomization,
    profilePicture?: string
  ) => {
    if (!address) throw new Error('No wallet connected')
    if (!connection) throw new Error('SpacetimeDB unavailable')

    try {
      // Try SpacetimeDB first
      try {
        const style = {
          stageName: username,
          outfitStyle: customization.style,
          primaryColor: customization.color,
          accentColor: customization.color,
          accessories: customization.accessories,
          backstory: customization.backstory || '',
          profilePicture: profilePicture || ''
        }

        const instruments = [{
          role: mapInstrumentToSpacetime(customization.primaryInstrument || 'guitarist'),
          mastery: 50,
          favoriteInstrumentName: 'Starter ' + customization.primaryInstrument?.charAt(0).toUpperCase() + customization.primaryInstrument?.slice(1)
        }]

        await connection.reducers.createCharacter({
          username,
          style,
          preferredRole: mapInstrumentToSpacetime(customization.primaryInstrument || 'guitarist'),
          instruments
        })

        // Fetch updated player after creation
        const updatedPlayer = await fetchPlayer()
        if (updatedPlayer) {
          setPlayer(updatedPlayer)
        }
        
        return updatedPlayer
      } catch (spacetimeError) {
        console.warn('SpacetimeDB registration failed, using demo mode:', spacetimeError)
        
        // Fallback to demo mode
        const demoPlayer = {
          id: address.toLowerCase(),
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
          current_instrument: customization.primaryInstrument || 'acoustic_guitar',
          instruments_owned: [customization.primaryInstrument || 'acoustic_guitar'],
          solo_career_stage: 1,
          total_solo_performances: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Player

        setPlayer(demoPlayer)
        return demoPlayer
      }
    } catch (err) {
      console.error('Error registering player:', err)
      throw err
    }
  }, [address, connection, fetchPlayer])

  // Perform solo career performance
  const performSolo = useCallback(async (stageNumber: number) => {
    if (!player || !connection) throw new Error('No player found or SpacetimeDB unavailable')

    try {
      const performanceScore = Math.floor(Math.random() * 40) + 60 // 60-100 score
      
      await connection.reducers.progressSoloStage({
        performanceScore
      })

      // Calculate estimated rewards (approximate since server handles actual calculation)
      const stage = SOLO_STAGES.find(s => s.stage_number === stageNumber)
      const earnings = stage?.base_earnings || 1000
      const tokensEarned = Math.floor(earnings / 5)

      return {
        earnings,
        experienceGained: Math.floor(earnings / 10),
        tokensEarned,
        performanceQuality: performanceScore,
        leveledUp: false, // Server will handle level calculation
        newLevel: player.level,
        instrumentReward: stage?.instrument_reward || null,
        stageAdvanced: true
      }
    } catch (err) {
      console.error('Error performing solo:', err)
      throw err
    }
  }, [player, connection])

  // Create a band
  const createBand = useCallback(async (name: string, description?: string) => {
    if (!player || !connection) throw new Error('No player found or SpacetimeDB unavailable')

    try {
      await connection.reducers.createBand({
        name,
        styleTag: description || '',
        founderRole: mapInstrumentToSpacetime('guitarist')
      })

      // Band creation is handled by server, real-time updates will refresh UI
      return {
        id: 'pending', // Will be updated by subscription
        name,
        description,
        leader_id: player.id
      } as Band
    } catch (err) {
      console.error('Error creating band:', err)
      throw err
    }
  }, [player, connection])

  // Join a band with specific role
  const joinBand = useCallback(async (bandId: string, role: string) => {
    if (!player || !connection) throw new Error('No player found or SpacetimeDB unavailable')

    try {
      await connection.reducers.joinBand({
        bandId: BigInt(bandId),
        role: mapInstrumentToSpacetime(role)
      })

      // Join handled by server, real-time updates will refresh UI
      return {
        id: bandId,
        name: 'Joining...'
      } as Band
    } catch (err) {
      console.error('Error joining band:', err)
      throw err
    }
  }, [player, connection])

  // Start a battle (costs entry fee)
  const startBattle = useCallback(async (targetBandId: string) => {
    if (!player || !playerBand || !connection) throw new Error('Need player and band to battle')

    try {
      const entryFee = BigInt(200) // 200 tokens entry fee

      await connection.reducers.startBattle({
        bandAId: BigInt(playerBand.id),
        bandBId: BigInt(targetBandId),
        entryFee
      })

      // Battle creation is handled by server
      return {
        id: 'pending',
        status: 'waiting'
      }
    } catch (err) {
      console.error('Error starting battle:', err)
      throw err
    }
  }, [player, playerBand, connection])

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!address || !connection) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Load player
      const playerData = await fetchPlayer()
      
      // If no player data and we're in demo mode, provide mock data
      if (!playerData && address) {
        console.log('🎸 Demo mode: Creating mock player data')
        const mockPlayer = {
          id: address.toLowerCase(),
          wallet_address: address.toLowerCase(),
          username: 'Rock Star Demo',
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
        setPlayer(mockPlayer)
        
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
        ] as Band[]
        setAllBands(mockBands)

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
            starts_at: new Date(Date.now() + 86400000).toISOString(),
            ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
            winner_band_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ] as Tournament[]
        setActiveTournaments(mockTournaments)
        
        setRecentBattles([])
        
      } else {
        setPlayer(playerData)

        // Load bands
        const stdbBands = connection.db.band.iter()
        const mappedBands = stdbBands.map(mapSpacetimeBand).filter(Boolean) as Band[]
        setAllBands(mappedBands)

        // Load player's band if they have one
        if (playerData?.current_band) {
          const playersBand = mappedBands.find(b => b.id === playerData.current_band)
          setPlayerBand(playersBand || null)
        }

        // Load tournaments
        const stdbTournaments = connection.db.tournament.iter()
        const mappedTournaments = stdbTournaments.map(mapSpacetimeTournament).filter(Boolean) as Tournament[]
        setActiveTournaments(mappedTournaments)

        // Load battles
        const stdbBattles = connection.db.battle.iter()
        const mappedBattles = stdbBattles.map(mapSpacetimeBattle).filter(Boolean) as Battle[]
        setRecentBattles(mappedBattles.slice(0, 10))
      }

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [address, connection, fetchPlayer])

  // Load data when connection is ready
  useEffect(() => {
    if (connection && address) {
      loadAllData()
    }
  }, [connection, address, loadAllData])

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
    canCreateBand: player && player.rock_tokens >= 1000,
    hasActiveBand: !!playerBand
  }
}
