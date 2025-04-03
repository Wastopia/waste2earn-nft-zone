// Format principal ID for display
export const formatPrincipal = (principal, length = 5) => {
    if (!principal) return '';
    
    const principalText = principal.toString();
    if (principalText.length <= length * 2) return principalText;
    
    return `${principalText.substring(0, length)}...${principalText.substring(principalText.length - length)}`;
  };
  
  // Format timestamp (nanoseconds) to human readable date
  export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    // Convert nanoseconds to milliseconds
    const milliseconds = Number(timestamp) / 1000000;
    const date = new Date(milliseconds);
    
    return date.toLocaleString();
  };
  
  // Format error message from canister error
  export const formatCanisterError = (error) => {
    if (!error) return 'Unknown error';
    
    if (typeof error === 'string') return error;
    
    // Handle various error types from canisters
    if (error.message) return error.message;
    
    if (error.Other) return error.Other;
    if (error.NotFound) return 'Not found';
    if (error.InvalidToken) return 'Invalid token';
    if (error.Unauthorized) return 'Unauthorized';
    if (error.TooOld) return 'Transaction too old';
    if (error.CreatedInFuture) return 'Transaction created in future';
    if (error.TemporarilyUnavailable) return 'Service temporarily unavailable';
    if (error.GenericError) return error.GenericError.message || 'Generic error';
    
    return JSON.stringify(error);
  };
  
  // Convert bytes to human readable format
  export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Truncate text with ellipsis
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  // Format token ID
  export const formatTokenId = (id) => {
    return '#' + id.toString();
  };