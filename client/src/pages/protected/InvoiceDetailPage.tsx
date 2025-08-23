import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInvoiceById } from '../../services/request.service';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
  });
  if (isLoading) return <InvoiceSkeleton />;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return <div className="p-6">Not found</div>;
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
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
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3">Invoice <span className="text-gray-400">#{data.id.slice(0,8)}</span> <StatusBadge status={data.status} /></h1>
          <p className="text-sm text-gray-500">Linked to Request <Link to={`/requests/${data.requestId}`} className="underline text-blue-600">{data.requestId.slice(0,8)}</Link></p>
        </div>
        <div className="flex gap-2">
          <Link to={`/payments`} className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded">Record Payment</Link>
        </div>
      </header>

      <section className="grid md:grid-cols-4 gap-4">
        <Stat label="Net Amount" value={Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(Number(data.netAmount) || 0)} />
        <Stat label="Status" value={<StatusBadge status={data.status} />} />
        <Stat label="Due Date" value={data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '-'} />
        <Stat label="Payments" value={`${data.payments?.length || 0}`} />
      </section>

      <section className="bg-white border rounded-lg p-5 shadow-sm">
        <h2 className="font-medium mb-4 text-sm tracking-wide uppercase text-gray-600">Payments</h2>
        {data.payments?.length ? (
          <div className="overflow-x-auto">
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
                    <td className="p-2"><Link to={`/payments/${p.id}`} className="underline text-blue-600">{p.id.slice(0,8)}</Link></td>
                    <td className="p-2">{p.amount}</td>
                    <td className="p-2">{p.method}</td>
                    <td className="p-2"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="text-sm text-gray-500">No payments recorded.</div>}
      </section>
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
