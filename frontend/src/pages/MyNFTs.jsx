import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNFTContext } from '../context/NFTContext';
import NFTGallery from '../components/NFTGallery';

const MyNFTs = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { fetchUserNFTs } = useNFTContext();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserNFTs();
    }
  }, [isAuthenticated, fetchUserNFTs]);
  
  // Show loading state if authentication is still loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My NFT Collection</h1>
        <p className="mt-2 text-gray-600">
          View and manage your Waste2Earn NFTs.
        </p>
      </div>
      
      <NFTGallery userOnly={true} />
    </div>
  );
};

export default MyNFTs;