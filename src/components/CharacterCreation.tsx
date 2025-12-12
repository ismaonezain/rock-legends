'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CharacterCustomization, CharacterStyle } from '@/types/game'
import type { InstrumentRole } from '@/types/instruments'
import { INSTRUMENT_ROLES, INSTRUMENT_CATEGORIES, getInstrumentsByCategory } from '@/types/instruments'
import { CHARACTER_STYLES } from '@/types/game'

interface CharacterCreationProps {
  onCreateCharacter: (username: string, customization: CharacterCustomization, profilePicture?: string) => Promise<void>
  isLoading?: boolean
}

export function CharacterCreation({ onCreateCharacter, isLoading = false }: CharacterCreationProps) {
  const [username, setUsername] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentRole | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<CharacterStyle | null>(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([])
  const [backstory, setBackstory] = useState('')
  const [currentStep, setCurrentStep] = useState(1)

  const handleInstrumentSelect = (instrument: InstrumentRole) => {
    setSelectedInstrument(instrument)
    // Auto-suggest compatible styles based on instrument
    const instrumentInfo = INSTRUMENT_ROLES[instrument]
    if (instrumentInfo.styles.includes('rock')) {
      setSelectedStyle('classic')
    } else if (instrumentInfo.styles.includes('electronic')) {
      setSelectedStyle('electronic')
    } else if (instrumentInfo.styles.includes('classical')) {
      setSelectedStyle('indie')
    } else {
      setSelectedStyle('classic')
    }
    setCurrentStep(3)
  }

  const handleStyleSelect = (style: CharacterStyle) => {
    setSelectedStyle(style)
    setSelectedColor(CHARACTER_STYLES[style].colors[0])
    setSelectedAccessories([])
    setCurrentStep(4)
  }

  const handleAccessoryToggle = (accessory: string) => {
    setSelectedAccessories(prev => 
      prev.includes(accessory) 
        ? prev.filter(a => a !== accessory)
        : [...prev, accessory]
    )
  }

  const handleSubmit = async () => {
    if (!username.trim() || !selectedInstrument || !selectedStyle || !selectedColor) {
      return
    }

    const customization: CharacterCustomization = {
      style: selectedStyle,
      color: selectedColor,
      accessories: selectedAccessories,
      primaryInstrument: selectedInstrument,
      backstory: backstory.trim() || undefined
    }

    await onCreateCharacter(username.trim(), customization, profilePicture.trim() || undefined)
  }

  const canProceed = () => {
    return username.trim() && selectedInstrument && selectedStyle && selectedColor
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl border-blue-400 bg-blue-900/20 backdrop-blur">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎸</div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Create Your Rock Legend
          </CardTitle>
          <p className="text-blue-200">
            Choose your instrument and build your unique musical character
          </p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Step 1: Basic Info */}
          {currentStep >= 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-blue-600">Step 1</Badge>
                <h3 className="text-xl font-semibold text-white">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-blue-200">
                    Stage Name / Username *
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your stage name..."
                    className="bg-blue-800/30 border-blue-400 text-white placeholder:text-blue-300"
                    maxLength={20}
                  />
                  <p className="text-xs text-blue-300">
                    This will be your identity in the Rock Legends universe
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-blue-200">
                    Profile Picture URL (Optional)
                  </Label>
                  <Input
                    id="profilePicture"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    placeholder="https://example.com/your-avatar.jpg"
                    className="bg-blue-800/30 border-blue-400 text-white placeholder:text-blue-300"
                  />
                  <p className="text-xs text-blue-300">
                    Add a custom avatar image
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Instrument Selection */}
          {currentStep >= 1 && username.trim() && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-purple-600">Step 2</Badge>
                <h3 className="text-xl font-semibold text-white">Choose Your Primary Instrument</h3>
              </div>
              
              <Tabs defaultValue="core" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-blue-800/50">
                  {Object.entries(INSTRUMENT_CATEGORIES).map(([key, category]) => (
                    <TabsTrigger key={key} value={key} className="data-[state=active]:bg-blue-600">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(INSTRUMENT_CATEGORIES).map(([categoryKey, category]) => (
                  <TabsContent key={categoryKey} value={categoryKey} className="mt-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-white" style={{ color: category.color }}>
                        {category.name}
                      </h4>
                      <p className="text-sm text-blue-300">{category.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getInstrumentsByCategory(categoryKey as keyof typeof INSTRUMENT_CATEGORIES).map((instrument) => (
                        <Card 
                          key={instrument.id}
                          className={`cursor-pointer transition-all border-2 hover:scale-105 ${
                            selectedInstrument === instrument.id 
                              ? 'border-yellow-400 bg-yellow-400/10' 
                              : 'border-gray-600 bg-gray-800/30 hover:border-blue-400'
                          }`}
                          onClick={() => handleInstrumentSelect(instrument.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-4xl mb-2">{instrument.icon}</div>
                            <h4 className="font-bold text-white mb-1">{instrument.name}</h4>
                            <p className="text-sm text-gray-300 mb-2">{instrument.description}</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {instrument.styles.slice(0, 3).map(style => (
                                <Badge key={style} className="text-xs bg-blue-600/70">
                                  {style}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-2">
                              <Badge 
                                className="text-xs" 
                                style={{ backgroundColor: category.color }}
                              >
                                Base Power: {instrument.powerBase}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* Step 3: Character Style Selection */}
          {selectedInstrument && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-green-600">Step 3</Badge>
                <h3 className="text-xl font-semibold text-white">Choose Your Style</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-blue-200">
                  Selected: <span className="text-yellow-400 font-semibold">
                    {INSTRUMENT_ROLES[selectedInstrument].icon} {INSTRUMENT_ROLES[selectedInstrument].name}
                  </span>
                </p>
                <p className="text-sm text-blue-300">Now choose a visual style that matches your musical personality</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CHARACTER_STYLES).map(([key, style]) => {
                  const instrumentInfo = INSTRUMENT_ROLES[selectedInstrument]
                  const isRecommended = instrumentInfo.styles.some(instStyle => 
                    key === 'classic' && instStyle === 'rock' ||
                    key === 'electronic' && instStyle === 'electronic' ||
                    key === 'indie' && instStyle === 'classical' ||
                    key === 'punk' && instStyle === 'punk' ||
                    key === 'metal' && instStyle === 'metal'
                  )
                  
                  return (
                    <Card 
                      key={key}
                      className={`cursor-pointer transition-all border-2 hover:scale-105 ${
                        selectedStyle === key 
                          ? 'border-yellow-400 bg-yellow-400/10' 
                          : 'border-gray-600 bg-gray-800/30 hover:border-blue-400'
                      } ${isRecommended ? 'ring-2 ring-green-400/50' : ''}`}
                      onClick={() => handleStyleSelect(key as CharacterStyle)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">
                          {key === 'classic' && '🎸'}
                          {key === 'punk' && '🏴'}
                          {key === 'metal' && '⚡'}
                          {key === 'indie' && '🎵'}
                          {key === 'electronic' && '🎛️'}
                        </div>
                        <h4 className="font-bold text-white mb-1">
                          {style.name}
                          {isRecommended && <span className="text-green-400 ml-1">★</span>}
                        </h4>
                        <p className="text-sm text-gray-300 mb-2">{style.description}</p>
                        <p className="text-xs text-blue-300">{style.personality}</p>
                        {isRecommended && (
                          <Badge className="mt-1 bg-green-600 text-xs">Recommended</Badge>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 4: Customization */}
          {selectedStyle && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-yellow-600">Step 4</Badge>
                <h3 className="text-xl font-semibold text-white">Customize Appearance</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Color Selection */}
                <div className="space-y-4">
                  <Label className="text-blue-200 font-semibold">
                    Character Color Scheme
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {CHARACTER_STYLES[selectedStyle].colors.map((color, index) => (
                      <button
                        key={color}
                        className={`w-12 h-12 rounded-lg border-2 transition-transform hover:scale-110 ${
                          selectedColor === color 
                            ? 'border-white ring-2 ring-yellow-400' 
                            : 'border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        title={`Color option ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div className="space-y-4">
                  <Label className="text-blue-200 font-semibold">
                    Accessories & Style Items
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHARACTER_STYLES[selectedStyle].accessories.map((accessory) => (
                      <div key={accessory} className="flex items-center space-x-2">
                        <Checkbox
                          id={accessory}
                          checked={selectedAccessories.includes(accessory)}
                          onCheckedChange={() => handleAccessoryToggle(accessory)}
                          className="border-blue-400"
                        />
                        <Label 
                          htmlFor={accessory}
                          className="text-blue-200 text-sm capitalize cursor-pointer"
                        >
                          {accessory.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Backstory */}
              <div className="space-y-4">
                <Label htmlFor="backstory" className="text-blue-200 font-semibold">
                  Character Backstory (Optional)
                </Label>
                <Textarea
                  id="backstory"
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="Tell us about your musical journey, inspirations, or dreams..."
                  className="bg-blue-800/30 border-blue-400 text-white placeholder:text-blue-300"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-blue-300">
                  {backstory.length}/200 characters - Add personality to your legend
                </p>
              </div>
            </div>
          )}

          {/* Character Preview */}
          {selectedInstrument && selectedStyle && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Character Preview</h3>
              <Card className="bg-gradient-to-r from-gray-800/50 to-blue-800/50 border-blue-400">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border-4"
                      style={{ 
                        backgroundColor: selectedColor || '#B45309',
                        borderColor: selectedColor || '#B45309',
                        filter: 'brightness(1.2)'
                      }}
                    >
                      {INSTRUMENT_ROLES[selectedInstrument].icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white">{username || 'Your Name'}</h4>
                      <p className="text-blue-200">
                        {INSTRUMENT_ROLES[selectedInstrument].name} • {CHARACTER_STYLES[selectedStyle].name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge className="bg-purple-600 text-xs">
                          Power: {INSTRUMENT_ROLES[selectedInstrument].powerBase}
                        </Badge>
                        {selectedAccessories.map(accessory => (
                          <Badge key={accessory} className="bg-blue-600 text-xs">
                            {accessory.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                      {backstory && (
                        <p className="text-sm text-gray-300 mt-2 italic">{backstory}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-3"
            >
              {isLoading ? 'Creating Your Legend...' : '🎸 Start Your Musical Journey!'}
            </Button>
          </div>

          <div className="text-center text-blue-300 text-sm">
            <p>🎵 Once created, you'll start with:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <Badge className="bg-green-600">2000 Rock Tokens</Badge>
              <Badge className="bg-blue-600">Basic {INSTRUMENT_ROLES[selectedInstrument || 'guitarist'].name} Gear</Badge>
              <Badge className="bg-purple-600">Street Corner Stage</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
