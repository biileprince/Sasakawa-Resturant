//client/src/services/request.service.ts

import api from './apiClient';
import type { 
  ServiceRequest, 
  CreateServiceRequestInput, 
  UpdateServiceRequestInput,
  Invoice, 
  Payment, 
  Department,
  RequestRecord,
  CreateRequestInput 
} from '../types/request';

const API_BASE_URL = ''; // api client already has base

// Service Request operations
export async function getRequests(): Promise<ServiceRequest[]> {
  const res = await api.get(`/requests`);
  return res.data;
}

export async function getRequestById(id: string): Promise<ServiceRequest> {
  const res = await api.get(`/requests/${id}`);
  return res.data;
}

export async function createRequest(data: CreateServiceRequestInput): Promise<ServiceRequest> {
  const res = await api.post(`/requests`, data);
  return res.data;
}

export async function updateRequest(id: string, data: UpdateServiceRequestInput): Promise<ServiceRequest> {
  const res = await api.put(`/requests/${id}`, data);
  return res.data;
}

// Request workflow operations
export async function approveRequest(id: string): Promise<ServiceRequest> {
  const res = await api.post(`/requests/${id}/approve`);
  return res.data;
}

export async function rejectRequest(id: string, rejectionReason?: string): Promise<ServiceRequest> {
  const res = await api.post(`/requests/${id}/reject`, { rejectionReason });
  return res.data;
}

export async function requestRevision(id: string): Promise<ServiceRequest> {
  const res = await api.post(`/requests/${id}/revision`);
  return res.data;
}

export async function fulfillRequest(id: string): Promise<ServiceRequest> {
  const res = await api.post(`/requests/${id}/fulfill`);
  return res.data;
}

export async function deleteRequest(id: string): Promise<{ message: string }> {
  const res = await api.delete(`/requests/${id}`);
  return res.data;
}

// Department operations
export async function getDepartments(): Promise<Department[]> {
  const res = await api.get(`/departments`);
  return res.data;
}

// Invoice operations
export async function getInvoices(): Promise<Invoice[]> {
  const res = await api.get(`/invoices`);
  return res.data;
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
}

export async function createInvoice(data: {
  requestId: string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
}): Promise<Invoice> {
  const res = await api.post(`/invoices`, data);
  return res.data;
}

export async function updateInvoice(id: string, data: {
  invoiceDate?: string;
  dueDate?: string;
  grossAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  status?: string;
}): Promise<Invoice> {
  const res = await api.put(`/invoices/${id}`, data);
  return res.data;
}

export async function approveInvoiceForPayment(id: string): Promise<Invoice> {
  const res = await api.post(`/invoices/${id}/approve-for-payment`);
  return res.data;
}

// Payment operations
export async function getPayments(): Promise<Payment[]> {
  const res = await api.get(`/payments`);
  return res.data;
}

export async function getPaymentById(id: string): Promise<Payment> {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function createPayment(data: {
  invoiceId: string;
  method: 'CHEQUE' | 'TRANSFER' | 'MOBILE_MONEY' | 'CASH';
  reference?: string;
  paymentDate: string;
  amount: number;
}): Promise<Payment> {
  const res = await api.post(`/payments`, data);
  return res.data;
}

export async function updatePayment(id: string, data: {
  method?: 'CHEQUE' | 'TRANSFER' | 'MOBILE_MONEY' | 'CASH';
  reference?: string;
  paymentDate?: string;
  amount?: number;
  status?: string;
}): Promise<Payment> {
  const res = await api.put(`/payments/${id}`, data);
  return res.data;
}

export async function deletePayment(id: string): Promise<{ message: string }> {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
}

// File operations
export async function uploadRequestAttachment(requestId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/requests/${requestId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadInvoiceAttachment(invoiceId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/invoices/${invoiceId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadPaymentAttachment(paymentId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/payments/${paymentId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// Export functions
export async function exportInvoicesExcel(params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.status) queryParams.append('status', params.status);

  const res = await api.get(`/invoices/export/excel?${queryParams.toString()}`, {
    responseType: 'blob',
  });
  return res.data;
}

export async function exportPaymentsExcel(params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.status) queryParams.append('status', params.status);

  const res = await api.get(`/payments/export/excel?${queryParams.toString()}`, {
    responseType: 'blob',
  });
  return res.data;
}

// Legacy exports for backward compatibility
export { getRequests as getRequestRecords };
export type { RequestRecord, CreateRequestInput };
