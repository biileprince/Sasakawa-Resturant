import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import approvalService from '../../services/approval.service';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useToast } from '../../contexts/ToastContext';
import { navigate } from '../../utils/navigate';
import type { ServiceRequest } from '../../types/request';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  action: 'approve' | 'reject' | 'revision';
  onSubmit: (reason?: string) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ isOpen, onClose, request, action, onSubmit }) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason || undefined);
    setReason('');
    onClose();
  };

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approve Request',
          buttonText: 'Approve Request',
          buttonColor: 'btn-green',
          icon: (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'reject':
        return {
          title: 'Reject Request',
          buttonText: 'Reject Request',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'revision':
        return {
          title: 'Request Revision',
          buttonText: 'Request Revision',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
          icon: (
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )
        };
      default:
        return {
          title: 'Action',
          buttonText: 'Submit',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          icon: null
        };
    }
  };

  const config = getActionConfig();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                {config.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                <p className="text-sm text-gray-600">Service Request Review</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Request Details */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Request Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Service Type</p>
              <p className="font-medium text-gray-900">{request.serviceType}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
              <p className="font-medium text-gray-900">{request.department?.name}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Submitted by</p>
              <p className="font-medium text-gray-900">{request.requester?.name}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Budget</p>
              <p className="font-medium text-gray-900">${request.estimateAmount?.toLocaleString() || 'Not specified'}</p>
            </div>
          </div>
          <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Request Description</p>
            <p className="text-gray-800 text-sm leading-relaxed">{request.description}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-900 mb-2">
              {action === 'approve' ? 'Approval Comments (Optional)' : 'Reason for Action (Required)'}
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder={action === 'approve' 
                ? 'Add any approval comments or notes...' 
                : 'Please provide a detailed reason for this action...'
              }
              required={action !== 'approve'}
            />
            <p className="mt-1 text-xs text-gray-500">
              {action === 'approve' ? 'Optional comments help track approval decisions' : 'Required to help the requester understand the decision'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${config.buttonColor}`}
            >
              {config.buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ApprovalsPage() {
  const currentUser = useCurrentUser();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    request: ServiceRequest | null;
    action: 'approve' | 'reject' | 'revision';
  }>({
    isOpen: false,
    request: null,
    action: 'approve'
  });

  const { data: pendingRequests, isLoading, error } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: approvalService.getPendingApprovals,
    enabled: currentUser?.role === 'APPROVER' || currentUser?.role === 'FINANCE_OFFICER'
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      approvalService.approveRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      push('Request approved successfully', 'success');
    },
    onError: () => {
      push('Failed to approve request', 'error');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      approvalService.rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      push('Request rejected', 'success');
    },
    onError: () => {
      push('Failed to reject request', 'error');
    }
  });

  const revisionMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      approvalService.requestRevision(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      push('Revision requested', 'success');
    },
    onError: () => {
      push('Failed to request revision', 'error');
    }
  });

  const handleModalSubmit = (reason?: string) => {
    if (!modalState.request) return;

    const { request, action } = modalState;

    switch (action) {
      case 'approve':
        approveMutation.mutate({ id: request.id, reason });
        break;
      case 'reject':
        if (!reason) return;
        rejectMutation.mutate({ id: request.id, reason });
        break;
      case 'revision':
        if (!reason) return;
        revisionMutation.mutate({ id: request.id, reason });
        break;
    }
  };

  const openModal = (request: ServiceRequest, action: 'approve' | 'reject' | 'revision') => {
    setModalState({ isOpen: true, request, action });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, request: null, action: 'approve' });
  };

  // Access control
  if (currentUser?.role !== 'APPROVER' && currentUser?.role !== 'FINANCE_OFFICER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-4">This area is reserved for Approvers and Finance Officers only.</p>
          <p className="text-sm text-gray-500">Contact your administrator if you need access to approval functions.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching pending requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h1>
          <p className="text-red-600 mb-4">Failed to load pending approvals.</p>
          <p className="text-sm text-gray-500 mb-6">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const submittedRequests = pendingRequests?.filter(r => r.status === 'SUBMITTED') || [];
  const revisionRequests = pendingRequests?.filter(r => r.status === 'NEEDS_REVISION') || [];
  const totalPending = pendingRequests?.length || 0;

  // Get role-specific title and description
  const getRoleInfo = () => {
    if (currentUser?.role === 'FINANCE_OFFICER') {
      return {
        title: 'Finance Officer Dashboard',
        description: 'Review service requests, manage approvals, and oversee financial operations.'
      };
    }
    return {
      title: 'Approval Dashboard',
      description: 'Review and approve service requests submitted by restaurant staff.'
    };
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentUser?.role?.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {roleInfo.title}
              </h1>
              <p className="text-gray-600 max-w-3xl">{roleInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">New Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{submittedRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Needs Revision</p>
                <p className="text-2xl font-semibold text-gray-900">{revisionRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {totalPending === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 mb-2">No pending approvals at the moment.</p>
            <p className="text-sm text-gray-500">All requests have been processed or there are no submitted requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests?.map((request) => (
              <div 
                key={request.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Request Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.serviceType}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'SUBMITTED' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {request.status === 'SUBMITTED' ? 'New Request' : 'Needs Revision'}
                          </span>
                        </div>
                        <button 
                          onClick={() => navigate(`/requests/${request.id}`)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </div>

                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{request.department?.name}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Requester</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{request.requester?.name}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Event Date</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(request.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Budget</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ${request.estimateAmount?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-gray-800 text-sm leading-relaxed line-clamp-2">
                            {request.description}
                          </p>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Contact Phone</p>
                          <p className="text-sm text-gray-900">{request.contactPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Attendees</p>
                          <p className="text-sm text-gray-900">{request.attendees}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Submitted</p>
                          <p className="text-sm text-gray-900">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => openModal(request, 'approve')}
                      disabled={approveMutation.isPending}
                      className="btn-green flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approveMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => openModal(request, 'revision')}
                      disabled={revisionMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {revisionMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Request Revision
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => openModal(request, 'reject')}
                      disabled={rejectMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {rejectMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ApprovalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        request={modalState.request}
        action={modalState.action}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
