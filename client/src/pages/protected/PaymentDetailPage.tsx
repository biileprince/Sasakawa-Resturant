import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPaymentById } from '../../services/request.service';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => getPaymentById(id!),
    enabled: !!id,
  });
  if (isLoading) return <PaymentSkeleton />;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!data) return <div className="p-6">Not found</div>;
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <nav className="text-xs text-gray-500 flex flex-wrap items-center gap-1">
          <Link to="/" className="hover:underline">Home</Link><span>/</span>
          <Link to="/payments" className="hover:underline">Payments</Link><span>/</span>
          <span className="text-gray-700">{data.id.slice(0,8)}</span>
        </nav>
        <Link to="/payments" className="text-sm text-blue-600 hover:underline">Back</Link>
      </div>
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Payment <span className="text-gray-400">#{data.id.slice(0,8)}</span> <StatusBadge status={data.status} /></h1>
          <p className="text-sm text-gray-500">For Invoice <Link to={`/invoices/${data.invoiceId}`} className="underline text-blue-600">{data.invoiceId.slice(0,8)}</Link></p>
        </div>
      </header>
      <section className="grid md:grid-cols-4 gap-4">
        <Stat label="Amount" value={Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(Number(data.amount) || 0)} />
        <Stat label="Method" value={data.method} />
        <Stat label="Status" value={<StatusBadge status={data.status} />} />
        <Stat label="Invoice" value={<Link to={`/invoices/${data.invoiceId}`} className="underline text-blue-600">{data.invoiceId.slice(0,8)}</Link>} />
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
