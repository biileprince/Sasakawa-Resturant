//client/src/contexts/CurrentUserContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import api from "../services/apiClient";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  capabilities?: Record<string, boolean>;
}

interface CurrentUserContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextType>({
  user: null,
  isLoading: true,
  refetch: async () => {},
});

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn, isLoaded } = useUser();

  const fetchUser = useCallback(async () => {
    if (isLoaded && isSignedIn) {
      setIsLoading(true);
      try {
        const response = await api.get("/me");
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
      setIsLoading(false);
    }
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetch = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <CurrentUserContext.Provider value={{ user, isLoading, refetch }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  return context.user;
};

export const useCurrentUserContext = () => useContext(CurrentUserContext);
