import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getPayments, createPayment, getInvoices } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Link } from 'react-router-dom';

export default function PaymentsPage() {
  const { push } = useToast();
  const currentUser = useCurrentUser();
  const qc = useQueryClient();
  const { data: allPayments, isLoading } = useQuery({ queryKey: ['payments'], queryFn: getPayments });
  const { data: allInvoices } = useQuery({ queryKey: ['invoices'], queryFn: getInvoices });
  const [form, setForm] = useState({ 
    invoiceId: '', 
    amount: '', 
    method: '', 
    reference: '', 
    paymentDate: new Date().toISOString().split('T')[0]
  });

  // Role-based access
  const isRequester = currentUser?.role === 'REQUESTER';
  const isFinanceOfficer = currentUser?.role === 'FINANCE_OFFICER';
  
  // Requesters can only see payments for their own invoices
  const payments = isRequester 
    ? allPayments?.filter((payment: any) => payment.invoice?.request?.requesterId === currentUser?.id) 
    : allPayments;
  
  // Filter invoices for payment creation (only finance officers can create payments)
  const invoices = isFinanceOfficer ? allInvoices : [];
  
  // Filter invoices that can be paid
  const payableInvoices = invoices?.filter((inv: any) => 
    ['SUBMITTED', 'VERIFIED', 'APPROVED_FOR_PAYMENT', 'PARTIALLY_PAID'].includes(inv.status)
  ) || [];
  
  const createMut = useMutation({
    mutationFn: async () => createPayment({ 
      invoiceId: form.invoiceId, 
      amount: Number(form.amount), 
      method: form.method as 'CHEQUE' | 'TRANSFER' | 'MOBILE_MONEY',
      reference: form.reference || undefined,
      paymentDate: form.paymentDate
    }),
    onSuccess: () => { 
      push('Payment recorded successfully', 'success'); 
      qc.invalidateQueries({ queryKey: ['payments'] }); 
      qc.invalidateQueries({ queryKey: ['invoices'] }); 
      setForm({ 
        invoiceId: '', 
        amount: '', 
        method: '', 
        reference: '', 
        paymentDate: new Date().toISOString().split('T')[0]
      }); 
    },
    onError: (error: any) => {
      console.error('Payment creation error:', error);
      const message = error?.response?.data?.message || 'Failed to create payment';
      push(message, 'error');
    },
  });

  const canCreate = isFinanceOfficer;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        <div className="text-sm text-gray-500">
          Total Payments: {payments?.length || 0}
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h3 className="text-sm font-semibold text-green-900 mb-2">Payment Status Guide</h3>
        <div className="text-sm text-green-800 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <p><strong>Draft:</strong> Payment record created but not yet processed</p>
          </div>
          <div>
            <p><strong>Processed:</strong> Payment has been initiated and is being handled</p>
          </div>
          <div>
            <p><strong>Cleared:</strong> Payment successfully completed and funds transferred</p>
          </div>
          <div>
            <p><strong>Cancelled:</strong> Payment was cancelled before completion</p>
          </div>
          <div>
            <p><strong>Failed:</strong> Payment attempt was unsuccessful</p>
          </div>
        </div>
      </div>

      {canCreate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Record New Payment</h2>
          <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Invoice</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.invoiceId} 
                  onChange={e => {
                    const selectedInvoice = payableInvoices.find((inv: any) => inv.id === e.target.value);
                    setForm(f => ({ 
                      ...f, 
                      invoiceId: e.target.value,
                      amount: selectedInvoice?.netAmount?.toString() || ''
                    }));
                  }} 
                  required
                >
                  <option value="">Select an invoice to pay...</option>
                  {payableInvoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNo || inv.id.slice(0, 8)} - {inv.request?.eventName} (GHS {Number(inv.netAmount || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.paymentDate} 
                  onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (GHS)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.amount} 
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.method} 
                  onChange={e => setForm(f => ({ ...f, method: e.target.value }))} 
                  required
                >
                  <option value="">Select payment method...</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.reference} 
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} 
                  placeholder="Transaction reference (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={createMut.isPending || !form.invoiceId || !form.amount || !form.method} 
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMut.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Recording...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card mr-2"></i>
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Payments</h3>
        </div>
        
        {isLoading ? <TableSkeleton rows={5} cols={7} /> : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Payment No</Th>
                    <Th>Invoice</Th>
                    <Th>Event</Th>
                    <Th>Amount</Th>
                    <Th>Method</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <i className="fas fa-credit-card text-4xl text-gray-300 mb-4"></i>
                          <p className="text-lg font-medium">No payments found</p>
                          <p className="text-sm">Record your first payment to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments?.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <Td>
                          <div className="font-medium text-primary-600">
                            {payment.paymentNo || payment.id.slice(0,8)}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {payment.invoice?.invoiceNo || payment.invoiceId?.slice(0,8) || '-'}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {payment.invoice?.request?.eventName || '-'}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm font-medium text-gray-900">
                            GHS {Number(payment.amount || 0).toFixed(2)}
                          </div>
                        </Td>
                        <Td>
                          <PaymentMethodBadge method={payment.method} />
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                          </div>
                        </Td>
                        <Td>
                          <PaymentStatusBadge status={payment.status} />
                        </Td>
                        <Td>
                          <div className="flex space-x-2">
                            <Link
                              to={`/payments/${payment.id}`}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              View
                            </Link>
                            {isFinanceOfficer && (
                              <Link
                                to={`/payments/${payment.id}/edit`}
                                className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                              >
                                Edit
                              </Link>
                            )}
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {payments?.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-credit-card text-4xl text-gray-300 mb-4"></i>
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm">Record your first payment to get started.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {payments?.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="glass-card p-4 border border-primary-100"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {payment.invoice?.request?.eventName || 'Payment'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            #{payment.paymentNo || payment.id.slice(0,8)}
                          </p>
                        </div>
                        <PaymentStatusBadge status={payment.status} />
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Invoice</p>
                          <p className="text-gray-900">
                            {payment.invoice?.invoiceNo || payment.invoiceId?.slice(0,8) || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Payment Date</p>
                          <p className="text-gray-900">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
                          <p className="text-gray-900 font-medium">
                            GHS {Number(payment.amount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Method</p>
                          <PaymentMethodBadge method={payment.method} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            to={`/payments/${payment.id}`}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            View
                          </Link>
                          {isFinanceOfficer && (
                            <Link
                              to={`/payments/${payment.id}/edit`}
                              className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = '' }: any) { 
  return (
    <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  ); 
}

function Td({ children, className = '' }: any) { 
  return (
    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  ); 
}

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

function PaymentMethodBadge({ method }: { method: string }) {
  const getMethodClass = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cheque': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-green-100 text-green-800';
      case 'mobile_money': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodClass(method)}`}>
      {method?.replace(/_/g, ' ')}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const getStatusClass = (status: string) => {
    const baseClass = "status-badge";
    switch (status?.toLowerCase()) {
      case 'processed': return `${baseClass} status-approved`;
      case 'cleared': return `${baseClass} status-fulfilled`;
      case 'cancelled': return `${baseClass} status-rejected`;
      default: return `${baseClass} status-draft`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processed': return 'fas fa-check-circle';
      case 'cleared': return 'fas fa-check-double';
      case 'cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-clock';
    }
  };

  return (
    <div className="status-wrapper">
      <span className={getStatusClass(status)}>
        <i className={`${getStatusIcon(status)} mr-1`}></i>
        {status}
      </span>
    </div>
  );
}
