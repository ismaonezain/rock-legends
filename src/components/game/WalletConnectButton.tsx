'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface WalletConnectButtonProps {
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export function WalletConnectButton({ onConnect, onDisconnect, className }: WalletConnectButtonProps) {
  const { address, isConnected, status } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = async (): Promise<void> => {
    try {
      // Try Farcaster first if available
      const farcasterConnector = connectors.find(c => c.id === 'farcaster')
      if (farcasterConnector) {
        await connect({ connector: farcasterConnector })
        onConnect?.()
        return
      }

      // Then try injected wallet
      if (typeof window !== 'undefined' && window.ethereum) {
        const injectedConnector = connectors.find(c => c.type === 'injected')
        if (injectedConnector) {
          await connect({ connector: injectedConnector })
          onConnect?.()
          return
        }
      }

      // Finally WalletConnect
      const wcConnector = connectors.find(c => c.type === 'walletConnect')
      if (wcConnector) {
        await connect({ connector: wcConnector })
        onConnect?.()
        return
      }

      // Show error if no connector available
      alert('No wallet available. Please install a browser wallet or open in Farcaster.')
    } catch (error: unknown) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const handleDisconnect = async (): Promise<void> => {
    try {
      await disconnect()
      onDisconnect?.()
    } catch (error: unknown) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  if (isConnected && address) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`bg-green-50 border-green-400 hover:bg-green-100 ${className}`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{formatAddress(address)}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Wallet Address</p>
              <p className="text-xs text-gray-600 font-mono">{address}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-600">Base Network</Badge>
              <Badge className="bg-green-600">Connected</Badge>
            </div>
            <Button 
              onClick={handleDisconnect}
              variant="outline" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Disconnect Wallet
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Check available connection options
  const hasFarcaster = connectors.some(c => c.id === 'farcaster')
  const hasInjected = typeof window !== 'undefined' && window.ethereum
  const hasAnyWallet = hasFarcaster || hasInjected || connectors.length > 0

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        onClick={handleConnect}
        disabled={isPending || status === 'connecting' || !hasAnyWallet}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
      >
        {isPending || status === 'connecting' ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🎸</span>
            <span>Connect Wallet</span>
          </div>
        )}
      </Button>
      
      <Card className={`border-2 ${hasAnyWallet ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
        <CardContent className="p-3">
          <div className={`flex items-center space-x-2 text-sm ${hasAnyWallet ? 'text-green-800' : 'text-orange-800'}`}>
            <span>{hasAnyWallet ? '✅' : '⚠️'}</span>
            <span>
              {hasFarcaster 
                ? 'Farcaster wallet ready!' 
                : hasInjected 
                  ? 'Browser wallet detected!'
                  : 'Please install MetaMask or open in Farcaster.'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
