import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInvoiceById, uploadInvoiceAttachment } from '../../services/request.service';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import AttachmentViewer from '../../components/AttachmentViewer';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const currentUser = useCurrentUser();
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
  });
  
  if (isLoading) return <InvoiceSkeleton />;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return <div className="p-6">Not found</div>;
  
  // Role-based access: Requesters can only see their own invoices
  const isRequester = currentUser?.role === 'REQUESTER';
  const isFinanceOfficer = currentUser?.role === 'FINANCE_OFFICER';
  const canUpload = isFinanceOfficer;
  const canRecordPayment = isFinanceOfficer;
  
  // Check if requester can view this invoice (we'll need to fetch the request to check ownership)
  // For now, allow requesters to view any invoice (the backend should handle proper access control)
  if (isRequester && false) { // Temporarily disabled - backend should handle this
    return (
      <div className="min-h-screen main-background">
        <div className="max-w-5xl mx-auto p-6">
          <div className="glass-card text-center py-12">
            <i className="fas fa-lock text-6xl text-white/40 mb-4"></i>
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-white/80">You can only view invoices related to your own requests.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen main-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <nav className="text-xs text-white/80 flex flex-wrap items-center gap-1">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/invoices" className="hover:text-white transition-colors">Invoices</Link>
            <span>/</span>
            <span className="text-white">{data.id.slice(0,8)}</span>
          </nav>
          <Link to="/invoices" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">← Back to Invoices</Link>
        </div>

        <header className="glass-hero flex items-end justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-3 flex-wrap text-shadow-strong">
              <i className="fas fa-file-invoice text-blue-300"></i>
              Invoice 
              <span className="text-white/70">#{data.id.slice(0,8)}</span> 
              <StatusBadge status={data.status} />
            </h1>
            <p className="text-sm text-white/80 mt-2">
              Linked to Request 
              <Link to={`/requests/${data.requestId}`} className="underline text-blue-300 hover:text-blue-200 ml-1 transition-colors">
                #{data.requestId.slice(0,8)}
              </Link>
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {canRecordPayment && (
              <Link 
                to={`/payments`} 
                className="btn-primary flex items-center gap-2 flex-1 sm:flex-none text-center"
              >
                <i className="fas fa-credit-card"></i>
                <span className="hidden sm:inline">Record Payment</span>
                <span className="sm:hidden">Add Payment</span>
              </Link>
            )}
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Net Amount" value={Intl.NumberFormat(undefined,{style:'currency',currency:'GHS'}).format(Number(data.netAmount) || 0)} />
          <Stat label="Status" value={<StatusBadge status={data.status} />} />
          <Stat label="Due Date" value={data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '-'} />
          <Stat label="Payments" value={`${data.payments?.length || 0}`} />
        </section>

        <section className="glass-card p-4 sm:p-6 shadow-lg">
          <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
            <i className="fas fa-money-check-alt text-green-300"></i>
            Payment History
          </h2>
          {data.payments?.length ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-white/60 border-b border-white/10">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Method</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/90">
                    {data.payments.map((payment: any, index: number) => (
                      <tr key={payment.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                        <td className="p-3">
                          <Link to={`/payments/${payment.id}`} className="text-blue-300 hover:text-blue-200 font-mono">
                            #{payment.id.slice(0,8)}
                          </Link>
                        </td>
                        <td className="p-3 font-semibold">₵{Number(payment.amount).toLocaleString()}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/10 text-white/80">
                            <i className={`fas ${getPaymentMethodIcon(payment.method)}`}></i>
                            {payment.method}
                          </span>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="p-3 text-white/70">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Link to={`/payments/${payment.id}`} className="btn-detail">
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {data.payments.map((payment: any) => (
                  <div key={payment.id} className="glass-subtle p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/payments/${payment.id}`} className="text-blue-300 hover:text-blue-200 font-mono text-sm">
                        #{payment.id.slice(0,8)}
                      </Link>
                      <StatusBadge status={payment.status} />
                    </div>
                    <div className="text-lg font-semibold text-white mb-1">₵{Number(payment.amount).toLocaleString()}</div>
                    <div className="flex justify-between items-center text-sm text-white/70">
                      <span className="flex items-center gap-1">
                        <i className={`fas ${getPaymentMethodIcon(payment.method)}`}></i>
                        {payment.method}
                      </span>
                      <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3">
                      <Link to={`/payments/${payment.id}`} className="btn-detail w-full">
                        <i className="fas fa-eye mr-1"></i>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-white/60">
              <i className="fas fa-money-bill-wave text-4xl mb-3 opacity-30"></i>
              <p>No payments recorded yet</p>
              {canRecordPayment && (
                <Link to="/payments" className="btn-primary mt-3 inline-flex items-center gap-2">
                  <i className="fas fa-plus"></i>
                  Record First Payment
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="glass-card p-4 sm:p-6 shadow-lg">
          <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-300"></i>
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Info label="Gross Amount" value={`₵${Number(data.grossAmount || 0).toLocaleString()}`} />
              <Info label="Tax Amount" value={`₵${Number(data.taxAmount || 0).toLocaleString()}`} />
              <Info label="Net Amount" value={`₵${Number(data.netAmount || 0).toLocaleString()}`} />
              <Info label="Status" value={<StatusBadge status={data.status} />} />
            </div>
            <div className="space-y-4">
              <Info label="Due Date" value={data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'Not set'} />
              <Info label="Created" value={new Date(data.createdAt).toLocaleDateString()} />
              <Info label="Created By" value={data.creator?.name || 'System'} />
              <Info label="Request ID" value={
                <Link to={`/requests/${data.requestId}`} className="text-blue-300 hover:text-blue-200 font-mono">
                  #{data.requestId.slice(0,8)}
                </Link>
              } />
            </div>
          </div>
        </section>

        {data.attachments?.length > 0 && (
          <section className="glass-card p-4 sm:p-6 shadow-lg">
            <h2 className="font-semibold mb-4 text-white flex items-center gap-2">
              <i className="fas fa-paperclip text-yellow-300"></i>
              Attachments
            </h2>
            <AttachmentViewer 
              attachments={data.attachments} 
              canUpload={canUpload}
              onUpload={(file) => uploadInvoiceAttachment(data.id, file)}
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
    PAID: 'bg-green-500/20 text-green-300 border-green-500/30',
    OVERDUE: 'bg-red-500/20 text-red-300 border-red-500/30',
    CANCELLED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    PARTIALLY_PAID: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    DRAFT: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
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

function InvoiceSkeleton() {
  return (
    <div className="min-h-screen main-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
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
