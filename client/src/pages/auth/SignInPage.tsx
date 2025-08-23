import { SignIn, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (isSignedIn) {
    const redirect = sessionStorage.getItem('postSignInRedirect') || '/';
    sessionStorage.removeItem('postSignInRedirect');
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Sign In</h1>
        <SignIn 
          afterSignInUrl="/"
          redirectUrl="/"
        />
      </div>
    </div>
  );
}
