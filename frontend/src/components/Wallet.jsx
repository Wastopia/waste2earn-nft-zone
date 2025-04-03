import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNFTContext } from '../context/NFTContext';
import { formatPrincipal } from '../utils/format';

const Wallet = () => {
  const { isAuthenticated, principal, login, logout } = useAuthContext();
  const { userNfts, fetchUserNFTs, isLoading } = useNFTContext();

  const [tokenCount, setTokenCount] = useState(0);
  const [recentTokens, setRecentTokens] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserNFTs();
    }
  }, [isAuthenticated, fetchUserNFTs]);

  useEffect(() => {
    if (userNfts) {
      setTokenCount(userNfts.length);
      // Get the 3 most recent tokens
      setRecentTokens(userNfts.slice(0, 3));
    }
  }, [userNfts]);

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Wallet</h2>
        <p className="text-gray-600 mb-6">
          Connect with Internet Identity to view your NFTs and manage your wallet.
        </p>
        <button
          onClick={login}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">My Wallet</h2>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Disconnect
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Principal ID:</span>
          <span className="font-medium" title={principal?.toString()}>
            {formatPrincipal(principal, 6)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">NFTs Owned:</span>
          <span className="font-medium">{tokenCount}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {recentTokens.length > 0 ? (
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Recent NFTs</h3>
              <div className="grid grid-cols-3 gap-3">
                {recentTokens.map((token) => {
                  const name = token.metadata?.['icrc97:metadata']?.name || `NFT #${token.id}`;
                  const imageAsset = token.metadata?.['icrc97:metadata']?.assets?.find(
                    asset => asset.purpose === 'icrc97:image'
                  );
                  const imageUrl = imageAsset?.url || '/default-nft.png';

                  return (
                    <Link 
                      key={token.id}
                      to={`/nft/${token.id}`}
                      className="block"
                    >
                      <div className="relative pb-[100%] rounded-md overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-nft.png';
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs truncate">{name}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              You don't own any NFTs yet
            </p>
          )}

          <div className="mt-6">
            <Link
              to="/my-nfts"
              className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              View All NFTs
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Wallet;