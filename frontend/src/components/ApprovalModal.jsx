import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useNFTContext } from '../context/NFTContext';

const ApprovalModal = ({ nft, onClose }) => {
  const [spender, setSpender] = useState('');
  const [expiration, setExpiration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { approveNFT } = useNFTContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validate principal
      let spenderPrincipal;
      try {
        spenderPrincipal = Principal.fromText(spender);
      } catch (err) {
        setError('Invalid principal ID format');
        setIsSubmitting(false);
        return;
      }
      
      // Format spender account for canister call
      const spenderAccount = {
        owner: spenderPrincipal,
        subaccount: []  // null represented as empty array
      };
      
      // Calculate expiration timestamp if set
      let expiresAt = null;
      if (expiration) {
        const expirationDate = new Date(expiration);
        expiresAt = BigInt(Math.floor(expirationDate.getTime() * 1000000)); // Convert to nanoseconds
      }
      
      // Perform approval
      const result = await approveNFT(nft.id, spenderAccount, expiresAt);
      
      // Check for errors in result
      const approvalResult = result[0];
      if (approvalResult && 'err' in approvalResult) {
        setError(`Approval failed: ${JSON.stringify(approvalResult.err)}`);
      } else {
        setSuccess(true);
        // Auto-close after successful approval
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Approve NFT #{nft.id.toString()} Transfer
        </h2>
        
        {success ? (
          <div className="text-center py-6">
            <div className="text-green-500 text-lg font-medium mb-2">
              Approval granted successfully!
            </div>
            <p className="text-gray-600">
              The spender can now transfer this NFT on your behalf.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label 
                htmlFor="spender" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Spender Principal ID
              </label>
              <input
                id="spender"
                type="text"
                value={spender}
                onChange={(e) => setSpender(e.target.value)}
                placeholder="Enter principal ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the Internet Computer Principal ID of the approved spender
              </p>
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="expiration" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expiration Date (Optional)
              </label>
              <input
                id="expiration"
                type="datetime-local"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                If not set, the approval will not expire
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isSubmitting || !spender}
              >
                {isSubmitting ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApprovalModal;