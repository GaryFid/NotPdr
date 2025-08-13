import { TonConnectUI, TonConnectUiOptions, THEME } from '@tonconnect/ui-react';

// Манифест для TON Connect
const manifestUrl = 'https://not-pdr-yhkt.vercel.app/tonconnect-manifest.json';

export class TonWalletConnector {
  private tonConnectUI: TonConnectUI | null = null;

  async init() {
    if (typeof window === 'undefined') return;
    
    const options: TonConnectUiOptions = {
      manifestUrl,
      buttonRootId: 'ton-connect-button',
      uiPreferences: {
        theme: THEME.DARK,
      },
      walletsListConfiguration: {
        includeWallets: [
          {
            appName: 'telegram-wallet',
            name: 'Telegram Wallet',
            imageUrl: 'https://wallet.telegram.org/img/logo-256.png',
            aboutUrl: 'https://wallet.telegram.org',
            universalLink: 'https://t.me/wallet',
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            platforms: ['ios', 'android', 'macos', 'windows', 'linux']
          },
          {
            appName: 'tonkeeper',
            name: 'Tonkeeper',
            imageUrl: 'https://tonkeeper.com/assets/tonkeeper-logo.png',
            aboutUrl: 'https://tonkeeper.com',
            universalLink: 'https://app.tonkeeper.com/ton-connect',
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            platforms: ['ios', 'android', 'chrome', 'firefox']
          }
        ]
      }
    };

    this.tonConnectUI = new TonConnectUI(options);
    
    // Подписка на изменения состояния
    this.tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        console.log('TON wallet connected:', wallet.account.address);
      }
    });
  }

  async connect() {
    if (!this.tonConnectUI) await this.init();
    
    try {
      const connectedWallet = await this.tonConnectUI!.connectWallet();
      return {
        address: connectedWallet.account.address,
        network: connectedWallet.account.chain,
        publicKey: connectedWallet.account.publicKey,
      };
    } catch (error) {
      console.error('Failed to connect TON wallet:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.tonConnectUI) {
      await this.tonConnectUI.disconnect();
    }
  }

  getConnectedWallet() {
    if (!this.tonConnectUI) return null;
    return this.tonConnectUI.wallet;
  }

  isConnected() {
    return !!this.getConnectedWallet();
  }
}

export const tonConnector = new TonWalletConnector();
