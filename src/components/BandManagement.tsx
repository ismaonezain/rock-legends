'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Player, Band, BandMember, BandRole } from '@/types/game'
import { ROCK_TOKEN_RATES } from '@/types/game'

interface BandManagementProps {
  player: Player
  playerBand: Band | null
  allBands: Band[]
  onCreateBand: (name: string, description?: string) => Promise<Band>
  onJoinBand: (bandId: string, role: BandRole) => Promise<Band>
  onStartBattle: (targetBandId: string) => Promise<any>
  isLoading?: boolean
}

export function BandManagement({ 
  player, 
  playerBand, 
  allBands, 
  onCreateBand, 
  onJoinBand, 
  onStartBattle,
  isLoading = false 
}: BandManagementProps) {
  const [createBandName, setCreateBandName] = useState('')
  const [createBandDescription, setCreateBandDescription] = useState('')
  const [selectedJoinRole, setSelectedJoinRole] = useState<BandRole | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateBand = async () => {
    if (!createBandName.trim()) return
    
    try {
      await onCreateBand(createBandName.trim(), createBandDescription.trim() || undefined)
      setCreateBandName('')
      setCreateBandDescription('')
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Failed to create band:', error)
    }
  }

  const handleJoinBand = async (bandId: string) => {
    if (!selectedJoinRole) return
    
    try {
      await onJoinBand(bandId, selectedJoinRole)
    } catch (error) {
      console.error('Failed to join band:', error)
    }
  }

  const canCreateBand = player.rock_tokens >= ROCK_TOKEN_RATES.BAND_CREATION_COST
  const availableBands = allBands.filter(band => band.id !== playerBand?.id)

  const getRoleIcon = (role: BandRole) => {
    switch (role) {
      case 'singer': return '🎤'
      case 'drummer': return '🥁'
      case 'guitarist_melodist': return '🎸'
      case 'guitarist_rhythmist': return '🎵'
      default: return '🎭'
    }
  }

  const getRoleAvailability = (band: Band, role: BandRole) => {
    switch (role) {
      case 'singer': return { current: band.current_singers, max: band.max_singers }
      case 'drummer': return { current: band.current_drummers, max: band.max_drummers }
      case 'guitarist_melodist':
      case 'guitarist_rhythmist': 
        return { current: band.current_guitarists, max: band.max_guitarists }
      default: return { current: 0, max: 0 }
    }
  }

  if (playerBand) {
    return (
      <div className="space-y-6">
        {/* Your Band Info */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">🎵</span>
              <span>{playerBand.name}</span>
              {playerBand.leader_id === player.id && (
                <Badge className="bg-yellow-600">Leader</Badge>
              )}
            </CardTitle>
            {playerBand.description && (
              <p className="text-gray-600">{playerBand.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{playerBand.total_power}</div>
                <p className="text-sm text-gray-600">Band Power</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{playerBand.total_wins}</div>
                <p className="text-sm text-gray-600">Victories</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{playerBand.total_losses}</div>
                <p className="text-sm text-gray-600">Defeats</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{playerBand.rock_tokens_earned}</div>
                <p className="text-sm text-gray-600">Tokens Earned</p>
              </div>
            </div>

            {/* Band Composition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎤</div>
                  <h4 className="font-semibold">Singers</h4>
                  <p className="text-lg">{playerBand.current_singers}/{playerBand.max_singers}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(playerBand.current_singers / playerBand.max_singers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🥁</div>
                  <h4 className="font-semibold">Drummers</h4>
                  <p className="text-lg">{playerBand.current_drummers}/{playerBand.max_drummers}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(playerBand.current_drummers / playerBand.max_drummers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎸</div>
                  <h4 className="font-semibold">Guitarists</h4>
                  <p className="text-lg">{playerBand.current_guitarists}/{playerBand.max_guitarists}</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(playerBand.current_guitarists / playerBand.max_guitarists) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Battle Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">⚔️</span>
              <span>Challenge Other Bands</span>
            </CardTitle>
            <p className="text-gray-600">
              Battle other bands to earn Rock Tokens and climb the rankings
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Battle Cost:</strong> {ROCK_TOKEN_RATES.BATTLE_ENTRY_FEE} Rock Tokens per battle
              </p>
              <p className="text-sm text-yellow-700">
                Winner takes the entire prize pool from both bands' entry fees
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBands.slice(0, 9).map(band => (
                <Card key={band.id} className="border-2 border-gray-200 hover:border-red-400 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{band.name}</h4>
                        <p className="text-sm text-gray-600">
                          Power: {band.total_power} • {band.total_wins}W-{band.total_losses}L
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          band.total_power > playerBand.total_power + 50 ? 'bg-red-600' :
                          band.total_power < playerBand.total_power - 50 ? 'bg-green-600' :
                          'bg-yellow-600'
                        }>
                          {band.total_power > playerBand.total_power + 50 ? 'Strong' :
                           band.total_power < playerBand.total_power - 50 ? 'Weak' : 'Equal'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-3">
                      <span>🎤 {band.current_singers}/{band.max_singers}</span>
                      <span>🥁 {band.current_drummers}/{band.max_drummers}</span>
                      <span>🎸 {band.current_guitarists}/{band.max_guitarists}</span>
                    </div>

                    <Button
                      onClick={() => onStartBattle(band.id)}
                      disabled={isLoading || player.rock_tokens < ROCK_TOKEN_RATES.BATTLE_ENTRY_FEE}
                      className="w-full bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      {isLoading ? '⚔️ Starting...' : '⚔️ Challenge!'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {availableBands.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🎵</div>
                <p>No other bands available for battle right now</p>
                <p className="text-sm">Check back later or recruit more players!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Band Section */}
      <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-400">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🎵</span>
            <span>Start Your Own Band</span>
          </CardTitle>
          <p className="text-gray-600">
            Create your own band and become the leader of your musical destiny
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-800">
                <strong>Band Creation Cost:</strong> {ROCK_TOKEN_RATES.BAND_CREATION_COST} Rock Tokens
              </p>
              <Badge className={canCreateBand ? 'bg-green-600' : 'bg-red-600'}>
                {player.rock_tokens} / {ROCK_TOKEN_RATES.BAND_CREATION_COST} Tokens
              </Badge>
            </div>
            <p className="text-xs text-blue-700">
              As band leader, you'll control recruitment, battles, and strategy
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                disabled={!canCreateBand || isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {!canCreateBand ? `Need ${ROCK_TOKEN_RATES.BAND_CREATION_COST - player.rock_tokens} More Tokens` : '🎸 Create Your Band'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Your Band</DialogTitle>
                <DialogDescription>
                  Give your band a name and vision that will attract the best musicians
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bandName">Band Name *</Label>
                  <Input
                    id="bandName"
                    value={createBandName}
                    onChange={(e) => setCreateBandName(e.target.value)}
                    placeholder="Enter your band name..."
                    maxLength={30}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bandDescription">Band Description (Optional)</Label>
                  <Textarea
                    id="bandDescription"
                    value={createBandDescription}
                    onChange={(e) => setCreateBandDescription(e.target.value)}
                    placeholder="Describe your band's style, vision, or goals..."
                    maxLength={200}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {createBandDescription.length}/200 characters
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Your Band Will Have:</h4>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-lg">🎤</div>
                      <p>2 Singers Max</p>
                    </div>
                    <div>
                      <div className="text-lg">🥁</div>
                      <p>1 Drummer Max</p>
                    </div>
                    <div>
                      <div className="text-lg">🎸</div>
                      <p>2 Guitarists Max</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreateBand}
                  disabled={!createBandName.trim() || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Creating Band...' : `Create Band (${ROCK_TOKEN_RATES.BAND_CREATION_COST} Tokens)`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Join Band Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🤝</span>
            <span>Join an Existing Band</span>
          </CardTitle>
          <p className="text-gray-600">
            Find a band that needs your skills and join their musical journey
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available Bands</TabsTrigger>
              <TabsTrigger value="role-select">Choose Your Role</TabsTrigger>
            </TabsList>
            
            <TabsContent value="role-select" className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2">Select Your Band Role</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Choose what role you want to play in a band. Different roles have different limits.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { role: 'singer' as BandRole, name: 'Singer', icon: '🎤', limit: 'Max 2 per band' },
                    { role: 'drummer' as BandRole, name: 'Drummer', icon: '🥁', limit: 'Max 1 per band' },
                    { role: 'guitarist_melodist' as BandRole, name: 'Lead Guitar', icon: '🎸', limit: 'Max 2 guitarists total' },
                    { role: 'guitarist_rhythmist' as BandRole, name: 'Rhythm Guitar', icon: '🎵', limit: 'Max 2 guitarists total' }
                  ].map(({ role, name, icon, limit }) => (
                    <Card 
                      key={role}
                      className={`cursor-pointer border-2 transition-all hover:scale-105 ${
                        selectedJoinRole === role 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedJoinRole(role)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl mb-1">{icon}</div>
                        <h5 className="font-semibold text-sm">{name}</h5>
                        <p className="text-xs text-gray-500">{limit}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {selectedJoinRole && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Selected: <strong>{selectedJoinRole.replace('_', ' ')}</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      Now go to "Available Bands" to find a band that needs your skills!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="available" className="space-y-4">
              {!selectedJoinRole && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please select your desired role first in the "Choose Your Role" tab
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBands.map(band => {
                  const roleAvailability = selectedJoinRole ? getRoleAvailability(band, selectedJoinRole) : null
                  const canJoinBand = selectedJoinRole && roleAvailability && roleAvailability.current < roleAvailability.max
                  
                  return (
                    <Card key={band.id} className={`border-2 ${canJoinBand ? 'border-green-200' : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold">{band.name}</h4>
                            {band.description && (
                              <p className="text-xs text-gray-600 mt-1">{band.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                              <span>Power: {band.total_power}</span>
                              <span>{band.total_wins}W-{band.total_losses}L</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                          <div className="text-center">
                            <div>🎤 {band.current_singers}/{band.max_singers}</div>
                            <div className="text-gray-500">Singers</div>
                          </div>
                          <div className="text-center">
                            <div>🥁 {band.current_drummers}/{band.max_drummers}</div>
                            <div className="text-gray-500">Drummers</div>
                          </div>
                          <div className="text-center">
                            <div>🎸 {band.current_guitarists}/{band.max_guitarists}</div>
                            <div className="text-gray-500">Guitarists</div>
                          </div>
                        </div>
                        
                        {selectedJoinRole && roleAvailability && (
                          <div className="mb-3">
                            <Badge className={canJoinBand ? 'bg-green-600' : 'bg-red-600'}>
                              {selectedJoinRole.replace('_', ' ')}: {roleAvailability.current}/{roleAvailability.max}
                            </Badge>
                          </div>
                        )}
                        
                        <Button
                          onClick={() => canJoinBand && band.id && handleJoinBand(band.id)}
                          disabled={!canJoinBand || isLoading}
                          className="w-full"
                          size="sm"
                        >
                          {!selectedJoinRole ? 'Select Role First' :
                           !canJoinBand ? 'Position Full' :
                           isLoading ? 'Joining...' : `Join as ${selectedJoinRole.replace('_', ' ')}`}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              
              {availableBands.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🎭</div>
                  <p>No bands available to join right now</p>
                  <p className="text-sm">Maybe it's time to create your own band!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
