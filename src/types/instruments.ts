export type InstrumentRole = 
  | 'singer' 
  | 'guitarist' 
  | 'bassist'
  | 'drummer' 
  | 'keyboardist'
  | 'violinist'
  | 'saxophonist'
  | 'trumpeter'
  | 'flautist'
  | 'cellist'
  | 'pianist'
  | 'harmonica_player'
  | 'djay_producer'

export interface InstrumentRoleInfo {
  id: InstrumentRole
  name: string
  icon: string
  description: string
  category: 'core' | 'strings' | 'brass' | 'woodwind' | 'electronic'
  powerBase: number
  styles: string[]
  bandLimits: {
    max: number
    min: number
  }
}

export const INSTRUMENT_ROLES: Record<InstrumentRole, InstrumentRoleInfo> = {
  // Core Band Members
  singer: {
    id: 'singer',
    name: 'Lead Singer',
    icon: '🎤',
    description: 'The voice of the band, commanding the stage with powerful vocals',
    category: 'core',
    powerBase: 100,
    styles: ['pop', 'rock', 'metal', 'indie', 'punk', 'jazz'],
    bandLimits: { max: 2, min: 0 }
  },
  guitarist: {
    id: 'guitarist', 
    name: 'Guitarist',
    icon: '🎸',
    description: 'Master of strings, creating melodies and driving rhythms',
    category: 'core',
    powerBase: 90,
    styles: ['rock', 'metal', 'blues', 'indie', 'punk', 'jazz'],
    bandLimits: { max: 3, min: 0 }
  },
  bassist: {
    id: 'bassist',
    name: 'Bassist',
    icon: '🎸',
    description: 'Foundation of the rhythm section, laying down the groove',
    category: 'core', 
    powerBase: 85,
    styles: ['rock', 'metal', 'funk', 'jazz', 'punk', 'reggae'],
    bandLimits: { max: 1, min: 0 }
  },
  drummer: {
    id: 'drummer',
    name: 'Drummer',
    icon: '🥁',
    description: 'Keeper of the beat, driving the rhythm of every song',
    category: 'core',
    powerBase: 95,
    styles: ['rock', 'metal', 'jazz', 'punk', 'electronic', 'funk'],
    bandLimits: { max: 1, min: 0 }
  },

  // Keyboard & Piano
  keyboardist: {
    id: 'keyboardist',
    name: 'Keyboardist',
    icon: '🎹',
    description: 'Versatile musician adding harmony, melody, and electronic sounds',
    category: 'electronic',
    powerBase: 80,
    styles: ['electronic', 'pop', 'rock', 'jazz', 'classical'],
    bandLimits: { max: 2, min: 0 }
  },
  pianist: {
    id: 'pianist',
    name: 'Pianist',
    icon: '🎹',
    description: 'Classical and contemporary piano mastery for sophisticated sound',
    category: 'electronic',
    powerBase: 85,
    styles: ['classical', 'jazz', 'indie', 'ballad', 'blues'],
    bandLimits: { max: 1, min: 0 }
  },

  // String Instruments
  violinist: {
    id: 'violinist',
    name: 'Violinist',
    icon: '🎻',
    description: 'Elegant string player bringing classical beauty to any genre',
    category: 'strings',
    powerBase: 75,
    styles: ['classical', 'folk', 'indie', 'metal', 'country'],
    bandLimits: { max: 2, min: 0 }
  },
  cellist: {
    id: 'cellist',
    name: 'Cellist',
    icon: '🎻',
    description: 'Deep, resonant strings adding rich harmonic foundation',
    category: 'strings',
    powerBase: 70,
    styles: ['classical', 'folk', 'indie', 'metal', 'ambient'],
    bandLimits: { max: 1, min: 0 }
  },

  // Brass Instruments  
  trumpeter: {
    id: 'trumpeter',
    name: 'Trumpeter',
    icon: '🎺',
    description: 'Bright, bold brass bringing power and melody to the mix',
    category: 'brass',
    powerBase: 70,
    styles: ['jazz', 'funk', 'latin', 'ska', 'classical'],
    bandLimits: { max: 2, min: 0 }
  },
  saxophonist: {
    id: 'saxophonist', 
    name: 'Saxophonist',
    icon: '🎷',
    description: 'Smooth saxophone adding soul and sophistication',
    category: 'brass',
    powerBase: 75,
    styles: ['jazz', 'funk', 'blues', 'rock', 'pop'],
    bandLimits: { max: 2, min: 0 }
  },

  // Woodwind
  flautist: {
    id: 'flautist',
    name: 'Flutist',
    icon: '🪈',
    description: 'Ethereal wind instrument creating atmospheric melodies',
    category: 'woodwind',
    powerBase: 65,
    styles: ['classical', 'folk', 'indie', 'ambient', 'world'],
    bandLimits: { max: 2, min: 0 }
  },

  // Unique Instruments
  harmonica_player: {
    id: 'harmonica_player',
    name: 'Harmonica Player',
    icon: '🎵',
    description: 'Soulful harmonica adding blues and folk authenticity',
    category: 'woodwind',
    powerBase: 60,
    styles: ['blues', 'folk', 'country', 'rock', 'indie'],
    bandLimits: { max: 1, min: 0 }
  },
  djay_producer: {
    id: 'djay_producer',
    name: 'DJ/Producer',
    icon: '🎧',
    description: 'Electronic music specialist with turntables and digital production',
    category: 'electronic',
    powerBase: 90,
    styles: ['electronic', 'hip-hop', 'house', 'techno', 'dubstep'],
    bandLimits: { max: 1, min: 0 }
  }
}

export const INSTRUMENT_CATEGORIES = {
  core: {
    name: 'Core Band Members',
    description: 'Essential roles for any rock band',
    color: '#DC2626'
  },
  strings: {
    name: 'String Instruments',  
    description: 'Classical and modern string instruments',
    color: '#059669'
  },
  brass: {
    name: 'Brass Instruments',
    description: 'Powerful brass section instruments', 
    color: '#D97706'
  },
  woodwind: {
    name: 'Woodwind Instruments',
    description: 'Wind instruments for atmospheric sounds',
    color: '#7C3AED'
  },
  electronic: {
    name: 'Electronic & Keys',
    description: 'Modern electronic and keyboard instruments',
    color: '#06B6D4'
  }
}

// Helper functions
export const getInstrumentsByCategory = (category: keyof typeof INSTRUMENT_CATEGORIES): InstrumentRoleInfo[] => {
  return Object.values(INSTRUMENT_ROLES).filter(role => role.category === category)
}

export const getBandRoleValidation = (members: { role: InstrumentRole }[]): { 
  isValid: boolean
  errors: string[] 
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []
  const roleCounts = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1
    return acc
  }, {} as Record<InstrumentRole, number>)

  // Check limits for each role
  Object.entries(roleCounts).forEach(([role, count]) => {
    const roleInfo = INSTRUMENT_ROLES[role as InstrumentRole]
    if (count > roleInfo.bandLimits.max) {
      errors.push(`Too many ${roleInfo.name}s: ${count}/${roleInfo.bandLimits.max} maximum`)
    }
  })

  // Check for core band composition warnings
  if (!roleCounts.drummer) {
    warnings.push('Consider adding a drummer for better rhythm section')
  }
  if (!roleCounts.bassist) {
    warnings.push('A bassist would strengthen your rhythm foundation')  
  }
  if (!roleCounts.singer && !roleCounts.guitarist) {
    warnings.push('Your band needs either a singer or guitarist for melodies')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
