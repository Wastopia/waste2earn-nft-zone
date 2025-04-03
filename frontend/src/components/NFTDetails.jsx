import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNFTContext } from '../context/NFTContext';
import { useAuthContext } from '../context/AuthContext';
import TransferModal from '../components/TransferModal';
import ApprovalModal from '../components/ApprovalModal';

const NFTDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actor, nfts, userNfts, fetchAllNFTs } = useNFTContext();
  const { isAuthenticated, principal, getAccountId } = useAuthContext();
  
  const [nft, setNft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

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
              navigate('/gallery');
            }
          }
        }
      } catch (err) {
        console.error("Error loading NFT details:", err);
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
      const userAccount = getAccountId();
      setIsOwner(
        nft.owner?.owner?.toString() === principal.toString() && 
        (!nft.owner?.subaccount || nft.owner.subaccount.length === 0)
      );
    } else {
      setIsOwner(false);
    }
  }, [isAuthenticated, nft, principal, getAccountId]);

  // Helper function to convert metadata array to object (same as in NFTContext)
  const convertMetadataToObject = (metadata) => {
    if (!metadata) return {};
    
    return metadata.reduce((obj, [key, value]) => {
      obj[key] = parseCandidValue(value);
      return obj;
    }, {});
  };

  // Helper function to parse Candid values to JavaScript values (same as in NFTContext)
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                  <span className="font-medium truncate max-w-[240px]">
                    {nft.owner?.owner?.toString().substring(0, 10)}...
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
                <button
                  onClick={() => navigate('/gallery')}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back to Gallery
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
              {nft.metadata && Object.entries(nft.metadata).map(([key, value]) => (
                <tr key={key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof value === 'object' 
                      ? JSON.stringify(value, null, 2) 
                      : String(value)
                    }
                  </td>
                </tr>
              ))}
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