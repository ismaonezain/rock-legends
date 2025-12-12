'use client'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { WalletConnectButton } from '@/components/game/WalletConnectButton'
import { useAutoConnectWallet } from '@/hooks/useAutoConnectWallet'
import { CharacterCreation } from '@/components/CharacterCreation'
import { SoloCareer } from '@/components/SoloCareer'
import { BandManagement } from '@/components/BandManagement'
import { Tournaments } from '@/components/Tournaments'
import { useSpacetimeData } from '@/hooks/useSpacetimeData'
import { sdk } from '@farcaster/miniapp-sdk'
import { useAddMiniApp } from '@/hooks/useAddMiniApp'
import { useQuickAuth } from '@/hooks/useQuickAuth'
import { useIsInFarcaster } from '@/hooks/useIsInFarcaster'
import { CHARACTER_STYLES } from '@/types/game'

export default function RockLegendsGame() {
  const { addMiniApp } = useAddMiniApp()
  const isInFarcaster = useIsInFarcaster()
  useQuickAuth(isInFarcaster)

  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('solo')

  // Auto-connect wallet hook
  useAutoConnectWallet({
    autoConnect: true,
    onConnect: (connectedAddress) => {
      console.log('Wallet connected:', connectedAddress)
    },
    onDisconnect: () => {
      console.log('Wallet disconnected')
    }
  })

  const {
    player,
    playerBand,
    allBands,
    activeTournaments,
    recentBattles,
    loading,
    error,
    registerPlayer,
    performSolo,
    createBand,
    joinBand,
    startBattle,
    isPlayerRegistered,
    hasActiveBand
  } = useSpacetimeData()

  // Farcaster SDK initialization
  useEffect(() => {
    const tryAddMiniApp = async () => {
      try {
        await addMiniApp()
      } catch (error) {
        console.error('Failed to add mini app:', error)
      }
    }

    tryAddMiniApp()
  }, [addMiniApp])

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (document.readyState !== 'complete') {
          await new Promise<void>(resolve => {
            if (document.readyState === 'complete') {
              resolve()
            } else {
              window.addEventListener('load', () => resolve(), { once: true })
            }
          })
        }

        await sdk.actions.ready()
        console.log('Farcaster SDK initialized successfully - app fully loaded')
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error)
        
        setTimeout(async () => {
          try {
            await sdk.actions.ready()
            console.log('Farcaster SDK initialized on retry')
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError)
          }
        }, 1000)
      }
    }

    initializeFarcaster()
  }, [])

  // Auto-navigate to appropriate tab
  useEffect(() => {
    if (player && !hasActiveBand) {
      setActiveTab('band')
    }
  }, [player, hasActiveBand])

  const getCharacterEmoji = (style: string) => {
    switch (style) {
      case 'classic': return '🎸'
      case 'punk': return '🏴'
      case 'metal': return '⚡'
      case 'indie': return '🎵'
      case 'electronic': return '🎛️'
      default: return '🎭'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-blue-400 bg-blue-900/20">
          <CardContent className="p-8">
            <div className="text-6xl mb-4 animate-bounce">🎸</div>
            <h1 className="text-2xl font-bold text-white mb-4">Rock Legends</h1>
            <div className="space-y-2 text-blue-200">
              <p>Loading your musical journey...</p>
              <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-red-400 bg-red-900/20">
          <CardContent className="p-8">
            <div className="text-6xl mb-4">💔</div>
            <h1 className="text-2xl font-bold text-white mb-4">Connection Error</h1>
            <div className="space-y-3 text-red-200">
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Wallet not connected
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute top-4 right-4 z-10">
          <WalletConnectButton />
        </div>
        
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center border-blue-400 bg-blue-900/20 backdrop-blur">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🎸</div>
              <h1 className="text-3xl font-bold text-white mb-4">Rock Legends</h1>
              <p className="text-blue-200 mb-6">
                The Ultimate Onchain Band Management Game
              </p>
              
              <div className="space-y-4 text-blue-200 text-sm">
                <div className="flex items-center space-x-2">
                  <span>🎤</span>
                  <span>Create unique characters and solo careers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎵</span>
                  <span>Form bands and battle other musicians</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Earn Rock Tokens and climb the rankings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🏆</span>
                  <span>Compete in weekly tournaments</span>
                </div>
              </div>
              
              <div className="mt-8">
                <WalletConnectButton />
              </div>
              
              <div className="mt-4 text-xs text-blue-300">
                Built on Base • Powered by SpacetimeDB
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Character creation flow
  if (!isPlayerRegistered) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <WalletConnectButton />
        </div>
        <CharacterCreation 
          onCreateCharacter={registerPlayer}
          isLoading={loading}
        />
      </div>
    )
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎸</div>
              <div>
                <h1 className="text-2xl font-bold">Rock Legends</h1>
                <p className="text-purple-200 text-sm">
                  Onchain Band Management Game
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {player && (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    {player.profile_picture ? (
                      <AvatarImage src={player.profile_picture} alt={player.username} />
                    ) : (
                      <AvatarFallback 
                        className="text-lg"
                        style={{ 
                          backgroundColor: player.character_color,
                          color: 'white'
                        }}
                      >
                        {getCharacterEmoji(player.character_style)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-right">
                    <p className="font-semibold">{player.username}</p>
                    <div className="flex items-center space-x-3 text-sm text-purple-200">
                      <span>Level {player.level}</span>
                      <span>💰 ${player.total_earnings.toLocaleString()}</span>
                      <span className="text-yellow-200">🎵 {player.rock_tokens} Tokens</span>
                    </div>
                  </div>
                </div>
              )}
              <WalletConnectButton className="min-w-[120px]" />
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500">
                🟢 Connected to Base
              </Badge>
              {player && (
                <span className="text-gray-600">
                  {CHARACTER_STYLES[player.character_style]?.name} Artist
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {playerBand && (
                <Badge className="bg-purple-500">
                  🎵 {playerBand.name}
                </Badge>
              )}
              <span className="text-gray-500">
                🏟️ Stage {player?.solo_career_stage || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="solo" className="text-lg">
              🎤 Solo Career
            </TabsTrigger>
            <TabsTrigger value="band" className="text-lg">
              🎵 Band
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="text-lg">
              🏆 Tournaments
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-lg">
              📊 Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solo">
            {player && (
              <SoloCareer
                player={player}
                onPerformSolo={performSolo}
                isLoading={loading}
              />
            )}
          </TabsContent>

          <TabsContent value="band">
            {player && (
              <BandManagement
                player={player}
                playerBand={playerBand}
                allBands={allBands}
                onCreateBand={createBand}
                onJoinBand={joinBand}
                onStartBattle={startBattle}
                isLoading={loading}
              />
            )}
          </TabsContent>

          <TabsContent value="tournaments">
            <Tournaments
              tournaments={activeTournaments}
              recentBattles={recentBattles}
              playerBand={playerBand}
              isLoading={loading}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Your Progress</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Experience Points:</span>
                      <span className="font-semibold">{player?.experience || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Earnings:</span>
                      <span className="font-semibold text-green-600">
                        ${(player?.total_earnings || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rock Tokens:</span>
                      <span className="font-semibold text-purple-600">
                        {player?.rock_tokens || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Solo Performances:</span>
                      <span className="font-semibold">{player?.total_solo_performances || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Instruments Owned:</span>
                      <span className="font-semibold">{player?.instruments_owned.length || 1}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Band Stats */}
              {playerBand && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Band Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Band Power:</span>
                        <span className="font-semibold text-purple-600">{playerBand.total_power}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Victories:</span>
                        <span className="font-semibold text-green-600">{playerBand.total_wins}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Defeats:</span>
                        <span className="font-semibold text-red-600">{playerBand.total_losses}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Win Rate:</span>
                        <span className="font-semibold">
                          {playerBand.total_wins + playerBand.total_losses > 0
                            ? Math.round((playerBand.total_wins / (playerBand.total_wins + playerBand.total_losses)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tokens Earned:</span>
                        <span className="font-semibold text-yellow-600">{playerBand.rock_tokens_earned}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-4">
            <div className="flex justify-center items-center space-x-2 text-xl">
              <span>🎸</span>
              <span className="font-bold">Rock Legends</span>
              <span>⚡</span>
            </div>
            <p className="text-gray-400">
              The Ultimate Onchain Band Management Game
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>🎤 Solo Career Mode</span>
              <span>🎵 Band Management</span>
              <span>💰 Rock Token Economy</span>
              <span>🏆 Weekly Tournaments</span>
              <span>⚡ Built on Base</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
