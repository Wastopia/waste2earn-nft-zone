import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNFTContext } from '../context/NFTContext';

const Home = () => {
  const { isAuthenticated, login } = useAuthContext();
  const { collectionMetadata } = useNFTContext();
  
  const collectionName = collectionMetadata?.name || 'Waste2Earn NFT';
  const collectionDescription = collectionMetadata?.description || 'Waste2Earn NFT Collection on the Internet Computer';
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to {collectionName}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {collectionDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/gallery"
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Browse Gallery
          </Link>
          {!isAuthenticated && (
            <button
              onClick={login}
              className="inline-block border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Connect with Internet Identity
            </button>
          )}
          {isAuthenticated && (
            <Link
              to="/my-nfts"
              className="inline-block border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              View My NFTs
            </Link>
          )}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-12 md:py-20 bg-gray-50 rounded-xl">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Sustainable NFTs on the Internet Computer
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-500 text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">
                Our NFTs are hosted on the carbon-neutral Internet Computer blockchain.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-500 text-4xl mb-4">♻️</div>
              <h3 className="text-xl font-semibold mb-2">Waste Reduction</h3>
              <p className="text-gray-600">
                Each NFT represents a tangible impact on waste reduction.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-500 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Fully On-Chain</h3>
              <p className="text-gray-600">
                ICRC-7 standard ensures your NFTs are securely stored on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-medium mb-2">Connect</h3>
              <p className="text-gray-600 text-sm">
                Sign in with Internet Identity
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-medium mb-2">Browse</h3>
              <p className="text-gray-600 text-sm">
                Explore our NFT collection
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-medium mb-2">Collect</h3>
              <p className="text-gray-600 text-sm">
                Acquire NFTs through transfers
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-medium mb-2">Share</h3>
              <p className="text-gray-600 text-sm">
                Transfer or approve NFTs for others
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;