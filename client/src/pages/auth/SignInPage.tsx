import { SignIn, useUser } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner size="lg" text="Loading authentication..." />
      </div>
    );
  }

  if (isSignedIn) {
    const redirect = sessionStorage.getItem('postSignInRedirect') || '/';
    sessionStorage.removeItem('postSignInRedirect');
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <SignIn 
              fallbackRedirectUrl="/"
              forceRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full max-w-sm mx-auto",
                  card: "shadow-none border-0 w-full",
                  formButtonPrimary: "w-full",
                  formFieldInput: "w-full",
                  footer: "hidden"
                }
              }}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/sign-up" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
