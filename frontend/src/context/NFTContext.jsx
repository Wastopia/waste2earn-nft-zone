import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuthContext } from './AuthContext';
import { canisterId, createActor } from '../declarations/icrc7';

const NFTContext = createContext();

export function NFTProvider({ children }) {
  const [actor, setActor] = useState(null);
  const [collectionMetadata, setCollectionMetadata] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [userNfts, setUserNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { identity, isAuthenticated, getAccountId } = useAuthContext();

  // Initialize actor with or without identity
  useEffect(() => {
    const initActor = () => {
      try {
        // Create actor with identity if authenticated, otherwise anonymous
        const nftActor = createActor(canisterId, {
          agentOptions: {
            identity: identity || undefined,
          },
        });
        
        setActor(nftActor);
      } catch (err) {
        console.error("Error initializing NFT actor:", err);
      }
    };

    initActor();
  }, [identity]);

  // Fetch collection metadata when actor is ready
  useEffect(() => {
    if (!actor) return;

    const fetchCollectionData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch basic collection info
        const [name, symbol, description, logo, metadata] = await Promise.all([
          actor.icrc7_name(),
          actor.icrc7_symbol(),
          actor.icrc7_description(),
          actor.icrc7_logo(),
          actor.icrc7_collection_metadata()
        ]);

        setCollectionMetadata({
          name,
          symbol,
          description,
          logo,
          metadata: convertMetadataToObject(metadata)
        });
      } catch (err) {
        console.error("Error fetching collection data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionData();
  }, [actor, convertMetadataToObject]);

  // Fetch all NFTs
  const fetchAllNFTs = async () => {
    if (!actor) return;
    
    try {
      setIsLoading(true);
      
      // Fetch all token IDs
      const tokenIds = await actor.icrc7_tokens(null, null);
      
      // Fetch token metadata and owners
      const [metadataResults, ownerResults] = await Promise.all([
        actor.icrc7_token_metadata(tokenIds),
        actor.icrc7_owner_of(tokenIds)
      ]);
      
      // Process and combine the data
      const processedNfts = tokenIds.map((id, index) => {
        return {
          id,
          metadata: metadataResults[index] ? convertMetadataToObject(metadataResults[index]) : null,
          owner: ownerResults[index]
        };
      });
      
      setNfts(processedNfts);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's NFTs
  const fetchUserNFTs = async () => {
    if (!actor || !isAuthenticated) return;
    
    try {
      setIsLoading(true);
      
      const account = getAccountId();
      
      // Get token IDs owned by the user
      const tokenIds = await actor.icrc7_tokens_of(account, null, null);
      
      if (tokenIds.length === 0) {
        setUserNfts([]);
        return;
      }
      
      // Fetch metadata for the tokens
      const metadataResults = await actor.icrc7_token_metadata(tokenIds);
      
      // Process the data
      const processedNfts = tokenIds.map((id, index) => {
        return {
          id,
          metadata: metadataResults[index] ? convertMetadataToObject(metadataResults[index]) : null,
          owner: account
        };
      });
      
      setUserNfts(processedNfts);
    } catch (err) {
      console.error("Error fetching user NFTs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer NFT
  const transferNFT = async (tokenId, recipient) => {
    if (!actor || !isAuthenticated) return null;
    
    try {
      const result = await actor.icrc7_transfer([{
        token_id: tokenId,
        from_subaccount: [], // null represented as empty array
        to: recipient,
        memo: [], // null represented as empty array
        created_at_time: [] // null represented as empty array
      }]);
      
      // Refresh NFT data after transfer
      await Promise.all([fetchAllNFTs(), fetchUserNFTs()]);
      
      return result;
    } catch (err) {
      console.error("Error transferring NFT:", err);
      throw err;
    }
  };

  // Approve NFT transfer
  const approveNFT = async (tokenId, spender, expiresAt = null) => {
    if (!actor || !isAuthenticated) return null;
    
    try {
      const result = await actor.icrc37_approve_tokens([{
        token_id: tokenId,
        approval_info: {
          from_subaccount: [], // null represented as empty array
          spender: spender,
          memo: [], // null represented as empty array
          expires_at: expiresAt ? [expiresAt] : [], // Optional value as array
          created_at_time: [] // null represented as empty array
        }
      }]);
      
      return result;
    } catch (err) {
      console.error("Error approving NFT:", err);
      throw err;
    }
  };

  // Helper function to convert metadata array to object
  const convertMetadataToObject = (metadata) => {
    if (!metadata) return {};
    
    return metadata.reduce((obj, [key, value]) => {
      // Parse the Candid value to JavaScript
      obj[key] = parseCandidValue(value);
      return obj;
    }, {});
  };

  // Helper function to parse Candid values to JavaScript values
  const parseCandidValue = (value) => {
    // Handle different value types from Candid
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

  const value = {
    actor,
    nfts,
    userNfts,
    collectionMetadata,
    isLoading,
    fetchAllNFTs,
    fetchUserNFTs,
    transferNFT,
    approveNFT
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
}

export function useNFTContext() {
  return useContext(NFTContext);
}