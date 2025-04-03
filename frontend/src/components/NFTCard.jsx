import React from 'react';
import { Link } from 'react-router-dom';

const NFTCard = ({ nft }) => {
  // Extract NFT metadata
  const name = nft.metadata?.['icrc97:metadata']?.name || `NFT #${nft.id}`;
  const description = nft.metadata?.['icrc97:metadata']?.description || 'No description available';
  
  // Find the first image asset
  const imageAsset = nft.metadata?.['icrc97:metadata']?.assets?.find(
    asset => asset.purpose === 'icrc97:image'
  );
  const imageUrl = imageAsset?.url || '/default-nft.png';

  return (
    <Link to={`/nft/${nft.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative pb-[100%]">
          <img 
            src={imageUrl} 
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/default-nft.png';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 h-10">{description}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              ID: {nft.id.toString()}
            </span>
            <span className="text-xs text-gray-500">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;