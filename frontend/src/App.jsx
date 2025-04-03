import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import MyNFTs from './pages/MyNFTs';
import NFTDetails from './pages/NFTDetails';
import Admin from './pages/Admin';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          {isAuthenticated && <Route path="/my-nfts" element={<MyNFTs />} />}
          <Route path="/nft/:id" element={<NFTDetails />} />
          {isAdmin && <Route path="/admin" element={<Admin />} />}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;