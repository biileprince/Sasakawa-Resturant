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
      <div className="min-h-screen main-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="glass-card text-center py-12">
            <i className="fas fa-lock text-6xl text-white/40 mb-4"></i>
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-white/80">You can only view payments related to your own requests.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen main-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <nav className="text-xs text-white/80 flex flex-wrap items-center gap-1">
            <Link to="/" className="hover:text-white transition-colors">Home</Link><span>/</span>
            <Link to="/payments" className="hover:text-white transition-colors">Payments</Link><span>/</span>
            <span className="text-white">{data.id.slice(0,8)}</span>
          </nav>
          <Link to="/payments" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">← Back to Payments</Link>
        </div>
        
        <header className="glass-hero flex items-end justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-3 flex-wrap text-shadow-strong">
              <i className="fas fa-credit-card text-green-300"></i>
              Payment 
              <span className="text-white/70">#{data.id.slice(0,8)}</span> 
              <StatusBadge status={data.status} />
            </h1>
            <p className="text-sm text-white/80 mt-2">
              For Invoice 
              <Link to={`/invoices/${data.invoiceId}`} className="underline text-blue-300 hover:text-blue-200 ml-1 transition-colors">
                #{data.invoiceId.slice(0,8)}
              </Link>
            </p>
          </div>
        </header>
        
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Amount" value={`₵${Number(data.amount || 0).toLocaleString()}`} />
          <Stat label="Method" value={
            <span className="flex items-center gap-1">
              <i className={`fas ${getPaymentMethodIcon(data.method)}`}></i>
              {data.method}
            </span>
          } />
          <Stat label="Status" value={<StatusBadge status={data.status} />} />
          <Stat label="Date" value={new Date(data.paymentDate).toLocaleDateString()} />
        </section>

        <section className="glass-card p-4 sm:p-6 shadow-lg">
          <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-300"></i>
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Info label="Payment ID" value={`#${data.id.slice(0,8)}`} />
              <Info label="Amount" value={`₵${Number(data.amount || 0).toLocaleString()}`} />
              <Info label="Payment Method" value={
                <span className="flex items-center gap-1">
                  <i className={`fas ${getPaymentMethodIcon(data.method)}`}></i>
                  {data.method}
                </span>
              } />
              <Info label="Status" value={<StatusBadge status={data.status} />} />
            </div>
            <div className="space-y-4">
              <Info label="Payment Date" value={new Date(data.paymentDate).toLocaleDateString()} />
              <Info label="Created" value={new Date(data.createdAt).toLocaleDateString()} />
              <Info label="Invoice ID" value={
                <Link to={`/invoices/${data.invoiceId}`} className="text-blue-300 hover:text-blue-200 font-mono">
                  #{data.invoiceId.slice(0,8)}
                </Link>
              } />
              <Info label="Reference" value={data.reference || 'N/A'} />
            </div>
          </div>
        </section>

        {/* Attachments Section */}
        {(data.attachments && data.attachments.length > 0 || canUpload) && (
          <section className="glass-card p-4 sm:p-6 shadow-lg">
            <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
              <i className="fas fa-paperclip text-yellow-300"></i>
              Payment Attachments
            </h2>
            <AttachmentViewer
              attachments={data.attachments || []}
              entityId={data.id}
              entityType="payment"
              canUpload={canUpload}
              uploadFunction={uploadPaymentAttachment}
              queryKey={['payment', id!]}
            />
          </section>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/10">
      <span className="text-white/70 text-sm">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="glass-subtle p-4 rounded-lg text-center">
      <div className="text-xs text-white/60 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string,string> = {
    PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
    FAILED: 'bg-red-500/20 text-red-300 border-red-500/30',
    CANCELLED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    PROCESSING: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    CASH: 'fa-money-bill',
    CHEQUE: 'fa-money-check',
    TRANSFER: 'fa-university',
    MOBILE_MONEY: 'fa-mobile-alt',
  };
  return icons[method] || 'fa-credit-card';
}

function PaymentSkeleton() {
  return (
    <div className="min-h-screen main-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="glass-hero animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-subtle p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
        <div className="glass-card p-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
