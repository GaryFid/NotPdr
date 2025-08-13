import { create } from 'zustand';
import { tonConnector } from '../lib/wallets/ton-connector';
import { solanaConnector } from '../lib/wallets/solana-connector';

interface WalletState {
  // TON
  tonAddress: string | null;
  tonBalance: number;
  isTonConnected: boolean;
  
  // Solana
  solanaAddress: string | null;
  solanaBalance: number;
  isSolanaConnected: boolean;
  
  // Общее
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connectTonWallet: () => Promise<void>;
  disconnectTonWallet: () => Promise<void>;
  connectSolanaWallet: () => Promise<void>;
  disconnectSolanaWallet: () => Promise<void>;
  updateBalances: () => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  tonAddress: null,
  tonBalance: 0,
  isTonConnected: false,
  
  solanaAddress: null,
  solanaBalance: 0,
  isSolanaConnected: false,
  
  isConnecting: false,
  error: null,
  
  // TON Actions
  connectTonWallet: async () => {
    set({ isConnecting: true, error: null });
    try {
      const wallet = await tonConnector.connect();
      set({
        tonAddress: wallet.address,
        isTonConnected: true,
        isConnecting: false,
      });
      // TODO: Получить баланс TON
    } catch (error: any) {
      set({
        error: error.message || 'Failed to connect TON wallet',
        isConnecting: false,
      });
    }
  },
  
  disconnectTonWallet: async () => {
    try {
      await tonConnector.disconnect();
      set({
        tonAddress: null,
        tonBalance: 0,
        isTonConnected: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to disconnect TON wallet' });
    }
  },
  
  // Solana Actions
  connectSolanaWallet: async () => {
    set({ isConnecting: true, error: null });
    try {
      const wallet = await solanaConnector.connect();
      set({
        solanaAddress: wallet.address,
        solanaBalance: wallet.balance,
        isSolanaConnected: true,
        isConnecting: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to connect Solana wallet',
        isConnecting: false,
      });
    }
  },
  
  disconnectSolanaWallet: async () => {
    try {
      await solanaConnector.disconnect();
      set({
        solanaAddress: null,
        solanaBalance: 0,
        isSolanaConnected: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to disconnect Solana wallet' });
    }
  },
  
  // Обновление балансов
  updateBalances: async () => {
    const state = get();
    
    // Обновляем баланс Solana
    if (state.isSolanaConnected && state.solanaAddress) {
      const balance = await solanaConnector.getBalance(state.solanaAddress);
      set({ solanaBalance: balance });
    }
    
    // TODO: Обновить баланс TON
  },
  
  clearError: () => set({ error: null }),
}));
