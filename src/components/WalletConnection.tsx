'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function WalletConnection() {
  const { address, isConnected, status } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="bg-green-50 border-green-400 hover:bg-green-100">
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
              <Badge className="bg-green-600">Base Network</Badge>
              <Badge className="bg-blue-600">Connected</Badge>
            </div>
            <Button 
              onClick={() => disconnect()}
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

  const handleConnect = async () => {
    // Check if injected wallet is available
    if (typeof window !== 'undefined' && window.ethereum) {
      const connector = connectors.find(c => c.type === 'injected')
      if (connector) {
        connect({ connector })
      }
    } else {
      // Show error message if no injected wallet found
      alert('Please install a browser wallet like MetaMask, Coinbase Wallet, or Brave Wallet to continue.')
    }
  }

  // Check if injected wallet is available
  const hasInjectedWallet = typeof window !== 'undefined' && window.ethereum

  return (
    <div className="space-y-2">
      <Button
        onClick={handleConnect}
        disabled={isPending || status === 'connecting' || !hasInjectedWallet}
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
            <span>🔗</span>
            <span>{hasInjectedWallet ? 'Connect Wallet' : 'Install Browser Wallet'}</span>
          </div>
        )}
      </Button>
      
      <Card className={`border-2 ${hasInjectedWallet ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
        <CardContent className="p-3">
          <div className={`flex items-center space-x-2 text-sm ${hasInjectedWallet ? 'text-green-800' : 'text-orange-800'}`}>
            <span>{hasInjectedWallet ? '✅' : '⚠️'}</span>
            <span>
              {hasInjectedWallet 
                ? 'Browser wallet detected! Ready to connect.' 
                : 'Please install MetaMask, Coinbase Wallet, or Brave Wallet.'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
