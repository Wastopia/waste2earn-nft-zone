import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { useNFTContext } from '../context/NFTContext';
import { useAuth } from '../hooks/useAuth';
import TransferModal from '../components/TransferModal';
import ApprovalModal from '../components/ApprovalModal';
import { formatPrincipal } from '../utils/format';

const NFTDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actor, nfts, userNfts, fetchAllNFTs, isLoading: nftLoading } = useNFTContext();
  const { isAuthenticated, principal, isAdmin } = useAuth();
  
  const [nft, setNft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenApprovals, setTokenApprovals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNFT = async () => {
      try {
        setIsLoading(true);
        
        // First check if we already have the NFT in our context
        const existingNft = [...nfts, ...userNfts].find(n => n.id.toString() === id);
        
        if (existingNft) {
          setNft(existingNft);
        } else {
          // Otherwise fetch it directly
          await fetchAllNFTs(); // Refresh the NFT list
          const refreshedNft = nfts.find(n => n.id.toString() === id);
          
          if (refreshedNft) {
            setNft(refreshedNft);
          } else {
            // If still not found, try to fetch it individually
            const tokenId = parseInt(id);
            const [metadataResult, ownerResult] = await Promise.all([
              actor.icrc7_token_metadata([tokenId]),
              actor.icrc7_owner_of([tokenId])
            ]);
            
            if (metadataResult[0] && ownerResult[0]) {
              setNft({
                id: tokenId,
                metadata: convertMetadataToObject(metadataResult[0]),
                owner: ownerResult[0]
              });
            } else {
              // NFT not found
              setError('NFT not found');
              setTimeout(() => navigate('/gallery'), 3000);
            }
          }
        }
      } catch (err) {
        console.error("Error loading NFT details:", err);
        setError(`Error loading NFT: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (actor) {
      loadNFT();
    }
  }, [id, actor, nfts, userNfts, navigate, fetchAllNFTs]);

  // Check if user is the owner of this NFT
  useEffect(() => {
    if (isAuthenticated && nft && principal) {
      setIsOwner(
        nft.owner?.owner?.toString() === principal.toString() && 
        (!nft.owner?.subaccount || nft.owner.subaccount.length === 0)
      );
    } else {
      setIsOwner(false);
    }
  }, [isAuthenticated, nft, principal]);

  // Fetch token approvals
  useEffect(() => {
    const fetchApprovals = async () => {
      if (!actor || !nft) return;
      
      try {
        const approvals = await actor.icrc37_get_token_approvals([nft.id], null, null);
        setTokenApprovals(approvals);
      } catch (err) {
        console.error("Error fetching token approvals:", err);
      }
    };

    if (isAuthenticated && isOwner) {
      fetchApprovals();
    }
  }, [actor, nft, isAuthenticated, isOwner]);

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

  // Burn NFT (admin only)
  const handleBurnNFT = async () => {
    if (!isAdmin || !actor || !nft) return;
    
    if (!window.confirm(`Are you sure you want to burn NFT #${nft.id}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const result = await actor.icrcX_burn([
        {
          token_ids: [nft.id],
          from_subaccount: [], // null
          memo: [], // null
          created_at_time: [] // null
        }
      ]);
      
      if (result.failed_tokens.length > 0) {
        setError(`Failed to burn token: ${JSON.stringify(result.failed_tokens[0])}`);
      } else {
        alert('NFT successfully burned');
        navigate('/gallery');
      }
    } catch (err) {
      console.error("Error burning NFT:", err);
      setError(`Error burning NFT: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || nftLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button 
          onClick={() => navigate('/gallery')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">NFT Not Found</h2>
        <p className="mt-2 text-gray-600">The NFT you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/gallery')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  // Extract NFT metadata
  const name = nft.metadata?.['icrc97:metadata']?.name || `NFT #${nft.id}`;
  const description = nft.metadata?.['icrc97:metadata']?.description || 'No description available';
  
  // Find the first image asset
  const imageAsset = nft.metadata?.['icrc97:metadata']?.assets?.find(
    asset => asset.purpose === 'icrc97:image'
  );
  const imageUrl = imageAsset?.url || '/default-nft.png';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-nft.png';
              }}
            />
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
            <p className="mt-4 text-gray-600">{description}</p>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700">Details</h2>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Token ID:</span>
                  <span className="font-medium">{nft.id.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Owner:</span>
                  <span 
                    className="font-medium truncate max-w-[240px]"
                    title={nft.owner?.owner?.toString()}
                  >
                    {nft.owner?.owner ? formatPrincipal(nft.owner.owner, 8) : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            {isAuthenticated && (
              <div className="mt-8 space-y-3">
                {isOwner && (
                  <>
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Transfer NFT
                    </button>
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="w-full border border-blue-500 text-blue-500 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Approve for Transfer
                    </button>
                  </>
                )}
                
                {isAdmin && (
                  <button
                    onClick={handleBurnNFT}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Burn NFT
                  </button>
                )}
                
                <Link
                  to="/gallery"
                  className="block text-center w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back to Gallery
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approvals section - only visible to owner */}
      {isAuthenticated && isOwner && tokenApprovals.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Approvals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tokenApprovals.map((approval, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrincipal(approval.spender.owner, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {approval.expires_at 
                        ? new Date(Number(approval.expires_at) / 1000000).toLocaleString() 
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={async () => {
                          try {
                            await actor.icrc37_revoke_token_approvals([{
                              token_id: nft.id,
                              from_subaccount: [], // null
                              spender: [approval.spender], // optional value
                              memo: [], // null
                              created_at_time: [] // null
                            }]);
                            
                            // Refresh approvals
                            const updatedApprovals = await actor.icrc37_get_token_approvals([nft.id], null, null);
                            setTokenApprovals(updatedApprovals);
                          } catch (err) {
                            console.error("Error revoking approval:", err);
                            setError(`Error revoking approval: ${err.message}`);
                          }
                        }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional metadata section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Metadata</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {nft.metadata && Object.entries(nft.metadata).map(([key, value]) => {
                // Skip complex nested objects for display
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  if (key === 'icrc97:metadata') {
                    // Extract and show basic properties from icrc97:metadata
                    return Object.entries(value)
                      .filter(([k, v]) => k !== 'assets') // Skip assets array
                      .map(([k, v]) => (
                        <tr key={`${key}-${k}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{k}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </td>
                        </tr>
                      ));
                  }
                  return null;
                }
                
                return (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)
                      }
                    </td>
                  </tr>
                );
              }).filter(Boolean)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showTransferModal && (
        <TransferModal
          nft={nft}
          onClose={() => setShowTransferModal(false)}
        />
      )}
      
      {showApprovalModal && (
        <ApprovalModal
          nft={nft}
          onClose={() => setShowApprovalModal(false)}
        />
      )}
    </div>
  );
};

export default NFTDetails;