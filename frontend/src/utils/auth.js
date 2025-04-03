import { AuthClient } from '@dfinity/auth-client';

// Default authentication options
const defaultAuthOptions = {
  identityProvider: process.env.II_URL || 'https://identity.ic0.app',
  maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
};

// Create a new AuthClient
export const createAuthClient = async () => {
  return await AuthClient.create();
};

// Login with Internet Identity
export const login = async (authClient, options = {}) => {
  const authOptions = { ...defaultAuthOptions, ...options };

  return new Promise((resolve, reject) => {
    authClient.login({
      ...authOptions,
      onSuccess: () => {
        resolve(authClient.getIdentity());
      },
      onError: (error) => {
        console.error('Login failed:', error);
        reject(error);
      },
    });
  });
};

// Logout
export const logout = async (authClient) => {
  await authClient.logout();
  return true;
};

// Check if user is authenticated
export const isAuthenticated = async (authClient) => {
  return await authClient.isAuthenticated();
};

// Get identity
export const getIdentity = (authClient) => {
  return authClient.getIdentity();
};

// Get principal
export const getPrincipal = (authClient) => {
  const identity = authClient.getIdentity();
  return identity.getPrincipal();
};

// Convert principal to account
export const principalToAccount = (principal, subaccount = null) => {
  return {
    owner: principal,
    subaccount: subaccount || [] // null represented as empty array
  };
};

// Check if principal matches the admin principal
export const isAdmin = (principal, adminPrincipal) => {
  if (!principal || !adminPrincipal) return false;
  return principal.toString() === adminPrincipal;
};