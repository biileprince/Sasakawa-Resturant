//client/src/hooks/useAuthRequired.ts
import { useUser } from '@clerk/clerk-react';
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthRequired = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const withAuth = useCallback((action: () => void) => {
    if (isSignedIn) {
      action();
    } else {
      sessionStorage.setItem('redirectAfterAuth', location.pathname + location.search);
      navigate('/sign-in?redirect=' + encodeURIComponent(location.pathname + location.search));
    }
  }, [isSignedIn, navigate, location]);

  return { withAuth };
};
