import { useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return <div className="p-10">Loading...</div>;
  }

  if (!isSignedIn) {
    sessionStorage.setItem('postSignInRedirect', location.pathname + location.search);
    return <Navigate to="/sign-in" replace />;
  }
  
  return <>{children}</>;
}
