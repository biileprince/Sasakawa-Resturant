import React, { useState } from 'react';
import type { ServiceRequest } from '../types/request';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  action: 'approve' | 'reject' | 'revision';
  onSubmit: (action: 'approve' | 'reject' | 'revision', reason?: string) => void;
  isSubmitting?: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ 
  isOpen, 
  onClose, 
  request, 
  action, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(action, reason || undefined);
    setReason('');
    onClose();
  };

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approve Request',
          buttonText: 'Approve Request',
          buttonColor: 'bg-green-600 hover:bg-green-700',
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
              <p className="text-xs font-medium text-gray-500 mb-1">Event Name</p>
              <p className="font-medium text-gray-900">{request.eventName}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Service Type</p>
              <p className="font-medium text-gray-900">{request.serviceType}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Event Date</p>
              <p className="font-medium text-gray-900">{new Date(request.eventDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Venue</p>
              <p className="font-medium text-gray-900">{request.venue}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Attendees</p>
              <p className="font-medium text-gray-900">{request.attendees} people</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Budget</p>
              <p className="font-medium text-gray-900">₵{request.estimateAmount ? Number(request.estimateAmount).toLocaleString() : 'Not specified'}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
              <p className="font-medium text-gray-900">{request.department?.name}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Submitted by</p>
              <p className="font-medium text-gray-900">{request.requester?.name}</p>
            </div>
          </div>
          {request.description && (
            <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Request Description</p>
              <p className="text-gray-800 text-sm leading-relaxed">{request.description}</p>
            </div>
          )}
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (action !== 'approve' && !reason.trim())}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${config.buttonColor}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                config.buttonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;
