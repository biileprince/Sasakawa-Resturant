import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { getRequests } from '../../services/request.service';
import { Link } from 'react-router-dom';

export default function RequestsPage() {
  const { isSignedIn } = useUser();
  const { push } = useToast();
  const { data, isLoading, error } = useQuery({
    queryKey: ['requests'],
    queryFn: getRequests,
    enabled: isSignedIn, // Only fetch when user is signed in
  });

  useEffect(() => {
    if (error) push('Failed to load requests', 'error');
  }, [error, push]);

  // Show sign-in prompt for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lock text-blue-600 text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
            <p className="text-gray-500 mb-6">Please sign in to view and manage your service requests.</p>
            <Link to="/sign-in" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2">
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <RequestsSkeleton />;

  const requests = data || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Service Requests</h1>
        <Link to="/requests/new" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2">
          <i className="fas fa-plus-circle"></i>
          Request Service
        </Link>
      </div>
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-alt text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests yet</h3>
            <p className="text-gray-500 mb-6">You haven't made any service requests. Start by requesting a service for your event.</p>
            <Link to="/requests/new" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2">
              <i className="fas fa-plus-circle"></i>
              Request Your First Service
            </Link>
          </div>
        </div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Event Name</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Venue</th>
              <th className="p-2 text-left">Attendees</th>
              <th className="p-2 text-left">Amount (GHS)</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r: any) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-2">
                  <Link to={`/requests/${r.id}`} className="link link-internal font-medium">
                    {r.eventName}
                  </Link>
                  {r.requestNo && <div className="text-xs text-gray-500">#{r.requestNo}</div>}
                </td>
                <td className="p-2">{new Date(r.eventDate).toLocaleDateString()}</td>
                <td className="p-2">{r.venue || '-'}</td>
                <td className="p-2">{r.attendees || '-'}</td>
                <td className="p-2">GHS {r.estimateAmount ? Number(r.estimateAmount).toFixed(2) : '0.00'}</td>
                <td className="p-2">{r.department?.name || '-'}</td>
                <td className="p-2"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RequestsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4 animate-pulse">
      <div className="h-7 w-40 bg-gray-200 rounded" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded" />
        ))}
      </div>
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
