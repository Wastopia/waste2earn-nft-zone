import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as icrc7IDL } from '../declarations/icrc7/icrc7.did.js';
import { canisterId as icrc7CanisterId } from '../declarations/icrc7/index.js';

// Create an agent for anonymous or authenticated access
export const createAgent = (identity = null) => {
  const host = process.env.DFX_NETWORK === 'ic' 
    ? 'https://icp-api.io'
    : 'http://localhost:8000';

  const agent = new HttpAgent({
    host,
    identity: identity || undefined,
  });

  // Only fetch the root key in local development
  if (process.env.DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check if your local replica is running");
      console.error(err);
    });
  }

  return agent;
};

// Create an actor for the ICRC7 NFT canister
export const createNFTActor = (identity = null) => {
  const agent = createAgent(identity);
  
  return Actor.createActor(icrc7IDL, {
    agent,
    canisterId: icrc7CanisterId,
  });
};

// Helper function to convert Candid values to JavaScript values
export const parseCandidValue = (value) => {
  if (value.hasOwnProperty('Text')) {
    return value.Text;
  } else if (value.hasOwnProperty('Nat')) {
    return Number(value.Nat);
  } else if (value.hasOwnProperty('Int')) {
    return Number(value.Int);
  } else if (value.hasOwnProperty('Bool')) {
    return value.Bool;
  } else if (value.hasOwnProperty('Blob')) {
    return value.Blob;
  } else if (value.hasOwnProperty('Map')) {
    return value.Map.reduce((obj, [k, v]) => {
      obj[k] = parseCandidValue(v);
      return obj;
    }, {});
  } else if (value.hasOwnProperty('Array')) {
    return value.Array.map(parseCandidValue);
  }
  
  return null;
};

// Helper function to convert metadata array to object
export const convertMetadataToObject = (metadata) => {
  if (!metadata) return {};
  
  return metadata.reduce((obj, [key, value]) => {
    obj[key] = parseCandidValue(value);
    return obj;
  }, {});
};

// Extract image URL from NFT metadata
export const getImageUrlFromMetadata = (metadata) => {
  try {
    const icrc97Metadata = metadata['icrc97:metadata'];
    if (!icrc97Metadata) return null;
    
    const assets = icrc97Metadata.assets;
    if (!assets || !Array.isArray(assets) || assets.length === 0) return null;
    
    const imageAsset = assets.find(asset => asset.purpose === 'icrc97:image');
    return imageAsset?.url || null;
  } catch (err) {
    console.error('Error extracting image URL from metadata:', err);
    return null;
  }
};

// Get name from NFT metadata
export const getNameFromMetadata = (metadata, tokenId) => {
  try {
    return metadata['icrc97:metadata']?.name || `NFT #${tokenId}`;
  } catch (err) {
    return `NFT #${tokenId}`;
  }
};

// Get description from NFT metadata
export const getDescriptionFromMetadata = (metadata) => {
  try {
    return metadata['icrc97:metadata']?.description || 'No description available';
  } catch (err) {
    return 'No description available';
  }
};