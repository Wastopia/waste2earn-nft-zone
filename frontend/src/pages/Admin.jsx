import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNFTContext } from '../context/NFTContext';
import { Principal } from '@dfinity/principal';

const Admin = () => {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuthContext();
  const { actor, fetchAllNFTs } = useNFTContext();
  
  const [mintForm, setMintForm] = useState({
    recipient: '',
    name: '',
    description: '',
    imageUrl: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Redirect to home if not authenticated or not admin
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" />;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMintForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleMintSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!mintForm.name || !mintForm.description || !mintForm.imageUrl) {
        setError('Please fill in all fields');
        setIsSubmitting(false);
        return;
      }
      
      // Validate recipient principal if provided
      let recipientPrincipal;
      let recipientAccount = null;
      
      if (mintForm.recipient) {
        try {
          recipientPrincipal = Principal.fromText(mintForm.recipient);
          recipientAccount = {
            owner: recipientPrincipal,
            subaccount: []  // null represented as empty array
          };
        } catch (err) {
          setError('Invalid recipient principal ID');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Get the next token ID (assuming it's the total supply if there's no custom logic)
      const totalSupply = await actor.icrc7_total_supply();
      const nextTokenId = totalSupply;
      
      // Create NFT metadata
      const nftMetadata = {
        token_id: nextTokenId,
        owner: recipientAccount ? [recipientAccount] : [], // Optional value
        metadata: {
          Map: [
            {
              "icrc97:metadata": {
                Map: [
                  { name: { Text: mintForm.name } },
                  { description: { Text: mintForm.description } },
                  { 
                    assets: { 
                      Array: [
                        {
                          Map: [
                            { url: { Text: mintForm.imageUrl } },
                            { mime: { Text: "image/jpeg" } },
                            { purpose: { Text: "icrc97:image" } }
                          ]
                        }
                      ] 
                    } 
                  }
                ]
              }
            }
          ]
        },
        memo: [],  // null represented as empty array
        override: true,
        created_at_time: []  // null represented as empty array
      };
      
      // Call mint function with the metadata
      const result = await actor.icrcX_mint([nftMetadata]);
      
      // Check result
      if (result[0] && 'err' in result[0]) {
        setError(`Minting failed: ${JSON.stringify(result[0].err)}`);
      } else {
        setSuccess(`Successfully minted NFT with ID: ${nextTokenId}`);
        
        // Reset form
        setMintForm({
          recipient: '',
          name: '',
          description: '',
          imageUrl: '',
        });
        
        // Refresh NFTs
        await fetchAllNFTs();
      }
    } catch (err) {
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      {/* Mint NFT Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Mint New NFT</h2>
        
        <form onSubmit={handleMintSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Principal ID (Optional)
              </label>
              <input
                type="text"
                id="recipient"
                name="recipient"
                value={mintForm.recipient}
                onChange={handleChange}
                placeholder="Leave empty to mint to canister"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                If left empty, the NFT will be minted to the canister
              </p>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                NFT Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={mintForm.name}
                onChange={handleChange}
                placeholder="Enter NFT name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={mintForm.description}
                onChange={handleChange}
                placeholder="Enter NFT description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={mintForm.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a direct URL to the image (JPEG, PNG, etc.)
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                {success}
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Additional admin sections can be added here */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Collection Management</h2>
        
        <div className="space-y-4">
          {/* Example of additional admin actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={fetchAllNFTs}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Refresh NFT List
            </button>
            
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                // This would link to a function that gets transaction logs
                alert('Transaction logs functionality to be implemented');
              }}
            >
              View Transaction Logs
            </button>
          </div>
          
          <p className="text-gray-600 text-sm">
            Note: Additional collection management features can be added here based on specific requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;