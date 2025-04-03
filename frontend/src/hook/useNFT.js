import { useState, useCallback, useEffect } from 'react';
import { useNFTContext } from '../context/NFTContext';
import { useAuth } from './useAuth';
import { Principal } from '@dfinity/principal';

/**
 * Custom hook for NFT-related functionality
 * Abstracts the NFT context for more convenient use in components
 */
export function useNFT(tokenId = null) {
  const { 
    actor, 
    nfts, 
    userNfts, 
    fetchAllNFTs, 
    fetchUserNFTs, 
    transferNFT, 
    approveNFT, 
    isLoading: contextLoading 
  } = useNFTContext();
  
  const { isAuthenticated, principal, getAccountId } = useAuth();
  
  const [nft, setNft] = useState(null);
  const [owner, setOwner] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch NFT data if tokenId is provided
  useEffect(() => {
    const fetchNFTData = async () => {
      if (!actor || !tokenId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // First check if we already have the NFT in our context
        const existingNft = [...nfts, ...userNfts].find(n => n.id.toString() === tokenId.toString());
        
        if (existingNft) {
          setNft(existingNft);
          setOwner(existingNft.owner);
          setMetadata(existingNft.metadata);
        } else {
          // Otherwise fetch it directly
          const [metadataResult, ownerResult] = await Promise.all([
            actor.icrc7_token_metadata([Number(tokenId)]),
            actor.icrc7_owner_of([Number(tokenId)])
          ]);
          
          if (metadataResult[0] && ownerResult[0]) {
            const tokenMetadata = convertMetadataToObject(metadataResult[0]);
            setNft({
              id: Number(tokenId),
              metadata: tokenMetadata,
              owner: ownerResult[0]
            });
            setOwner(ownerResult[0]);
            setMetadata(tokenMetadata);
          } else {
            setError('NFT not found');
          }
        }
      } catch (err) {
        console.error("Error fetching NFT data:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNFTData();
  }, [actor, tokenId, nfts, userNfts]);

  // Check if the authenticated user is the owner
  useEffect(() => {
    if (isAuthenticated && owner && principal) {
      setIsOwner(
        owner.owner?.toString() === principal.toString() && 
        (!owner.subaccount || owner.subaccount.length === 0)
      );
    } else {
      setIsOwner(false);
    }
  }, [isAuthenticated, owner, principal]);

  // Fetch approvals if the user is the owner
  useEffect(() => {
    const fetchApprovals = async () => {
      if (!actor || !tokenId || !isOwner) return;
      
      try {
        const approvalsList = await actor.icrc37_get_token_approvals([Number(tokenId)], null, null);
        setApprovals(approvalsList);
      } catch (err) {
        console.error("Error fetching token approvals:", err);
      }
    };
    
    if (isAuthenticated && isOwner) {
      fetchApprovals();
    }
  }, [actor, tokenId, isAuthenticated, isOwner]);

  // Transfer NFT to another account
  const transfer = useCallback(async (recipientPrincipal, subaccount = null) => {
    if (!actor || !isAuthenticated || !isOwner || !tokenId) {
      throw new Error('Unable to transfer: Check authentication or ownership');
    }
    
    try {
      setIsLoading(true);
      
      let recipient;
      try {
        // Convert string to Principal if needed
        const principalObj = typeof recipientPrincipal === 'string' 
          ? Principal.fromText(recipientPrincipal)
          : recipientPrincipal;
        
        recipient = {
          owner: principalObj,
          subaccount: subaccount || [] // null represented as empty array
        };
      } catch (err) {
        throw new Error(`Invalid recipient principal: ${err.message}`);
      }
      
      const result = await transferNFT(Number(tokenId), recipient);
      
      // Check result
      const transferResult = result[0];
      if (transferResult && 'err' in transferResult) {
        throw new Error(`Transfer failed: ${JSON.stringify(transferResult.err)}`);
      }
      
      // Refresh data
      await Promise.all([fetchAllNFTs(), fetchUserNFTs()]);
      
      return true;
    } catch (err) {
      setError(`Error: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [actor, isAuthenticated, isOwner, tokenId, transferNFT, fetchAllNFTs, fetchUserNFTs]);

  // Approve NFT for transfer by another account
  const approve = useCallback(async (spenderPrincipal, expiresAt = null, subaccount = null) => {
    if (!actor || !isAuthenticated || !isOwner || !tokenId) {
      throw new Error('Unable to approve: Check authentication or ownership');
    }
    
    try {
      setIsLoading(true);
      
      let spender;
      try {
        // Convert string to Principal if needed
        const principalObj = typeof spenderPrincipal === 'string' 
          ? Principal.fromText(spenderPrincipal)
          : spenderPrincipal;
        
        spender = {
          owner: principalObj,
          subaccount: subaccount || [] // null represented as empty array
        };
      } catch (err) {
        throw new Error(`Invalid spender principal: ${err.message}`);
      }
      
      const result = await approveNFT(Number(tokenId), spender, expiresAt);
      
      // Check result
      const approvalResult = result[0];
      if (approvalResult && 'err' in approvalResult) {
        throw new Error(`Approval failed: ${JSON.stringify(approvalResult.err)}`);
      }
      
      // Refresh approvals
      const updatedApprovals = await actor.icrc37_get_token_approvals([Number(tokenId)], null, null);
      setApprovals(updatedApprovals);
      
      return true;
    } catch (err) {
      setError(`Error: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [actor, isAuthenticated, isOwner, tokenId, approveNFT]);

  // Revoke an approval
  const revokeApproval = useCallback(async (spenderPrincipal = null, subaccount = null) => {
    if (!actor || !isAuthenticated || !isOwner || !tokenId) {
      throw new Error('Unable to revoke: Check authentication or ownership');
    }
    
    try {
      setIsLoading(true);
      
      let spender = null;
      if (spenderPrincipal) {
        try {
          // Convert string to Principal if needed
          const principalObj = typeof spenderPrincipal === 'string' 
            ? Principal.fromText(spenderPrincipal)
            : spenderPrincipal;
          
          spender = {
            owner: principalObj,
            subaccount: subaccount || [] // null represented as empty array
          };
        } catch (err) {
          throw new Error(`Invalid spender principal: ${err.message}`);
        }
      }
      
      const result = await actor.icrc37_revoke_token_approvals([{
        token_id: Number(tokenId),
        from_subaccount: [], // null
        spender: spender ? [spender] : [], // optional value
        memo: [], // null
        created_at_time: [] // null
      }]);
      
      // Check result
      const revokeResult = result[0];
      if (revokeResult && 'err' in revokeResult) {
        throw new Error(`Revocation failed: ${JSON.stringify(revokeResult.err)}`);
      }
      
      // Refresh approvals
      const updatedApprovals = await actor.icrc37_get_token_approvals([Number(tokenId)], null, null);
      setApprovals(updatedApprovals);
      
      return true;
    } catch (err) {
      setError(`Error: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [actor, isAuthenticated, isOwner, tokenId]);

  // Burn NFT (admin only)
  const burnNFT = useCallback(async () => {
    if (!actor || !isAuthenticated || !tokenId) {
      throw new Error('Unable to burn: Check authentication');
    }
    
    try {
      setIsLoading(true);
      
      const result = await actor.icrcX_burn([
        {
          token_ids: [Number(tokenId)],
          from_subaccount: [], // null
          memo: [], // null
          created_at_time: [] // null
        }
      ]);
      
      if (result.failed_tokens.length > 0) {
        throw new Error(`Failed to burn token: ${JSON.stringify(result.failed_tokens[0])}`);
      }
      
      // Refresh data
      await fetchAllNFTs();
      
      return true;
    } catch (err) {
      setError(`Error: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [actor, isAuthenticated, tokenId, fetchAllNFTs]);

  // Helper function to convert metadata array to object
  const convertMetadataToObject = (metadata) => {
    if (!metadata) return {};
    
    return metadata.reduce((obj, [key, value]) => {
      obj[key] = parseCandidValue(value);
      return obj;
    }, {});
  };

  // Helper function to parse Candid values to JavaScript values
  const parseCandidValue = (value) => {
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

  // Get image URL from metadata
  const getImageUrl = useCallback(() => {
    if (!metadata || !metadata['icrc97:metadata'] || !metadata['icrc97:metadata'].assets) {
      return '/default-nft.png';
    }
    
    const assets = metadata['icrc97:metadata'].assets;
    const imageAsset = assets.find(asset => asset.purpose === 'icrc97:image');
    
    return imageAsset?.url || '/default-nft.png';
  }, [metadata]);

  // Get NFT name from metadata
  const getName = useCallback(() => {
    if (!metadata || !metadata['icrc97:metadata']) {
      return tokenId ? `NFT #${tokenId}` : 'Unknown NFT';
    }
    
    return metadata['icrc97:metadata'].name || (tokenId ? `NFT #${tokenId}` : 'Unknown NFT');
  }, [metadata, tokenId]);

  // Get NFT description from metadata
  const getDescription = useCallback(() => {
    if (!metadata || !metadata['icrc97:metadata']) {
      return 'No description available';
    }
    
    return metadata['icrc97:metadata'].description || 'No description available';
  }, [metadata]);

  return {
    nft,
    metadata,
    owner,
    approvals,
    isOwner,
    isLoading: isLoading || contextLoading,
    error,
    transfer,
    approve,
    revokeApproval,
    burnNFT,
    getImageUrl,
    getName,
    getDescription,
    refreshData: fetchAllNFTs,
  };
}