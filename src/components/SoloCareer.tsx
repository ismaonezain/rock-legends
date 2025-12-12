'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Player } from '@/types/game'
import { SOLO_STAGES, INSTRUMENTS } from '@/types/game'

interface SoloCareerProps {
  player: Player
  onPerformSolo: (stageNumber: number) => Promise<{
    earnings: number
    experienceGained: number
    tokensEarned: number
    performanceQuality: number
    leveledUp: boolean
    newLevel: number
    instrumentReward: string | null
    stageAdvanced: boolean
  }>
  isLoading?: boolean
}

export function SoloCareer({ player, onPerformSolo, isLoading = false }: SoloCareerProps) {
  const [selectedStage, setSelectedStage] = useState<number>(player.solo_career_stage)
  const [performanceResult, setPerformanceResult] = useState<any>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)

  const handlePerformance = async (stageNumber: number) => {
    try {
      const result = await onPerformSolo(stageNumber)
      setPerformanceResult(result)
      setShowResultDialog(true)
    } catch (error) {
      console.error('Performance failed:', error)
    }
  }

  const getStageStatus = (stageNumber: number) => {
    if (stageNumber < player.solo_career_stage) return 'completed'
    if (stageNumber === player.solo_career_stage) return 'current'
    if (stageNumber === player.solo_career_stage + 1 && player.level >= SOLO_STAGES[stageNumber - 1]?.required_level) return 'available'
    return 'locked'
  }

  const getInstrumentRewardInfo = (instrumentId: string | null) => {
    if (!instrumentId) return null
    return INSTRUMENTS.find(i => i.id === instrumentId)
  }

  const experienceToNextLevel = (player.level * 1000) - player.experience
  const experienceProgress = (player.experience % 1000) / 1000 * 100

  return (
    <div className="space-y-6">
      {/* Player Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🎤</span>
            <span>Solo Career Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Level Progress</span>
                <span className="text-sm font-medium">{player.level}</span>
              </div>
              <Progress value={experienceProgress} className="h-2" />
              <p className="text-xs text-gray-500">
                {experienceToNextLevel} XP to level {player.level + 1}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${player.total_earnings.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{player.total_solo_performances}</div>
              <p className="text-sm text-gray-600">Solo Performances</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Instruments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🎸</span>
            <span>Your Instruments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {player.instruments_owned.map(instrumentId => {
              const instrument = INSTRUMENTS.find(i => i.id === instrumentId)
              if (!instrument) return null
              
              return (
                <Card 
                  key={instrument.id}
                  className={`border-2 ${
                    player.current_instrument === instrument.id 
                      ? 'border-yellow-400 bg-yellow-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{instrument.name}</h4>
                      {player.current_instrument === instrument.id && (
                        <Badge className="bg-yellow-500">Equipped</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Power Boost:</span>
                        <span className="font-medium text-green-600">+{instrument.power_boost}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Rarity:</span>
                        <Badge className={
                          instrument.rarity === 'legendary' ? 'bg-purple-600' :
                          instrument.rarity === 'epic' ? 'bg-blue-600' :
                          instrument.rarity === 'rare' ? 'bg-green-600' :
                          'bg-gray-600'
                        }>
                          {instrument.rarity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{instrument.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Solo Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🏟️</span>
            <span>Performance Venues</span>
          </CardTitle>
          <p className="text-gray-600">
            Progress through different venues to earn money, experience, and unlock new instruments
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOLO_STAGES.map(stage => {
              const status = getStageStatus(stage.stage_number)
              const instrumentReward = getInstrumentRewardInfo(stage.instrument_reward)
              
              return (
                <Card 
                  key={stage.id}
                  className={`border-2 transition-all ${
                    status === 'current' ? 'border-blue-400 bg-blue-50' :
                    status === 'completed' ? 'border-green-400 bg-green-50' :
                    status === 'available' ? 'border-yellow-400 bg-yellow-50 hover:border-yellow-500' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold">{stage.stage_name}</h4>
                          <Badge className={
                            status === 'current' ? 'bg-blue-600' :
                            status === 'completed' ? 'bg-green-600' :
                            status === 'available' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          }>
                            {status === 'current' ? 'Current' :
                             status === 'completed' ? 'Completed' :
                             status === 'available' ? 'Available' : 'Locked'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{stage.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${stage.base_earnings}
                        </div>
                        <div className="text-xs text-gray-500">Base earnings</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{stage.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Required Level:</span>
                        <span className={player.level >= stage.required_level ? 'text-green-600' : 'text-red-500'}>
                          Level {stage.required_level}
                        </span>
                      </div>
                      
                      {instrumentReward && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Instrument Reward:</span>
                          <Badge className="bg-purple-600 text-xs">
                            {instrumentReward.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      {status === 'available' || status === 'current' ? (
                        <Button
                          onClick={() => handlePerformance(stage.stage_number)}
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? '🎵 Performing...' : '🎤 Perform Here'}
                        </Button>
                      ) : status === 'completed' ? (
                        <Button
                          onClick={() => handlePerformance(stage.stage_number)}
                          disabled={isLoading}
                          variant="outline"
                          className="w-full"
                        >
                          {isLoading ? '🎵 Performing...' : '🔄 Perform Again'}
                        </Button>
                      ) : (
                        <Button disabled className="w-full" variant="secondary">
                          🔒 Locked (Level {stage.required_level} required)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Result Dialog */}
      {performanceResult && (
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span className="text-2xl">🎵</span>
                <span>Performance Complete!</span>
              </DialogTitle>
              <DialogDescription>
                Here are your performance results
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Performance Quality */}
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {performanceResult.performanceQuality >= 95 ? '🌟' :
                   performanceResult.performanceQuality >= 85 ? '⭐' :
                   performanceResult.performanceQuality >= 75 ? '🎭' : '🎵'}
                </div>
                <div className="text-lg font-bold">
                  {performanceResult.performanceQuality}% Performance
                </div>
                <p className="text-sm text-gray-600">
                  {performanceResult.performanceQuality >= 95 ? 'Legendary!' :
                   performanceResult.performanceQuality >= 85 ? 'Excellent!' :
                   performanceResult.performanceQuality >= 75 ? 'Great!' : 'Good!'}
                </p>
              </div>
              
              {/* Rewards */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-green-600">
                    ${performanceResult.earnings}
                  </div>
                  <p className="text-xs text-gray-600">Earnings</p>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-blue-600">
                    {performanceResult.experienceGained}
                  </div>
                  <p className="text-xs text-gray-600">Experience</p>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-purple-600">
                    {performanceResult.tokensEarned}
                  </div>
                  <p className="text-xs text-gray-600">Rock Tokens</p>
                </div>
              </div>
              
              {/* Special Rewards */}
              {(performanceResult.leveledUp || performanceResult.instrumentReward || performanceResult.stageAdvanced) && (
                <div className="space-y-2 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <h4 className="font-bold text-yellow-800">🎉 Special Rewards!</h4>
                  {performanceResult.leveledUp && (
                    <p className="text-sm text-yellow-700">
                      📈 Level Up! You're now level {performanceResult.newLevel}
                    </p>
                  )}
                  {performanceResult.instrumentReward && (
                    <p className="text-sm text-yellow-700">
                      🎸 New Instrument: {INSTRUMENTS.find(i => i.id === performanceResult.instrumentReward)?.name}
                    </p>
                  )}
                  {performanceResult.stageAdvanced && (
                    <p className="text-sm text-yellow-700">
                      🏟️ New venue unlocked! Check out your next stage
                    </p>
                  )}
                </div>
              )}
              
              <Button 
                onClick={() => setShowResultDialog(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue Rocking! 🤘
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
