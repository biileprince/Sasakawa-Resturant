import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getPayments, createPayment } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';

export default function PaymentsPage() {
  const { push } = useToast();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['payments'], queryFn: getPayments });
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: '', reference: '', paymentDate: '' });
  const createMut = useMutation({
    mutationFn: async () => createPayment({ 
      invoiceId: form.invoiceId, 
      amount: Number(form.amount), 
      method: form.method as 'CHEQUE' | 'TRANSFER' | 'MOBILE_MONEY',
      reference: form.reference || undefined,
      paymentDate: form.paymentDate
    }),
    onSuccess: () => { 
      push('Payment recorded'); 
      qc.invalidateQueries({ queryKey: ['payments'] }); 
      setForm({ invoiceId: '', amount: '', method: '', reference: '', paymentDate: '' }); 
    },
    onError: () => push('Failed to create payment'),
  });

  const canCreate = user?.capabilities?.canCreatePayment;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Payments</h1>
      {canCreate && (
        <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }} className="grid md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm items-end bg-white p-4 rounded border">
          <div>
            <label className="block text-xs font-medium mb-1">Invoice ID</label>
            <input className="border rounded px-2 py-1 w-full" value={form.invoiceId} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Amount</label>
            <input type="number" step="0.01" className="border rounded px-2 py-1 w-full" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Method</label>
            <select className="border rounded px-2 py-1 w-full" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} required>
              <option value="">Select method</option>
              <option value="CHEQUE">Cheque</option>
              <option value="TRANSFER">Bank Transfer</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Reference</label>
            <input className="border rounded px-2 py-1 w-full" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Payment Date</label>
            <input type="date" className="border rounded px-2 py-1 w-full" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} required />
          </div>
          <button disabled={createMut.isPending} className="bg-blue-600 text-white px-3 py-2 rounded text-xs disabled:opacity-50 col-span-full lg:col-span-1">Record</button>
        </form>
      )}
      <div className="overflow-x-auto text-sm">
        {isLoading ? <TableSkeleton rows={5} cols={6} /> : (
          <table className="min-w-full border bg-white">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <Th>Payment No</Th><Th>Invoice</Th><Th>Amount</Th><Th>Status</Th><Th>Method</Th><Th>Payment Date</Th>
              </tr>
            </thead>
            <tbody>
              {data?.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <Td>{p.paymentNo || p.id.slice(0,8)}</Td>
                  <Td>{p.invoiceId?.slice(0,8) || '-'}</Td>
                  <Td>{Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(Number(p.amount) || 0)}</Td>
                  <Td>{p.status}</Td>
                  <Td>{p.method}</Td>
                  <Td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Th({ children }: any) { return <th className="text-left px-3 py-2 font-medium border-b">{children}</th>; }
function Td({ children }: any) { return <td className="px-3 py-2 align-top">{children}</td>; }

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-8 m-1 bg-gray-200 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
