import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getInvoices, createInvoice } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';

export default function InvoicesPage() {
  const { push } = useToast();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: getInvoices });
  const [form, setForm] = useState({ 
    requestId: '', 
    invoiceDate: '', 
    dueDate: '', 
    grossAmount: '', 
    taxAmount: '', 
    netAmount: '' 
  });
  const createMut = useMutation({
    mutationFn: async () => createInvoice({ 
      requestId: form.requestId, 
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      grossAmount: Number(form.grossAmount), 
      taxAmount: Number(form.taxAmount), 
      netAmount: Number(form.netAmount) 
    }),
    onSuccess: () => { 
      push('Invoice created'); 
      qc.invalidateQueries({ queryKey: ['invoices'] }); 
      setForm({ requestId: '', invoiceDate: '', dueDate: '', grossAmount: '', taxAmount: '', netAmount: '' }); 
    },
    onError: () => push('Failed to create invoice'),
  });

  const canCreate = user?.capabilities?.canCreateInvoice;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Invoices</h1>
      {canCreate && (
        <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }} className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm items-end bg-white p-4 rounded border">
          <div>
            <label className="block text-xs font-medium mb-1">Request ID</label>
            <input className="border rounded px-2 py-1 w-full" value={form.requestId} onChange={e => setForm(f => ({ ...f, requestId: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Invoice Date</label>
            <input type="date" className="border rounded px-2 py-1 w-full" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Due Date</label>
            <input type="date" className="border rounded px-2 py-1 w-full" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Gross Amount</label>
            <input type="number" step="0.01" className="border rounded px-2 py-1 w-full" value={form.grossAmount} onChange={e => setForm(f => ({ ...f, grossAmount: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tax Amount</label>
            <input type="number" step="0.01" className="border rounded px-2 py-1 w-full" value={form.taxAmount} onChange={e => setForm(f => ({ ...f, taxAmount: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Net Amount</label>
            <input type="number" step="0.01" className="border rounded px-2 py-1 w-full" value={form.netAmount} onChange={e => setForm(f => ({ ...f, netAmount: e.target.value }))} required />
          </div>
          <button disabled={createMut.isPending} className="bg-blue-600 text-white px-3 py-2 rounded text-xs disabled:opacity-50 col-span-full lg:col-span-1">Create</button>
        </form>
      )}
      <div className="overflow-x-auto text-sm">
        {isLoading ? <TableSkeleton rows={5} cols={6} /> : (
          <table className="min-w-full border bg-white">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <Th>Invoice No</Th><Th>Request</Th><Th>Net Amount</Th><Th>Status</Th><Th>Due Date</Th><Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {data?.map((inv: any) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <Td>{inv.invoiceNo || inv.id.slice(0,8)}</Td>
                  <Td>{inv.requestId?.slice(0,8) || '-'}</Td>
                  <Td>{Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(Number(inv.netAmount) || 0)}</Td>
                  <Td>{inv.status}</Td>
                  <Td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</Td>
                  <Td>{new Date(inv.createdAt).toLocaleDateString()}</Td>
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
