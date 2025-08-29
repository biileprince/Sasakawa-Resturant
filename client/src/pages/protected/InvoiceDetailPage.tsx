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
  
  // Check if requester can view this invoice (if it's their own request)
  if (isRequester && data.request?.requesterId !== currentUser?.id) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You can only view invoices related to your own requests.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <nav className="text-xs text-gray-500 flex flex-wrap items-center gap-1">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link to="/invoices" className="hover:underline">Invoices</Link>
          <span>/</span>
          <span className="text-gray-700">{data.id.slice(0,8)}</span>
        </nav>
        <Link to="/invoices" className="text-sm text-blue-600 hover:underline">Back</Link>
      </div>

      <header className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-3 flex-wrap">
            Invoice 
            <span className="text-gray-400">#{data.id.slice(0,8)}</span> 
            <StatusBadge status={data.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Linked to Request 
            <Link to={`/requests/${data.requestId}`} className="underline text-blue-600 ml-1">
              {data.requestId.slice(0,8)}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {canRecordPayment && (
            <Link 
              to={`/payments`} 
              className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded flex-1 sm:flex-none text-center"
            >
              <span className="hidden sm:inline">Record Payment</span>
              <span className="sm:hidden">Add Payment</span>
            </Link>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Net Amount" value={Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(Number(data.netAmount) || 0)} />
        <Stat label="Status" value={<StatusBadge status={data.status} />} />
        <Stat label="Due Date" value={data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '-'} />
        <Stat label="Payments" value={`${data.payments?.length || 0}`} />
      </section>

      <section className="bg-white border rounded-lg p-4 sm:p-5 shadow-sm">
        <h2 className="font-medium mb-4 text-sm tracking-wide uppercase text-gray-600">Payments</h2>
        {data.payments?.length ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Method</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p: any) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">
                        <Link to={`/payments/${p.id}`} className="underline text-blue-600">
                          {p.id.slice(0,8)}
                        </Link>
                      </td>
                      <td className="p-2">GHS {Number(p.amount).toFixed(2)}</td>
                      <td className="p-2">{p.method}</td>
                      <td className="p-2"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {data.payments.map((p: any) => (
                <div key={p.id} className="glass-card p-4 border border-primary-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link to={`/payments/${p.id}`} className="underline text-blue-600 font-medium text-sm">
                        #{p.id.slice(0,8)}
                      </Link>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
                      <p className="text-gray-900 font-medium">GHS {Number(p.amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Method</p>
                      <p className="text-gray-900">{p.method}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500 text-center py-8">
            <i className="fas fa-credit-card text-4xl text-gray-300 mb-3"></i>
            <p>No payments recorded.</p>
          </div>
        )}
      </section>

      {/* Attachments Section */}
      <AttachmentViewer
        attachments={data.attachments || []}
        entityId={data.id}
        entityType="invoice"
        canUpload={canUpload}
        uploadFunction={uploadInvoiceAttachment}
        queryKey={['invoice', id!]}
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
    PAID: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    OVERDUE: 'bg-red-100 text-red-700 ring-red-200',
    APPROVED: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
    SUBMITTED: 'bg-blue-100 text-blue-700 ring-blue-200',
    NEEDS_REVISION: 'bg-amber-100 text-amber-700 ring-amber-200',
    REJECTED: 'bg-red-100 text-red-700 ring-red-200',
    FULFILLED: 'bg-emerald-100 text-emerald-700 ring-emerald-200'
  };
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ring-1 ${color[status] || 'bg-gray-100 text-gray-600 ring-gray-200'}`}>{status}</span>;
}

function InvoiceSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded" />
      <div className="h-8 w-72 bg-gray-200 rounded" />
      <div className="grid md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  );
}
