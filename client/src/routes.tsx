import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import HomePage from './pages/home/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import PackagesPage from './pages/public/PackagesPage';
import RequestsPage from './pages/public/RequestsPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import CheckoutPage from './pages/protected/CheckoutPage';
import RequestDetailPage from './pages/public/RequestDetailPage';
import EditRequestPage from './pages/protected/EditRequestPage';
import ApprovalsPage from './pages/protected/ApprovalsPage';
import InvoicesPage from './pages/protected/InvoicesPage';
import PaymentsPage from './pages/protected/PaymentsPage';
import InvoiceDetailPage from './pages/protected/InvoiceDetailPage';
import PaymentDetailPage from './pages/protected/PaymentDetailPage';
import EditInvoicePage from './pages/protected/EditInvoicePage';
import EditPaymentPage from './pages/protected/EditPaymentPage';
import UserManagementPage from './pages/protected/UserManagementPage';
import FinanceDashboard from './pages/protected/FinanceDashboard';
import NotificationCenter from './pages/protected/NotificationCenter';
import PackageManagementPage from './pages/protected/PackageManagementPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'checkout', element: <AuthenticatedLayout><CheckoutPage /></AuthenticatedLayout> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'requests/:id', element: <RequestDetailPage /> },
      { path: 'requests/:id/edit', element: <AuthenticatedLayout><EditRequestPage /></AuthenticatedLayout> },
      { path: 'approvals', element: <AuthenticatedLayout><ApprovalsPage /></AuthenticatedLayout> },
      { path: 'finance', element: <AuthenticatedLayout><FinanceDashboard /></AuthenticatedLayout> },
      { path: 'users', element: <AuthenticatedLayout><UserManagementPage /></AuthenticatedLayout> },
      { path: 'notifications', element: <AuthenticatedLayout><NotificationCenter /></AuthenticatedLayout> },
      { path: 'invoices', element: <AuthenticatedLayout><InvoicesPage /></AuthenticatedLayout> },
      { path: 'invoices/:id', element: <AuthenticatedLayout><InvoiceDetailPage /></AuthenticatedLayout> },
      { path: 'invoices/:id/edit', element: <AuthenticatedLayout><EditInvoicePage /></AuthenticatedLayout> },
      { path: 'payments', element: <AuthenticatedLayout><PaymentsPage /></AuthenticatedLayout> },
      { path: 'payments/:id', element: <AuthenticatedLayout><PaymentDetailPage /></AuthenticatedLayout> },
      { path: 'payments/:id/edit', element: <AuthenticatedLayout><EditPaymentPage /></AuthenticatedLayout> },
      { path: 'package-management', element: <AuthenticatedLayout><PackageManagementPage /></AuthenticatedLayout> },
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'sign-up', element: <SignUpPage /> },
    ],
  },
]);

export default router;
