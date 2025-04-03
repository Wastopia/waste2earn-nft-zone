import { useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import config from '../config';

/**
 * Custom hook for authentication functionality
 * Abstracts the AuthContext for easier use in components
 */
export function useAuth() {
  const auth = useAuthContext();
  
  // Check if current user is admin
  const isAdmin = useCallback(() => {
    if (!auth.principal) return false;
    return auth.principal.toString() === config.adminPrincipal;
  }, [auth.principal]);

  // Get account identifier in format needed for canister calls
  const getAccountId = useCallback(() => {
    if (!auth.principal) return null;
    
    return {
      owner: auth.principal,
      subaccount: [] // null represented as empty array in Candid
    };
  }, [auth.principal]);

  // Format principal for display
  const getFormattedPrincipal = useCallback((length = 5) => {
    if (!auth.principal) return '';
    
    const principalText = auth.principal.toString();
    if (principalText.length <= length * 2) return principalText;
    
    return `${principalText.substring(0, length)}...${principalText.substring(principalText.length - length)}`;
  }, [auth.principal]);

  return {
    ...auth,
    isAdmin: isAdmin(),
    getAccountId,
    getFormattedPrincipal,
  };
}