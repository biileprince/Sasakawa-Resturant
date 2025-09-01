import { SignUp, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner size="lg" text="Loading authentication..." />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Get started with your new account</p>
          </div>
          
          <div className="flex justify-center">
            <SignUp 
              fallbackRedirectUrl="/"
              forceRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full"
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
