'use client'

import { DbConnection } from '@/spacetime_module_bindings'

let connection: DbConnection | null = null
let connectionPromise: Promise<DbConnection> | null = null

export const getSpacetimeConnection = async (): Promise<DbConnection> => {
  if (connection) return connection

  if (connectionPromise) return connectionPromise

  connectionPromise = initializeConnection()
  return connectionPromise
}

const initializeConnection = async (): Promise<DbConnection> => {
  try {
    const builder = DbConnection.builder()
      .withUri("ws://localhost:3030")
      .withModuleName("rock_legends")
    
    connection = await builder.build()
    
    console.log('🎸 SpacetimeDB connected successfully!')
    return connection
  } catch (error) {
    console.error('❌ Failed to connect to SpacetimeDB:', error)
    console.log('🔧 Starting in demo mode...')
    
    // Return a mock connection for development
    return createMockConnection()
  }
}

// Mock connection for development when SpacetimeDB is not available
const createMockConnection = (): DbConnection => {
  return {
    db: {
      playerProfile: {
        identity: {
          find: () => null
        },
        iter: () => ([]),
        onInsert: () => {},
        onUpdate: () => {},
        onDelete: () => {}
      },
      band: {
        bandId: {
          find: () => null
        },
        iter: () => ([]),
        onInsert: () => {},
        onUpdate: () => {},
        onDelete: () => {}
      },
      bandMembership: {
        iter: () => ([]),
        onInsert: () => {},
        onUpdate: () => {},
        onDelete: () => {}
      },
      battle: {
        iter: () => ([]),
        onInsert: () => {},
        onUpdate: () => {},
        onDelete: () => {}
      },
      tournament: {
        iter: () => ([]),
        onInsert: () => {},
        onUpdate: () => {},
        onDelete: () => {}
      },
      soloCareerMilestone: {
        iter: () => ([]),
        onInsert: () => {},
        onUpdate: () => {},
        onDelete: () => {}
      },
      tournamentEntry: {
        iter: () => ([]),
        onInsert: () => {},
        onUpdate: () => {},
        onDelete: () => {}
      }
    },
    reducers: {
      createCharacter: () => Promise.resolve(),
      progressSoloStage: () => Promise.resolve(),
      createBand: () => Promise.resolve(),
      joinBand: () => Promise.resolve(),
      leaveBand: () => Promise.resolve(),
      startBattle: () => Promise.resolve(),
      submitBattleScore: () => Promise.resolve(),
      registerBandForTournament: () => Promise.resolve()
    }
  } as any
}

export const subscribeToSpacetimeUpdates = async (callbacks: {
  onPlayerUpdate?: (player: any) => void
  onBandUpdate?: (band: any) => void
  onBattleUpdate?: (battle: any) => void
  onTournamentUpdate?: (tournament: any) => void
}) => {
  try {
    const conn = await getSpacetimeConnection()
    
    if (callbacks.onPlayerUpdate) {
      conn.db.playerProfile.onUpdate((ctx, oldPlayer, newPlayer) => {
        callbacks.onPlayerUpdate?.(newPlayer)
      })
      
      conn.db.playerProfile.onInsert((ctx, player) => {
        callbacks.onPlayerUpdate?.(player)
      })
    }
    
    if (callbacks.onBandUpdate) {
      conn.db.band.onUpdate((ctx, oldBand, newBand) => {
        callbacks.onBandUpdate?.(newBand)
      })
      
      conn.db.band.onInsert((ctx, band) => {
        callbacks.onBandUpdate?.(band)
      })
    }
    
    if (callbacks.onBattleUpdate) {
      conn.db.battle.onUpdate((ctx, oldBattle, newBattle) => {
        callbacks.onBattleUpdate?.(newBattle)
      })
      
      conn.db.battle.onInsert((ctx, battle) => {
        callbacks.onBattleUpdate?.(battle)
      })
    }
    
    if (callbacks.onTournamentUpdate) {
      conn.db.tournament.onUpdate((ctx, oldTournament, newTournament) => {
        callbacks.onTournamentUpdate?.(newTournament)
      })
      
      conn.db.tournament.onInsert((ctx, tournament) => {
        callbacks.onTournamentUpdate?.(tournament)
      })
    }
  } catch (error) {
    console.warn('SpacetimeDB subscriptions not available in demo mode')
  }
}

export { connection }
