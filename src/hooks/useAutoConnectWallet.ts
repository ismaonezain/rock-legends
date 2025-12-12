'use client'

import { useEffect, useCallback } from 'react'
import { useAccount, useConnect, useReconnect } from 'wagmi'

interface UseAutoConnectWalletOptions {
  autoConnect?: boolean
  onConnect?: (address: string) => void
  onDisconnect?: () => void
}

export function useAutoConnectWallet({ 
  autoConnect = true, 
  onConnect, 
  onDisconnect 
}: UseAutoConnectWalletOptions = {}) {
  const { address, isConnected, status } = useAccount()
  const { connect, connectors } = useConnect()
  const { reconnect } = useReconnect()

  // Handle connection state changes
  useEffect(() => {
    if (isConnected && address && onConnect) {
      onConnect(address)
    }
    
    if (!isConnected && onDisconnect) {
      onDisconnect()
    }
  }, [isConnected, address, onConnect, onDisconnect])

  // Auto-reconnect on page load
  useEffect(() => {
    if (autoConnect && !isConnected && status === 'disconnected') {
      reconnect()
    }
  }, [autoConnect, isConnected, status, reconnect])

  // Auto-connect if Farcaster context is available
  const connectToFarcaster = useCallback(async (): Promise<void> => {
    try {
      const farcasterConnector = connectors.find(c => c.id === 'farcaster')
      if (farcasterConnector && !isConnected) {
        await connect({ connector: farcasterConnector })
      }
    } catch (error: unknown) {
      console.warn('Failed to auto-connect to Farcaster:', error)
    }
  }, [connectors, connect, isConnected])

  // Auto-connect to injected wallet if previously connected
  const connectToInjected = useCallback(async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.ethereum && !isConnected) {
        const injectedConnector = connectors.find(c => c.type === 'injected')
        if (injectedConnector) {
          await connect({ connector: injectedConnector })
        }
      }
    } catch (error: unknown) {
      console.warn('Failed to auto-connect to injected wallet:', error)
    }
  }, [connectors, connect, isConnected])

  // Check for auto-connect opportunities
  useEffect(() => {
    if (!autoConnect || isConnected) return

    const timer = setTimeout(() => {
      // Try Farcaster first
      connectToFarcaster()
    }, 1000)

    return () => clearTimeout(timer)
  }, [autoConnect, isConnected, connectToFarcaster])

  return {
    address,
    isConnected,
    status,
    isConnecting: status === 'connecting',
    isReconnecting: status === 'reconnecting',
    connectToFarcaster,
    connectToInjected,
  }
}
