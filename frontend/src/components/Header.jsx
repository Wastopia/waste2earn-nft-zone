import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useNFTContext } from '../context/NFTContext';

const Header = () => {
  const { isAuthenticated, isAdmin, login, logout, principal } = useAuthContext();
  const { collectionMetadata } = useNFTContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const collectionName = collectionMetadata?.name || 'Waste2Earn NFT';
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center">
            {collectionMetadata?.logo ? (
              <img 
                src={collectionMetadata.logo} 
                alt={collectionName}
                className="h-10 w-10 mr-3"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                W2E
              </div>
            )}
            <span className="text-xl font-semibold text-gray-800">
              {collectionName}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/gallery" 
              className={({ isActive }) => 
                isActive 
                  ? "text-blue-600 font-medium" 
                  : "text-gray-600 hover:text-blue-500"
              }
            >
              Gallery
            </NavLink>
            
            {isAuthenticated && (
              <NavLink 
                to="/my-nfts" 
                className={({ isActive }) => 
                  isActive 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-600 hover:text-blue-500"
                }
              >
                My NFTs
              </NavLink>
            )}
            
            {isAdmin && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) => 
                  isActive 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-600 hover:text-blue-500"
                }
              >
                Admin
              </NavLink>
            )}
            
            {isAuthenticated ? (
              <div className="relative group">
                <button 
                  className="flex items-center text-gray-600 hover:text-blue-500 focus:outline-none"
                >
                  <span className="mr-1 truncate max-w-[100px]">
                    {principal?.toString().substring(0, 5)}...
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Connect
              </button>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-blue-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <NavLink 
                to="/gallery" 
                className={({ isActive }) => 
                  isActive 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-600 hover:text-blue-500"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </NavLink>
              
              {isAuthenticated && (
                <NavLink 
                  to="/my-nfts" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-medium" 
                      : "text-gray-600 hover:text-blue-500"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  My NFTs
                </NavLink>
              )}
              
              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-medium" 
                      : "text-gray-600 hover:text-blue-500"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </NavLink>
              )}
              
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-gray-600 hover:text-blue-500"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    login();
                    setIsMenuOpen(false);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;