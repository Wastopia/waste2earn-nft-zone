import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useNFTContext } from '../context/NFTContext';

const TransferModal = ({ nft, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { transferNFT } = useNFTContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validate principal
      let recipientPrincipal;
      try {
        recipientPrincipal = Principal.fromText(recipient);
      } catch (err) {
        setError('Invalid principal ID format');
        setIsSubmitting(false);
        return;
      }
      
      // Format recipient account for canister call
      const recipientAccount = {
        owner: recipientPrincipal,
        subaccount: []  // null represented as empty array
      };
      
      // Perform transfer
      const result = await transferNFT(nft.id, recipientAccount);
      
      // Check for errors in result
      const transferResult = result[0];
      if (transferResult && 'err' in transferResult) {
        setError(`Transfer failed: ${JSON.stringify(transferResult.err)}`);
      } else {
        setSuccess(true);
        // Auto-close after successful transfer
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
          Transfer NFT #{nft.id.toString()}
        </h2>
        
        {success ? (
          <div className="text-center py-6">
            <div className="text-green-500 text-lg font-medium mb-2">
              NFT transferred successfully!
            </div>
            <p className="text-gray-600">
              The ownership has been transferred to the recipient.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label 
                htmlFor="recipient" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recipient Principal ID
              </label>
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter principal ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the Internet Computer Principal ID of the recipient
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
                disabled={isSubmitting || !recipient}
              >
                {isSubmitting ? 'Processing...' : 'Transfer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferModal;