// Default configuration
const defaultConfig = {
    // Network configuration
    isDevelopment: process.env.NODE_ENV !== 'production',
    network: process.env.DFX_NETWORK || 'local',
    
    // Canister IDs
    canisters: {
      icrc7: process.env.ICRC7_CANISTER_ID || 'icrc7',
    },
    
    // Internet Identity
    internetIdentityUrl: process.env.II_URL || 'https://identity.ic0.app',
    
    // Admin principal (set this from environment or hard-code for development)
    adminPrincipal: process.env.ADMIN_PRINCIPAL || '',
    
    // Application settings
    app: {
      name: 'Waste2Earn NFT',
      defaultLogo: '/logo.svg',
      pagination: {
        defaultPageSize: 12,
        maxPageSize: 100,
      },
    },
    
    // Default NFT values if metadata is missing
    defaultNft: {
      name: 'Unnamed NFT',
      description: 'No description available',
      image: '/default-nft.png',
    },
  };
  
  // Export different configs based on environment
  const config = {
    ...defaultConfig,
    ...(defaultConfig.network === 'ic' ? {
      // Production/mainnet specific overrides
      host: 'https://icp-api.io',
    } : {
      // Local development specific overrides
      host: 'http://localhost:8000',
    }),
  };
  
  export default config;