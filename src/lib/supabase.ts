'use client'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { setupSupabase } from '@/lib/supabase-setup'

// Production Supabase configuration - set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Initialize setup check
const isConfigured = setupSupabase()

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Return a mock client for server-side rendering
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured for server-side use' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured for server-side use' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured for server-side use' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured for server-side use' } }),
        eq: function() { return this },
        single: function() { return this },
        limit: function() { return this },
        order: function() { return this },
        in: function() { return this }
      })
    } as any
  }

  if (!supabaseClient) {
    // Only create real client on client-side
    try {
      if (!supabaseUrl || !supabaseAnonKey || !isConfigured) {
        console.warn('🔧 Supabase not configured. Using demo mode.')
        console.log('📋 To setup Supabase:')
        console.log('1. Create project at https://app.supabase.com')
        console.log('2. Add environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
        console.log('3. Run the database schema from /lib/supabase-setup.ts')
        
        // Return enhanced demo client with better mock data
        supabaseClient = createDemoClient()
      } else {
        // Create real Supabase client with optimal settings for gaming
        supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          },
          db: {
            schema: 'public'
          }
        })
        
        console.log('🎸 Supabase connected successfully!')
      }
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error)
      // Return enhanced demo client as fallback
      supabaseClient = createDemoClient()
    }
  }

  return supabaseClient
}

// Enhanced demo client with better mock functionality
const createDemoClient = () => {
  return {
    from: (table: string) => ({
      select: (query: string = '*') => {
        // Return mock data based on table
        if (table === 'players') {
          return Promise.resolve({ 
            data: [], 
            error: null 
          })
        }
        return Promise.resolve({ 
          data: null, 
          error: { message: `🎮 Demo mode: Connect Supabase for full functionality` } 
        })
      },
      insert: (data: any) => {
        console.log(`🎸 Demo: Would insert into ${table}:`, data)
        return Promise.resolve({ 
          data: { id: 'demo-' + Math.random().toString(36).substr(2, 9), ...data }, 
          error: null 
        })
      },
      update: (data: any) => {
        console.log(`🎸 Demo: Would update ${table}:`, data)
        return Promise.resolve({ 
          data: { ...data }, 
          error: null 
        })
      },
      delete: () => {
        console.log(`🎸 Demo: Would delete from ${table}`)
        return Promise.resolve({ 
          data: null, 
          error: null 
        })
      },
      eq: function(column: string, value: any) { return this },
      single: function() { return this },
      limit: function(count: number) { return this },
      order: function(column: string, options?: any) { return this },
      in: function(column: string, values: any[]) { return this }
    }),
    channel: (name: string) => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => ({})
    }),
    removeAllChannels: () => {}
  } as any
}

export const supabase = getSupabaseClient()
export { setupSupabase } from '@/lib/supabase-setup'
