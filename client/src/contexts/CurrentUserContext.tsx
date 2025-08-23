//client/src/contexts/CurrentUserContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../services/apiClient';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  capabilities?: Record<string, boolean>;
}

const CurrentUserContext = createContext<CurrentUser | null>(null);

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Only fetch user data if user is signed in with Clerk
    if (isLoaded && isSignedIn) {
      api.get('/me')
        .then(r => setUser(r.data))
        .catch(() => setUser(null));
    } else if (isLoaded && !isSignedIn) {
      // Clear user data if not signed in
      setUser(null);
    }
  }, [isSignedIn, isLoaded]);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(CurrentUserContext);
