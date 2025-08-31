import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import apiClient from '../../services/apiClient';
import { approveRequest, rejectRequest, requestRevision, fulfillRequest, uploadRequestAttachment } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import AttachmentViewer from '../../components/AttachmentViewer';
import ApprovalModal from '../../components/ApprovalModal';

export default function RequestDetailPage() {
  const { id } = useParams();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const { push } = useToast();

  // Primary data fetch
  const { data, isLoading, error } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => {
      const res = await apiClient.get(`/requests/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // IMPORTANT: All hooks must run on every render (avoid conditional early return before these)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | 'revision';
  }>({
    isOpen: false,
    action: 'approve'
  });
  
  const mkMut = (fn: (id: string)=>Promise<any>) => useMutation({
    mutationFn: () => fn(id!),
    onSuccess: () => { push('Status updated'); qc.invalidateQueries({ queryKey: ['request', id] }); qc.invalidateQueries({ queryKey: ['requests'] }); },
    onError: () => push('Action failed'),
  });
  
  // Updated mutation functions that accept parameters
  const approveMut = useMutation({
    mutationFn: async (comments: string) => {
      const response = await apiClient.post(`/requests/${id}/approve`, { comments });
      return response.data;
    },
    onSuccess: () => { 
      push('Request approved successfully', 'success'); 
      setModalState({ isOpen: false, action: 'approve' });
      qc.invalidateQueries({ queryKey: ['request', id] }); 
      qc.invalidateQueries({ queryKey: ['requests'] }); 
    },
    onError: () => push('Failed to approve request', 'error'),
  });
  
  const rejectMut = useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiClient.post(`/requests/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => { 
      push('Request rejected', 'success'); 
      setModalState({ isOpen: false, action: 'reject' });
      qc.invalidateQueries({ queryKey: ['request', id] }); 
      qc.invalidateQueries({ queryKey: ['requests'] }); 
    },
    onError: () => push('Failed to reject request', 'error'),
  });
  
  const revisionMut = useMutation({
    mutationFn: async (comments: string) => {
      const response = await apiClient.post(`/requests/${id}/revision`, { comments });
      return response.data;
    },
    onSuccess: () => { 
      push('Revision requested', 'success'); 
      setModalState({ isOpen: false, action: 'revision' });
      qc.invalidateQueries({ queryKey: ['request', id] }); 
      qc.invalidateQueries({ queryKey: ['requests'] }); 
    },
    onError: () => push('Failed to request revision', 'error'),
  });
  
  const fulfillMut = mkMut(fulfillRequest);
  const uploadMut = useMutation({
    mutationFn: async (file: File) => uploadRequestAttachment(id!, file),
    onSuccess: () => { push('File uploaded'); qc.invalidateQueries({ queryKey: ['request', id] }); },
    onError: () => push('Upload failed'),
  });

  if (isLoading) return <RequestSkeleton />;
  if (error) return <div className="p-6 text-red-600">Failed to load.</div>;
  if (!data) return <div className="p-6">Not found.</div>;

  const canEdit = user && data.requester?.id === user.id && ['SUBMITTED','NEEDS_REVISION','DRAFT'].includes(data.status);
  const canApprove = user?.capabilities?.canApproveRequest && ['SUBMITTED','NEEDS_REVISION'].includes(data.status);
  const canFulfill = user?.capabilities?.canCreatePayment && data.status === 'APPROVED';

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="link link-internal hover:text-green-600 transition-colors">
          <i className="fas fa-home mr-1"></i>Home
        </Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link to="/requests" className="link link-internal hover:text-green-600 transition-colors">Requests</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span className="text-gray-700">#{data.requestNo || data.id.slice(0,8)}</span>
      </nav>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg">
                <i className="fas fa-utensils text-green-600 text-lg sm:text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{data.eventName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={data.status} />
                  <span className="text-sm text-gray-500">Request #{data.requestNo || data.id.slice(0,8)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-3">
              <div className="flex items-center gap-1">
                <i className="fas fa-user text-gray-400"></i>
                <span>{data.requester?.name || 'Unknown'}</span>
              </div>
              {data.department?.name && (
                <div className="flex items-center gap-1">
                  <i className="fas fa-building text-gray-400"></i>
                  <span>{data.department.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <i className="fas fa-calendar text-gray-400"></i>
                <span>Created {new Date(data.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {canEdit && (
              <Link to={`/requests/${id}/edit`} className="btn-action btn-action-edit flex-1 sm:flex-none whitespace-nowrap">
                <i className="fas fa-edit"></i>
                <span className="hidden sm:inline">Edit Request</span>
                <span className="sm:hidden">Edit</span>
              </Link>
            )}
            {canApprove && (
              <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:flex-none w-full sm:w-auto">
                {!modalState.isOpen && (
                  <>
                    <button 
                      onClick={() => setModalState({ isOpen: true, action: 'approve' })}
                      className="btn-action btn-action-approve flex-1 sm:flex-none whitespace-nowrap"
                    >
                      <i className="fas fa-check"></i>
                      <span className="hidden sm:inline">Approve</span>
                      <span className="sm:hidden">✓</span>
                    </button>
                    <button 
                      onClick={() => setModalState({ isOpen: true, action: 'reject' })}
                      className="btn-action btn-action-reject flex-1 sm:flex-none whitespace-nowrap"
                    >
                      <i className="fas fa-times"></i>
                      <span className="hidden sm:inline">Reject</span>
                      <span className="sm:hidden">✕</span>
                    </button>
                    {data.status === 'SUBMITTED' && (
                      <button 
                        onClick={() => setModalState({ isOpen: true, action: 'revision' })}
                        className="btn-action btn-action-revision flex-1 sm:flex-none whitespace-nowrap text-sm"
                      >
                        <i className="fas fa-edit"></i>
                        <span className="hidden sm:inline">Request Revision</span>
                        <span className="sm:hidden">Revision</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
            {canFulfill && (
              <button 
                disabled={fulfillMut.isPending} 
                onClick={() => fulfillMut.mutate()} 
                className="btn-action btn-action-fulfill"
              >
                {fulfillMut.isPending ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check-circle"></i>
                )}
                {fulfillMut.isPending ? 'Processing...' : 'Mark as Fulfilled'}
              </button>
            )}
          </div>
        </div>
      </div>

      <ApprovalModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: 'approve' })}
        request={data}
        action={modalState.action}
        onSubmit={(action, text) => {
          const comment = text || '';
          switch (action) {
            case 'approve':
              approveMut.mutate(comment);
              break;
            case 'reject':
              rejectMut.mutate(comment);
              break;
            case 'revision':
              revisionMut.mutate(comment);
              break;
          }
        }}
        isSubmitting={approveMut.isPending || rejectMut.isPending || revisionMut.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <i className="fas fa-calendar-alt text-green-600 text-xl"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Event Information</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DetailItem 
                icon="fas fa-concierge-bell" 
                label="Service Type" 
                value={data.serviceType || 'Not specified'} 
              />
              <DetailItem 
                icon="fas fa-calendar" 
                label="Event Date" 
                value={new Date(data.eventDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} 
              />
              <DetailItem 
                icon="fas fa-map-marker-alt" 
                label="Venue" 
                value={data.venue} 
              />
              <DetailItem 
                icon="fas fa-users" 
                label="Number of Attendees" 
                value={`${data.attendees} people`} 
              />
              <DetailItem 
                icon="fas fa-dollar-sign" 
                label="Estimate Amount" 
                value={`₵${data.estimateAmount ? Number(data.estimateAmount).toFixed(2) : '0.00'}`} 
                highlight={true}
              />
              <DetailItem 
                icon="fas fa-wallet" 
                label="Funding Source" 
                value={data.fundingSource || 'Not specified'} 
              />
              {data.contactPhone && (
                <DetailItem 
                  icon="fas fa-phone" 
                  label="Contact Phone" 
                  value={data.contactPhone} 
                />
              )}
            </div>

            {data.description && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-file-text text-gray-400"></i>
                  <span className="font-medium text-gray-700">Description</span>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{data.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Invoices Section */}
          {data.invoices?.length > 0 && (
            <div className="dashboard-card">
              <div className="flex items-center gap-3 mb-6">
                <i className="fas fa-file-invoice-dollar text-green-600 text-xl"></i>
                <h2 className="text-xl font-semibold text-gray-900">Related Invoices</h2>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.map((inv: any) => (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <Link to={`/invoices/${inv.id}`} className="link link-internal font-medium">
                            #{inv.invoiceNo || inv.id.slice(0,8)}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          ₵{inv.netAmount ? Number(inv.netAmount).toFixed(2) : '0.00'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {data.invoices.map((inv: any) => (
                  <div key={inv.id} className="glass-card p-4 border border-primary-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link to={`/invoices/${inv.id}`} className="link link-internal font-medium text-sm">
                          #{inv.invoiceNo || inv.id.slice(0,8)}
                        </Link>
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
                        <p className="text-gray-900 font-medium">₵{inv.netAmount ? Number(inv.netAmount).toFixed(2) : '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Due Date</p>
                        <p className="text-gray-900">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Hide "View all invoices" button for approvers */}
              {user?.role !== 'APPROVER' && (
                <div className="mt-4 text-right">
                  <Link to="/invoices" className="link link-internal font-medium text-sm">
                    View all invoices
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="dashboard-card">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Information</h3>
            <div className="space-y-4">
              <SidebarItem icon="fas fa-flag" label="Status" value={<StatusBadge status={data.status} />} />
              <SidebarItem icon="fas fa-building" label="Department" value={data.department?.name || 'Not assigned'} />
              <SidebarItem icon="fas fa-calendar-plus" label="Submitted" value={new Date(data.createdAt).toLocaleDateString()} />
              {data.approvalDate && (
                <SidebarItem 
                  icon="fas fa-check-circle" 
                  label="Approved" 
                  value={new Date(data.approvalDate).toLocaleDateString()} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Documents - Full Width Section */}
      <div className="mt-8">
        <AttachmentViewer
          attachments={data.attachments || []}
          entityId={data.id}
          entityType="request"
          canUpload={canEdit ?? false}
          uploadFunction={uploadRequestAttachment}
          queryKey={id ? ['request', id] : ['request']}
        />
      </div>
    </div>
  );
}

// Helper Components
function DetailItem({ icon, label, value, highlight = false }: { 
  icon: string; 
  label: string; 
  value: string; 
  highlight?: boolean; 
}) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`${icon} ${highlight ? 'text-green-600' : 'text-gray-400'} text-sm`}></i>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className={`font-semibold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
        <i className={`${icon} text-gray-600 text-sm`}></i>
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="font-medium">{String(value)}</div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-6">
      <div className="h-4 w-40 bg-gray-200 rounded" />
      <div className="h-8 w-2/3 bg-gray-200 rounded" />
      <div className="grid md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
      </div>
      <div className="h-48 bg-gray-200 rounded" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusClass = (status: string) => {
    const baseClass = "status-badge";
    switch (status.toLowerCase()) {
      case 'submitted': return `${baseClass} status-submitted`;
      case 'approved': return `${baseClass} status-approved`;
      case 'rejected': return `${baseClass} status-rejected`;
      case 'needs_revision': return `${baseClass} status-needs_revision`;
      case 'fulfilled': return `${baseClass} status-fulfilled`;
      case 'draft': return `${baseClass} status-draft`;
      case 'closed': return `${baseClass} status-closed`;
      default: return `${baseClass} status-draft`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'fas fa-clock';
      case 'approved': return 'fas fa-check-circle';
      case 'rejected': return 'fas fa-times-circle';
      case 'needs_revision': return 'fas fa-edit';
      case 'fulfilled': return 'fas fa-check-double';
      case 'draft': return 'fas fa-file-alt';
      case 'closed': return 'fas fa-archive';
      default: return 'fas fa-question-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'needs_revision': return 'Needs Revision';
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

function RequestSkeleton() { return <SkeletonDetail />; }
