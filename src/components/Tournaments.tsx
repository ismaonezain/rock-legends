'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Tournament, Battle, Band } from '@/types/game'

interface TournamentsProps {
  tournaments: Tournament[]
  recentBattles: Battle[]
  playerBand: Band | null
  onJoinTournament?: (tournamentId: string) => Promise<void>
  isLoading?: boolean
}

export function Tournaments({ 
  tournaments, 
  recentBattles, 
  playerBand, 
  onJoinTournament,
  isLoading = false 
}: TournamentsProps) {
  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600'
      case 'registration_open': return 'bg-green-600'
      case 'in_progress': return 'bg-yellow-600'
      case 'completed': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  const getBattleStatusColor = (status: Battle['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600'
      case 'in_progress': return 'bg-yellow-600'
      case 'completed': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🏆</span>
            <span>Weekly Tournaments</span>
          </CardTitle>
          <p className="text-gray-600">
            Compete in weekly tournaments for massive Rock Token prizes
          </p>
        </CardHeader>
        <CardContent>
          {tournaments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tournaments.map(tournament => (
                <Card key={tournament.id} className="border-2 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{tournament.name}</h4>
                        <p className="text-sm text-gray-600">Week #{tournament.week_number}</p>
                      </div>
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Entry Fee:</span>
                          <div className="font-semibold">{tournament.entry_fee} Tokens</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Prize Pool:</span>
                          <div className="font-semibold text-green-600">{tournament.total_prize_pool} Tokens</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Participants</span>
                          <span>{tournament.current_participants}/{tournament.max_participants}</span>
                        </div>
                        <Progress 
                          value={(tournament.current_participants / tournament.max_participants) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="text-xs text-gray-600">
                        <p>Starts: {new Date(tournament.starts_at).toLocaleDateString()}</p>
                        <p>Ends: {new Date(tournament.ends_at).toLocaleDateString()}</p>
                      </div>

                      {tournament.status === 'registration_open' && playerBand && onJoinTournament && (
                        <Button
                          onClick={() => onJoinTournament(tournament.id)}
                          disabled={isLoading || tournament.current_participants >= tournament.max_participants}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? 'Joining...' : `Join Tournament (${tournament.entry_fee} Tokens)`}
                        </Button>
                      )}

                      {!playerBand && tournament.status === 'registration_open' && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          Create or join a band to participate in tournaments
                        </div>
                      )}

                      {tournament.winner_band_id && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">
                            🏆 Winner: Band #{tournament.winner_band_id.slice(0, 8)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🎵</div>
              <p>No active tournaments right now</p>
              <p className="text-sm">Check back later for weekly tournaments!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Battles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">⚔️</span>
            <span>Recent Battles</span>
          </CardTitle>
          <p className="text-gray-600">
            Live battle results from the Rock Legends arena
          </p>
        </CardHeader>
        <CardContent>
          {recentBattles.length > 0 ? (
            <div className="space-y-3">
              {recentBattles.slice(0, 10).map(battle => (
                <Card key={battle.id} className="border border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge className={getBattleStatusColor(battle.status)}>
                            {battle.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Band vs Band
                          </span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-semibold">
                            {battle.band_a_score} - {battle.band_b_score}
                          </span>
                          {battle.winner_band_id && (
                            <span className="ml-2 text-green-600">
                              🏆 Winner: Band #{battle.winner_band_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className="font-semibold text-yellow-600">
                          {battle.entry_fee_total} Tokens
                        </div>
                        <div className="text-xs text-gray-500">Prize Pool</div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(battle.created_at).toLocaleDateString()} at{' '}
                      {new Date(battle.created_at).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🎭</div>
              <p>No recent battles</p>
              <p className="text-sm">Start a battle to see live results here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
