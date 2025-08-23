import { useUser, SignIn } from '@clerk/clerk-react';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div className="p-10">Loading...</div>;
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Sign in to continue</h2>
          <SignIn />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
