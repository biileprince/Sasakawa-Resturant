import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentById, updatePayment } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';

export default function EditPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const currentUser = useCurrentUser();
  const qc = useQueryClient();
  
  const { data: payment, isLoading } = useQuery({ 
    queryKey: ['payment', id], 
    queryFn: () => getPaymentById(id!),
    enabled: !!id
  });

  const [form, setForm] = useState({
    amount: '',
    method: '',
    reference: '',
    paymentDate: '',
    status: ''
  });

  useEffect(() => {
    if (payment) {
      setForm({
        amount: Number(payment.amount || 0).toString(),
        method: payment.method || '',
        reference: payment.reference || '',
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
        status: payment.status || ''
      });
    }
  }, [payment]);

  const updateMut = useMutation({
    mutationFn: async () => updatePayment(id!, {
      amount: Number(form.amount),
      method: form.method as 'CHEQUE' | 'TRANSFER' | 'MOBILE_MONEY',
      reference: form.reference || undefined,
      paymentDate: form.paymentDate,
      status: form.status
    }),
    onSuccess: () => {
      push('Payment updated successfully', 'success');
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment', id] });
      navigate('/payments');
    },
    onError: (error: any) => {
      console.error('Payment update error:', error);
      const message = error?.response?.data?.message || 'Failed to update payment';
      push(message, 'error');
    }
  });

  const canEdit = currentUser?.role === 'FINANCE_OFFICER';

  if (!canEdit) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">You don't have permission to edit payments.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Payment not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Payment</h1>
        <button
          onClick={() => navigate('/payments')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Payments
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Payment ID:</strong> {payment.id}</p>
            <p><strong>Payment No:</strong> {payment.paymentNo}</p>
            <p><strong>Invoice ID:</strong> {payment.invoiceId}</p>
            <p><strong>Current Status:</strong> 
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                payment.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                payment.status === 'PROCESSED' ? 'bg-blue-100 text-blue-800' :
                payment.status === 'CLEARED' ? 'bg-green-100 text-green-800' :
                payment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {payment.status?.replace(/_/g, ' ')}
              </span>
            </p>
            <p><strong>Created:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); updateMut.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (GHS)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={form.reference}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
              placeholder="Enter transaction reference or cheque number..."
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Transaction ID, cheque number, or other reference</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              required
            >
              <option value="DRAFT">Draft</option>
              <option value="PROCESSED">Processed</option>
              <option value="CLEARED">Cleared</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/payments')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {updateMut.isPending ? 'Updating...' : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
