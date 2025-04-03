import React, { useEffect } from 'react';
import { useNFTContext } from '../context/NFTContext';
import NFTGallery from '../components/NFTGallery';

const Gallery = () => {
  const { collectionMetadata, isLoading } = useNFTContext();
  
  // Generate collection statistics
  const getCollectionStats = () => {
    if (!collectionMetadata) return {};
    
    return {
      name: collectionMetadata.name || 'NFT Collection',
      symbol: collectionMetadata.symbol || '',
      description: collectionMetadata.description || 'No description available',
      supplyCap: collectionMetadata.metadata?.supply_cap || 'Unlimited'
    };
  };
  
  const stats = getCollectionStats();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {collectionMetadata?.logo && (
            <img 
              src={collectionMetadata.logo} 
              alt={stats.name}
              className="w-16 h-16 rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {stats.name} {stats.symbol && `(${stats.symbol})`}
            </h1>
            <p className="mt-2 text-gray-600">
              {stats.description}
            </p>
          </div>
        </div>
        
        {/* Collection stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Collection</p>
            <p className="text-xl font-semibold">{stats.name}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Symbol</p>
            <p className="text-xl font-semibold">{stats.symbol || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Supply Cap</p>
            <p className="text-xl font-semibold">{stats.supplyCap}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Standard</p>
            <p className="text-xl font-semibold">ICRC-7</p>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse NFTs</h2>
        <NFTGallery userOnly={false} />
      </div>
    </div>
  );
};

export default Gallery;