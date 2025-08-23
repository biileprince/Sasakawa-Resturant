import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { CurrentUserProvider } from './contexts/CurrentUserContext';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const queryClient = new QueryClient();

function ApiAuthBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  // lazy import to avoid circular
  import('./services/apiClient').then(m => m.setAuthHeader(getToken));
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CurrentUserProvider>
            <ApiAuthBridge>
              <App />
            </ApiAuthBridge>
          </CurrentUserProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
