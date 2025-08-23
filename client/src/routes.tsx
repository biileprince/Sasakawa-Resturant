import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import HomePage from './pages/home/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import MenuPage from './pages/public/MenuPage';
import RequestsPage from './pages/public/RequestsPage';
import SignInPage from './pages/auth/SignInPage';
import CreateRequestPage from './pages/protected/CreateRequestPage';
import RequestDetailPage from './pages/public/RequestDetailPage';
import EditRequestPage from './pages/protected/EditRequestPage';
import ApprovalsPage from './pages/protected/ApprovalsPage';
import InvoicesPage from './pages/protected/InvoicesPage';
import PaymentsPage from './pages/protected/PaymentsPage';
import InvoiceDetailPage from './pages/protected/InvoiceDetailPage';
import PaymentDetailPage from './pages/protected/PaymentDetailPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'requests/:id', element: <RequestDetailPage /> },
      { path: 'requests/:id/edit', element: <AuthenticatedLayout><EditRequestPage /></AuthenticatedLayout> },
      { path: 'requests/new', element: <AuthenticatedLayout><CreateRequestPage /></AuthenticatedLayout> },
      { path: 'approvals', element: <AuthenticatedLayout><ApprovalsPage /></AuthenticatedLayout> },
      { path: 'invoices', element: <AuthenticatedLayout><InvoicesPage /></AuthenticatedLayout> },
      { path: 'invoices/:id', element: <AuthenticatedLayout><InvoiceDetailPage /></AuthenticatedLayout> },
      { path: 'payments', element: <AuthenticatedLayout><PaymentsPage /></AuthenticatedLayout> },
      { path: 'payments/:id', element: <AuthenticatedLayout><PaymentDetailPage /></AuthenticatedLayout> },
      { path: 'sign-in', element: <SignInPage /> },
    ],
  },
]);

export default router;
