import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPaymentById, uploadPaymentAttachment } from '../../services/request.service';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import AttachmentViewer from '../../components/AttachmentViewer';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const currentUser = useCurrentUser();
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => getPaymentById(id!),
    enabled: !!id,
  });
  
  if (isLoading) return <PaymentSkeleton />;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return <div className="p-6">Not found</div>;
  
  // Role-based access
  const isRequester = currentUser?.role === 'REQUESTER';
  const isFinanceOfficer = currentUser?.role === 'FINANCE_OFFICER';
  const canUpload = isFinanceOfficer;
  
  // Check if requester can view this payment (we'll need to fetch the invoice to check ownership)
  // For now, allow requesters to view any payment (the backend should handle proper access control)
  if (isRequester && false) { // Temporarily disabled - backend should handle this
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You can only view payments related to your own requests.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <nav className="text-xs text-gray-500 flex flex-wrap items-center gap-1">
          <Link to="/" className="hover:underline">Home</Link><span>/</span>
          <Link to="/payments" className="hover:underline">Payments</Link><span>/</span>
          <span className="text-gray-700">{data.id.slice(0,8)}</span>
        </nav>
        <Link to="/payments" className="text-sm text-blue-600 hover:underline">Back</Link>
      </div>
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-3 flex-wrap">
            Payment 
            <span className="text-gray-400">#{data.id.slice(0,8)}</span> 
            <StatusBadge status={data.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            For Invoice 
            <Link to={`/invoices/${data.invoiceId}`} className="underline text-blue-600 ml-1">
              {data.invoiceId.slice(0,8)}
            </Link>
          </p>
        </div>
      </header>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Amount" value={`GHS ${Number(data.amount || 0).toFixed(2)}`} />
        <Stat label="Method" value={data.method} />
        <Stat label="Status" value={<StatusBadge status={data.status} />} />
        <Stat label="Invoice" value={<Link to={`/invoices/${data.invoiceId}`} className="underline text-blue-600">{data.invoiceId.slice(0,8)}</Link>} />
      </section>

      {/* Attachments Section */}
      <AttachmentViewer
        attachments={data.attachments || []}
        entityId={data.id}
        entityType="payment"
        canUpload={canUpload}
        uploadFunction={uploadPaymentAttachment}
        queryKey={['payment', id!]}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="font-medium">{String(value)}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color: Record<string,string> = {
    PENDING: 'bg-amber-100 text-amber-700 ring-amber-200',
    COMPLETED: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    FAILED: 'bg-red-100 text-red-700 ring-red-200'
  };
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ring-1 ${color[status] || 'bg-gray-100 text-gray-600 ring-gray-200'}`}>{status}</span>;
}

function PaymentSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded" />
      <div className="h-8 w-72 bg-gray-200 rounded" />
      <div className="grid md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
      </div>
    </div>
  );
}
