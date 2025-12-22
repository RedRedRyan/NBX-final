import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
  ExtensionData,
} from '@hashgraph/hedera-wallet-connect'
import { LedgerId } from '@hashgraph/sdk'

const metadata = {
  name: 'NBX SMEX',
  description: 'Tokenized Securities Exchange on Hedera',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icons: ['/icons/logo.png'],
}

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID as string

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not defined in environment variables')
}

// Create DAppConnector instance
const dAppConnector = new DAppConnector(
  metadata,
  LedgerId.TESTNET,
  projectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet],
)

// Optional: Customize the modal theme
if (typeof window !== 'undefined') {
  // Add custom CSS to make modal larger
  const style = document.createElement('style')
  style.textContent = `
    /* Increase WalletConnect modal size */
    wcm-modal {
      --wcm-z-index: 9999 !important;
    }
    
    wcm-modal > div {
      max-width: 500px !important;
      min-height: 400px !important;
    }
    
    /* Style the modal content */
    .wcm-container {
      padding: 2rem !important;
    }
    
    /* Increase button sizes */
    wcm-wallet-button {
      min-height: 80px !important;
      font-size: 1rem !important;
    }
    
    /* Make wallet icons larger */
    wcm-wallet-image {
      width: 64px !important;
      height: 64px !important;
    }
  `
  document.head.appendChild(style)
}

export { dAppConnector }
export type { ExtensionData }
