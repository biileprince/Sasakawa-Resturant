import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getInvoices, createInvoice, getRequests, exportInvoicesExcel } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Link } from 'react-router-dom';
import ExportModal from '../../components/ExportModal';
import { formatGhanaDate } from '../../utils/dateFormat';

export default function InvoicesPage() {
  const { push } = useToast();
  const currentUser = useCurrentUser();
  const qc = useQueryClient();
  const { data: allInvoices, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: getInvoices });
  const { data: requests } = useQuery({ queryKey: ['requests'], queryFn: getRequests });
  const [form, setForm] = useState({ 
    requestId: '', 
    invoiceDate: new Date().toISOString().split('T')[0], 
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    grossAmount: '', 
    taxAmount: '0',
    netAmount: '' 
  });
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Role-based access: Filter invoices based on user role
  const isRequester = currentUser?.role === 'REQUESTER';
  const isFinanceOfficer = currentUser?.role === 'FINANCE_OFFICER';
  const isApprover = currentUser?.role === 'APPROVER';
  
  // Only finance officers and requesters can see invoices
  // Requesters can only see invoices for their own requests
  // Approvers cannot see invoices at all
  const invoices = isApprover 
    ? [] // Approvers see no invoices
    : isRequester 
    ? allInvoices?.filter((inv: any) => inv.request?.requesterId === currentUser?.id) 
    : allInvoices;
  
  // Filter requests that can have invoices created (APPROVED only, not FULFILLED)
  const eligibleRequests = requests?.filter((req: any) => 
    req.status === 'APPROVED'
  ) || [];

  // Calculate net amount when gross or tax changes
  const updateNetAmount = (gross: string, tax: string) => {
    const grossNum = parseFloat(gross) || 0;
    const taxNum = parseFloat(tax) || 0;
    const net = grossNum + taxNum;
    setForm(f => ({ ...f, netAmount: net.toString() }));
  };

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
      push('Invoice created successfully', 'success'); 
      qc.invalidateQueries({ queryKey: ['invoices'] }); 
      setForm({ 
        requestId: '', 
        invoiceDate: new Date().toISOString().split('T')[0], 
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        grossAmount: '', 
        taxAmount: '0', 
        netAmount: '' 
      }); 
    },
    onError: (error: any) => {
      console.error('Invoice creation error:', error);
      const message = error?.response?.data?.message || 'Failed to create invoice';
      push(message, 'error');
    },
  });

  const canCreate = isFinanceOfficer;

  // Approvers cannot access invoices
  if (isApprover) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invoice Access Restricted</h1>
          <p className="text-gray-600 mb-4">Approvers do not have access to invoice management.</p>
          <p className="text-sm text-gray-500">Invoice management is handled by Finance Officers only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices Management</h1>
        <div className="flex items-center space-x-4">
          {isFinanceOfficer && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-file-excel mr-2"></i>
              Export Excel
            </button>
          )}
          <div className="text-sm text-gray-500">
            Total Invoices: {invoices?.length || 0}
          </div>
        </div>
      </div>

      {canCreate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Invoice</h2>
          <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }} className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Request</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.requestId} 
                  onChange={e => {
                    const selectedRequest = eligibleRequests.find((req: any) => req.id === e.target.value);
                    setForm(f => ({ 
                      ...f, 
                      requestId: e.target.value,
                      grossAmount: selectedRequest?.estimateAmount?.toString() || ''
                    }));
                    if (selectedRequest?.estimateAmount) {
                      updateNetAmount(selectedRequest.estimateAmount.toString(), form.taxAmount);
                    }
                  }} 
                  required
                >
                  <option value="">Select a fulfilled request...</option>
                  {eligibleRequests.map((req: any) => (
                    <option key={req.id} value={req.id}>
                      {req.eventName} - {req.requestNo || req.id.slice(0, 8)} (GHS {Number(req.estimateAmount || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.invoiceDate} 
                  onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.dueDate} 
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gross Amount (GHS)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.grossAmount} 
                  onChange={e => {
                    setForm(f => ({ ...f, grossAmount: e.target.value }));
                    updateNetAmount(e.target.value, form.taxAmount);
                  }} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount (GHS)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.taxAmount} 
                  onChange={e => {
                    setForm(f => ({ ...f, taxAmount: e.target.value }));
                    updateNetAmount(form.grossAmount, e.target.value);
                  }} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount (GHS)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={form.netAmount} 
                  readOnly
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={createMut.isPending || !form.requestId || !form.grossAmount} 
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMut.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Invoice
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Invoices</h3>
        </div>
        
        {isLoading ? <TableSkeleton rows={5} cols={8} /> : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Invoice No</Th>
                    <Th>Request</Th>
                    <Th>Event</Th>
                    <Th>Department</Th>
                    <Th>Gross Amount</Th>
                    <Th>Net Amount</Th>
                    <Th>Status</Th>
                    <Th>Due Date</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <i className="fas fa-file-invoice-dollar text-4xl text-gray-300 mb-4"></i>
                          <p className="text-lg font-medium">No invoices found</p>
                          <p className="text-sm">Create your first invoice to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invoices?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <Td>
                          <div className="font-medium text-primary-600">
                            {inv.invoiceNo || inv.id.slice(0,8)}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {inv.request?.requestNo || inv.requestId?.slice(0,8) || '-'}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {inv.request?.eventName || '-'}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {inv.request?.department?.name || '-'}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm font-medium text-gray-900">
                            GHS {Number(inv.grossAmount || 0).toFixed(2)}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-sm font-medium text-gray-900">
                            GHS {Number(inv.netAmount || 0).toFixed(2)}
                          </div>
                        </Td>
                        <Td>
                          <InvoiceStatusBadge status={inv.status} />
                        </Td>
                        <Td>
                          <div className="text-sm text-gray-900">
                            {inv.dueDate ? formatGhanaDate(inv.dueDate) : '-'}
                          </div>
                        </Td>
                        <Td>
                          <div className="flex space-x-2">
                            <Link
                              to={`/invoices/${inv.id}`}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              View
                            </Link>
                            {isFinanceOfficer && (
                              <Link
                                to={`/invoices/${inv.id}/edit`}
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
              {invoices?.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-file-invoice-dollar text-4xl text-gray-300 mb-4"></i>
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm">Create your first invoice to get started.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {invoices?.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="glass-card p-4 border border-primary-100"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {inv.request?.eventName || 'Invoice'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            #{inv.invoiceNo || inv.id.slice(0,8)}
                          </p>
                        </div>
                        <InvoiceStatusBadge status={inv.status} />
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Request</p>
                          <p className="text-gray-900">
                            {inv.request?.requestNo || inv.requestId?.slice(0,8) || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Due Date</p>
                          <p className="text-gray-900">
                            {inv.dueDate ? formatGhanaDate(inv.dueDate) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Gross Amount</p>
                          <p className="text-gray-900 font-medium">
                            GHS {Number(inv.grossAmount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Net Amount</p>
                          <p className="text-gray-900 font-medium">
                            GHS {Number(inv.netAmount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Department and Actions */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Department</p>
                            <p className="text-sm text-gray-900">
                              {inv.request?.department?.name || '-'}
                            </p>
                          </div>
                          <div className="flex space-x-3">
                            <Link
                              to={`/invoices/${inv.id}`}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              View
                            </Link>
                            {isFinanceOfficer && (
                              <Link
                                to={`/invoices/${inv.id}/edit`}
                                className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                              >
                                Edit
                              </Link>
                            )}
                          </div>
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
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Invoices"
        exportFunction={exportInvoicesExcel}
        filename="invoices_export"
      />
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

function InvoiceStatusBadge({ status }: { status: string }) {
  const getStatusClass = (status: string) => {
    const baseClass = "status-badge";
    switch (status.toLowerCase()) {
      case 'submitted': return `${baseClass} status-submitted`;
      case 'verified': return `${baseClass} status-approved`;
      case 'approved_for_payment': return `${baseClass} status-approved`;
      case 'paid': return `${baseClass} status-fulfilled`;
      case 'partially_paid': return `${baseClass} status-needs_revision`;
      default: return `${baseClass} status-draft`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'fas fa-clock';
      case 'verified': return 'fas fa-check-circle';
      case 'approved_for_payment': return 'fas fa-check-double';
      case 'paid': return 'fas fa-money-check-alt';
      case 'partially_paid': return 'fas fa-coins';
      default: return 'fas fa-file-invoice';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved_for_payment': return 'Approved for Payment';
      case 'partially_paid': return 'Partially Paid';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="status-wrapper">
      <span className={getStatusClass(status)}>
        <i className={`${getStatusIcon(status)} mr-1`}></i>
        {getStatusText(status)}
      </span>
    </div>
  );
}
