import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthClient } from '@dfinity/auth-client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Admin principal from the canister
  const ADMIN_PRINCIPAL = process.env.ADMIN_PRINCIPAL || "";

  // Initialize auth client
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        if (await client.isAuthenticated()) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal();
          
          setIdentity(identity);
          setPrincipal(principal);
          setIsAuthenticated(true);
          setIsAdmin(principal.toString() === ADMIN_PRINCIPAL);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [ADMIN_PRINCIPAL]);

  // Login with Internet Identity
  const login = async () => {
    if (!authClient) return;

    try {
      await authClient.login({
        identityProvider: process.env.II_URL || "https://identity.ic0.app",
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          
          setIdentity(identity);
          setPrincipal(principal);
          setIsAuthenticated(true);
          setIsAdmin(principal.toString() === ADMIN_PRINCIPAL);
        },
      });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Logout
  const logout = async () => {
    if (!authClient) return;

    await authClient.logout();
    setIdentity(null);
    setPrincipal(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Get account identifier from principal
  const getAccountId = () => {
    if (!principal) return null;
    
    // Return account in format needed by the canister
    return {
      owner: principal,
      subaccount: []
    };
  };

  const value = {
    authClient,
    identity,
    principal,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
    getAccountId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}