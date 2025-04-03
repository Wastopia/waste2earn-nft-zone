import { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useAuthContext } from '../context/AuthContext';

export function useCanister(canisterId, idlFactory) {
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { identity } = useAuthContext();

  useEffect(() => {
    const initActor = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const host = process.env.DFX_NETWORK === 'ic' 
          ? 'https://icp-api.io'
          : 'http://localhost:8000';

        // Create an agent with identity if available
        const agent = new HttpAgent({
          host,
          identity: identity || undefined,
        });

        // Only fetch the root key in local development
        if (process.env.DFX_NETWORK !== 'ic') {
          await agent.fetchRootKey();
        }

        // Create the actor
        const actorInstance = Actor.createActor(idlFactory, {
          agent,
          canisterId: Principal.fromText(canisterId),
        });

        setActor(actorInstance);
      } catch (err) {
        console.error("Error initializing canister actor:", err);
        setError(`Error creating actor: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initActor();
  }, [canisterId, idlFactory, identity]);

  return {
    actor,
    isLoading,
    error,
  };
}