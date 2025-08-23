//client/src/contexts/CurrentUserContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';

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

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(CurrentUserContext);
