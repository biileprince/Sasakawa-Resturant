import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { approveRequest, rejectRequest, requestRevision, fulfillRequest, uploadRequestAttachment } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';

export default function RequestDetailPage() {
  const { id } = useParams();
  const user = useCurrentUser();
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const qc = useQueryClient();
  const { push } = useToast();

  // Primary data fetch
  const { data, isLoading, error } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => {
      const res = await axios.get(`${base}/requests/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // IMPORTANT: All hooks must run on every render (avoid conditional early return before these)
  const mkMut = (fn: (id: string)=>Promise<any>) => useMutation({
    mutationFn: () => fn(id!),
    onSuccess: () => { push('Status updated'); qc.invalidateQueries({ queryKey: ['request', id] }); qc.invalidateQueries({ queryKey: ['requests'] }); },
    onError: () => push('Action failed'),
  });
  const approveMut = mkMut(approveRequest);
  const rejectMut = mkMut(rejectRequest);
  const revisionMut = mkMut(requestRevision);
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
    <div className="container mx-auto px-4 py-8">
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
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <i className="fas fa-utensils text-green-600 text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{data.eventName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={data.status} />
                  <span className="text-sm text-gray-500">Request #{data.requestNo || data.id.slice(0,8)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
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
          <div className="flex gap-2">
            {canEdit && (
              <Link to={`/requests/${id}/edit`} className="btn btn-outline link-edit">
                <i className="fas fa-edit mr-2"></i>
                Edit Request
              </Link>
            )}
            {canApprove && (
              <div className="flex gap-2">
                <ActionBtn 
                  label="Approve" 
                  onClick={()=>approveMut.mutate()} 
                  loading={approveMut.isPending} 
                  color="green" 
                  icon="fas fa-check"
                />
                <ActionBtn 
                  label="Reject" 
                  onClick={()=>rejectMut.mutate()} 
                  loading={rejectMut.isPending} 
                  color="red" 
                  icon="fas fa-times"
                />
                {data.status === 'SUBMITTED' && (
                  <ActionBtn 
                    label="Request Revision" 
                    onClick={()=>revisionMut.mutate()} 
                    loading={revisionMut.isPending} 
                    color="amber" 
                    icon="fas fa-edit"
                  />
                )}
              </div>
            )}
            {canFulfill && (
              <ActionBtn 
                label="Mark as Fulfilled" 
                onClick={()=>fulfillMut.mutate()} 
                loading={fulfillMut.isPending} 
                color="purple" 
                icon="fas fa-check-circle"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <i className="fas fa-calendar-alt text-green-600 text-xl"></i>
              <h2 className="text-xl font-semibold text-gray-900">Event Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <div className="overflow-x-auto">
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
              
              <div className="mt-4 text-right">
                <Link to="/invoices" className="link link-internal font-medium text-sm">
                  View all invoices
                </Link>
              </div>
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

          {/* Attachments */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Attachments</h3>
              {canEdit && (
                <label className="btn btn-sm btn-outline cursor-pointer">
                  <i className="fas fa-plus mr-1"></i>
                  Add
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={e => { 
                      const f = e.target.files?.[0]; 
                      if (f) uploadMut.mutate(f); 
                    }} 
                  />
                </label>
              )}
            </div>
            
            {uploadMut.isPending && (
              <div className="text-sm text-gray-500 mb-2">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Uploading...
              </div>
            )}
            
            {data.attachments?.length > 0 ? (
              <div className="space-y-2">
                {data.attachments.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <i className="fas fa-file text-gray-400"></i>
                    <a 
                      href={a.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link link-external text-sm font-medium flex-1 truncate"
                    >
                      {a.fileName}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-file text-2xl mb-2"></i>
                <p className="text-sm">No attachments</p>
              </div>
            )}
          </div>
        </div>
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

function ActionBtn({ label, onClick, loading, color, icon }: { 
  label: string; 
  onClick: ()=>void; 
  loading: boolean; 
  color: string;
  icon?: string;
}) {
  const colorMap: any = {
    green: 'btn-primary bg-green-600 hover:bg-green-700',
    red: 'btn-danger',
    amber: 'btn-secondary bg-amber-500 hover:bg-amber-600 text-white border-amber-500',
    purple: 'btn-secondary bg-purple-600 hover:bg-purple-700 text-white border-purple-600',
    blue: 'btn-primary'
  };
  
  return (
    <button 
      disabled={loading} 
      onClick={onClick} 
      className={`btn ${colorMap[color] || 'btn-secondary'}`}
    >
      {loading ? (
        <i className="fas fa-spinner fa-spin mr-2"></i>
      ) : (
        icon && <i className={`${icon} mr-2`}></i>
      )}
      {loading ? 'Processing...' : label}
    </button>
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
    <span className={getStatusClass(status)}>
      <i className={`${getStatusIcon(status)} mr-1`}></i>
      {getStatusText(status)}
    </span>
  );
}

function RequestSkeleton() { return <SkeletonDetail />; }
