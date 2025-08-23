import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { getRequests } from '../../services/request.service';
import { Link } from 'react-router-dom';
import { navigate } from '../../utils/navigate';

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
    <div className="mx-auto p-6">
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
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (GHS)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((r: any) => (
                    <tr 
                      key={r.id} 
                      onClick={() => navigate(`/requests/${r.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{r.eventName}</div>
                          {r.requestNo && <div className="text-xs text-gray-500">#{r.requestNo}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(r.eventDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.venue || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.attendees || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        GHS {r.estimateAmount ? Number(r.estimateAmount).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.department?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {requests.map((r: any) => (
              <div
                key={r.id}
                onClick={() => navigate(`/requests/${r.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{r.eventName}</h3>
                    {r.requestNo && <p className="text-xs text-gray-500">#{r.requestNo}</p>}
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
                    <p className="text-gray-900">{new Date(r.eventDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Attendees</p>
                    <p className="text-gray-900">{r.attendees || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Venue</p>
                    <p className="text-gray-900">{r.venue || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Amount</p>
                    <p className="text-gray-900 font-medium">GHS {r.estimateAmount ? Number(r.estimateAmount).toFixed(2) : '0.00'}</p>
                  </div>
                </div>

                {/* Department */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Department</p>
                      <p className="text-sm text-gray-900">{r.department?.name || '-'}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      View Details
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
