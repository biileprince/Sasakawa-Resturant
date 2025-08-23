import apiClient from './apiClient';
import type { ServiceRequest } from '../types/request';

export interface ApprovalAction {
  rejectionReason?: string;
  revisionNotes?: string;
}

// Get pending approvals for current user
export const getPendingApprovals = async (): Promise<ServiceRequest[]> => {
  const response = await apiClient.get('/approvals');
  return response.data;
};

// Approve a request
export const approveRequest = async (requestId: string, reason?: string): Promise<ServiceRequest> => {
  const response = await apiClient.post(`/requests/${requestId}/approve`, {
    reason
  });
  return response.data;
};

// Reject a request
export const rejectRequest = async (requestId: string, rejectionReason: string): Promise<ServiceRequest> => {
  const response = await apiClient.post(`/requests/${requestId}/reject`, {
    rejectionReason
  });
  return response.data;
};

// Request revision
export const requestRevision = async (requestId: string, revisionNotes?: string): Promise<ServiceRequest> => {
  const response = await apiClient.post(`/requests/${requestId}/revision`, {
    revisionNotes
  });
  return response.data;
};

// Fulfill a request (for finance officers)
export const fulfillRequest = async (requestId: string): Promise<ServiceRequest> => {
  const response = await apiClient.post(`/requests/${requestId}/fulfill`);
  return response.data;
};

// Export as default object for easier import
const approvalService = {
  getPendingApprovals,
  approveRequest,
  rejectRequest,
  requestRevision,
  fulfillRequest
};

export default approvalService;
