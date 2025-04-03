// Add BigInt polyfill for older browsers
if (typeof BigInt === 'undefined') {
  window.BigInt = function(value) {
    return Number(value);
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NFTProvider } from './context/NFTContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NFTProvider>
          <App />
        </NFTProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);