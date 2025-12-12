'use client'

import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Support both Base mainnet and testnet
const chains = [base, baseSepolia] as const

export const config = createConfig({
  chains,
  connectors: [
    // Farcaster mini app connector
    farcasterMiniApp(),
    
    // Injected browser wallets (MetaMask, Coinbase, Brave, etc)
    injected({
      target: () => {
        if (typeof window === 'undefined') return undefined
        
        // Check for various injected wallet providers
        if (window.ethereum) {
          return {
            id: 'injected',
            name: 'Browser Wallet',
            provider: window.ethereum,
          }
        }
        
        return undefined
      },
    }),
    
    // WalletConnect for mobile wallets
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
      metadata: {
        name: 'Rock Legends',
        description: 'Onchain band management game',
        url: 'https://rocklegends.vercel.app',
        icons: ['https://rocklegends.vercel.app/icon.png'],
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: false,
})
