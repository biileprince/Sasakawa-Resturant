import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { updateRequest } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import type { ServiceRequest, UpdateServiceRequestInput } from '../../types/request';

export default function EditRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const { data, isLoading, error } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => (await axios.get(`${base}/requests/${id}`)).data as ServiceRequest,
    enabled: !!id,
  });

  const [formData, setFormData] = useState<UpdateServiceRequestInput>({
    eventName: '',
    eventDate: '',
    venue: '',
    estimateAmount: 0,
    attendees: 1,
    description: '',
    fundingSource: '',
    contactPhone: '',
  });

  useEffect(() => {
    if (data) {
      setFormData({
        eventName: data.eventName,
        eventDate: data.eventDate,
        venue: data.venue,
        estimateAmount: data.estimateAmount,
        attendees: data.attendees,
        description: data.description,
        fundingSource: data.fundingSource,
        contactPhone: data.contactPhone,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateServiceRequestInput) => updateRequest(id!, payload),
    onSuccess: () => {
      push('Request updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      navigate(`/requests/${id}`);
    },
    onError: () => push('Failed to update request', 'error')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };
  if (isLoading) return <div className="container mx-auto px-4 py-8"><div className="text-center">Loading...</div></div>;
  if (error) return <div className="container mx-auto px-4 py-8"><div className="text-center text-red-600">Failed to load request</div></div>;
  if (!data) return <div className="container mx-auto px-4 py-8"><div className="text-center">Request not found</div></div>;

  // Check if user can edit (only if status allows editing)
  const canEdit = ['SUBMITTED', 'NEEDS_REVISION', 'DRAFT'].includes(data.status);
  
  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <i className="fas fa-lock text-yellow-600 text-3xl mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Cannot Be Edited</h2>
            <p className="text-gray-600 mb-4">
              This request is currently <strong>{data.status.toLowerCase().replace('_', ' ')}</strong> and cannot be modified. 
              {data.status === 'APPROVED' && ' Once approved, requests can only be edited by administrators.'}
              {data.status === 'REJECTED' && ' Rejected requests cannot be edited. Please create a new request if needed.'}
              {data.status === 'FULFILLED' && ' Fulfilled requests are finalized and cannot be changed.'}
              {data.status === 'CLOSED' && ' Closed requests are archived and cannot be modified.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate(`/requests/${id}`)} className="btn btn-primary">
                <i className="fas fa-eye mr-2"></i>
                View Request Details
              </button>
              {['REJECTED'].includes(data.status) && (
                <button onClick={() => navigate('/requests/create')} className="btn btn-outline">
                  <i className="fas fa-plus mr-2"></i>
                  Create New Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
            <i className="fas fa-edit text-blue-600 text-xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Service Request</h1>
            <p className="text-gray-600">Update your service request details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Request #{data.requestNo || data.id.slice(0,8)}</span>
          <span>•</span>
          <span>{data.eventName}</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Event Information Section */}
          <div>
            <div className="form-title">
              <i className="fas fa-calendar-alt mr-3 text-blue-600"></i>
              Event Information
            </div>
            
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">
                  Event Name *
                </label>
                <input 
                  type="text"
                  value={formData.eventName || ''} 
                  onChange={e => setFormData({...formData, eventName: e.target.value})} 
                  required 
                  className="form-input" 
                  placeholder="Enter the name of your event"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Event Date *
                </label>
                <input 
                  type="date" 
                  value={formData.eventDate || ''} 
                  onChange={e => setFormData({...formData, eventDate: e.target.value})} 
                  required 
                  className="form-input" 
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Venue *
                </label>
                <input 
                  type="text"
                  value={formData.venue || ''} 
                  onChange={e => setFormData({...formData, venue: e.target.value})} 
                  required 
                  className="form-input" 
                  placeholder="Event location or venue name"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Number of Attendees *
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.attendees || 1} 
                  onChange={e => setFormData({...formData, attendees: Number(e.target.value)})} 
                  required 
                  className="form-input" 
                  placeholder="Expected number of attendees"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">
                Event Description
              </label>
              <textarea 
                value={formData.description || ''} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="form-textarea" 
                placeholder="Provide additional details about your event (optional)"
                rows={4}
              />
            </div>
          </div>

          {/* Financial Information Section */}
          <div>
            <div className="form-title">
              <i className="fas fa-dollar-sign mr-3 text-blue-600"></i>
              Financial Information
            </div>
            
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">
                  Estimate Amount (GHS) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₵</span>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.estimateAmount || 0} 
                    onChange={e => setFormData({...formData, estimateAmount: Number(e.target.value)})} 
                    required 
                    className="form-input pl-8" 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Funding Source *
                </label>
                <select 
                  value={formData.fundingSource || ''} 
                  onChange={e => setFormData({...formData, fundingSource: e.target.value})} 
                  required 
                  className="form-select"
                >
                  <option value="">Select funding source...</option>
                  <option value="departmental_budget">Departmental Budget</option>
                  <option value="project_funds">Project Funds</option>
                  <option value="external_grant">External Grant</option>
                  <option value="student_fees">Student Fees</option>
                  <option value="university_funds">University Funds</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">
                Contact Phone (Optional)
              </label>
              <input 
                type="tel"
                value={formData.contactPhone || ''} 
                onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                className="form-input" 
                placeholder="Phone number for this request"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <div className="form-title">
              <i className="fas fa-paperclip mr-3 text-blue-600"></i>
              Attachments (Optional)
            </div>
            
            <div className="file-upload">
              <input 
                type="file" 
                id="edit-attachments"
                multiple 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                className="hidden" 
                onChange={(e) => {
                  // Handle file upload here
                  const files = Array.from(e.target.files || []);
                  console.log('Selected files:', files);
                }}
              />
              <label htmlFor="edit-attachments" className="cursor-pointer block">
                <div className="text-center">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    Click to upload additional files
                  </div>
                  <div className="text-sm text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX, PNG, JPG up to 10MB each
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <i className="fas fa-plus mr-2"></i>
                      Add Files
                    </span>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              <i className="fas fa-info-circle mr-1 text-blue-500"></i>
              Upload any additional documents or replace existing ones.
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(`/requests/${id}`)} 
              className="btn btn-secondary"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending} 
              className="btn btn-primary"
            >
              {mutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Updating Request...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Update Request
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
