import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNFTContext } from '../context/NFTContext';
import NFTCard from './NFTCard';

const NFTGallery = ({ userOnly = false }) => {
  const { nfts, userNfts, isLoading, fetchAllNFTs, fetchUserNFTs } = useNFTContext();
  const [displayNfts, setDisplayNfts] = useState([]);

  useEffect(() => {
    const loadNFTs = async () => {
      if (userOnly) {
        await fetchUserNFTs();
      } else {
        await fetchAllNFTs();
      }
    };

    loadNFTs();
  }, [userOnly, fetchAllNFTs, fetchUserNFTs]);

  useEffect(() => {
    setDisplayNfts(userOnly ? userNfts : nfts);
  }, [userOnly, nfts, userNfts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (displayNfts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700">
          {userOnly ? "You don't own any NFTs yet" : "No NFTs found in this collection"}
        </h3>
        {userOnly && (
          <Link to="/gallery" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md">
            Browse the gallery
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayNfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
};

export default NFTGallery;