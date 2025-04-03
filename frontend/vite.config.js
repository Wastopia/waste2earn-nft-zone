import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get DFX canister IDs
let canisterIds;
try {
  canisterIds = JSON.parse(
    readFileSync(path.resolve(__dirname, '.dfx', 'local', 'canister_ids.json'), 'utf8')
  );
} catch (error) {
  console.warn('No canister_ids.json found. Default canister ID will be used');
  canisterIds = {
    icrc7: {
      local: 'icrc7'
    }
  };
}

// Generate canister environment variables
function generateCanisterEnvVars() {
  const network = process.env.DFX_NETWORK || 'local';
  const canisterEnvVars = {};
  
  for (const canister in canisterIds) {
    const canisterId = canisterIds[canister][network];
    const varName = `VITE_${canister.toUpperCase()}_CANISTER_ID`;
    canisterEnvVars[varName] = canisterId;
  }
  
  // Add VITE_DFX_NETWORK for network-specific logic
  canisterEnvVars.VITE_DFX_NETWORK = network;
  
  return canisterEnvVars;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Define environment variables
    ...generateCanisterEnvVars(),
    // Use NODE_ENVs from existing environment
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  server: {
    proxy: {
      // Proxy API requests to the dfx replica when in development
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
      },
    },
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
});