//client/src/pages/protected/CreateRequestPage.tsx

import { useState, useEffect } from 'react';
import { createRequest, getDepartments } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useNavigate } from 'react-router-dom';
import { useAuthRequired } from '../../hooks/useAuthRequired';
import type { CreateServiceRequestInput } from '../../types/request';

export default function CreateRequestPage() {
  useAuthRequired(); // Redirect to sign-in if not authenticated
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { push } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateServiceRequestInput>({
    eventName: '',
    eventDate: '',
    venue: '',
    estimateAmount: 0,
    attendees: 1,
    serviceType: '',
    fundingSource: '',
    contactPhone: '',
    description: '',
    departmentId: '',
    departmentName: '',
    phone: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const usingNewDept = !formData.departmentId && (formData.departmentName?.length || 0) > 0;

  useEffect(() => {
    (async () => {
      try {
        const list = await getDepartments();
        setDepartments(list);
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!formData.departmentId && !formData.departmentName) throw new Error('Department required');
      if (!formData.serviceType) throw new Error('Service type required');
      if (!currentUser?.phone && !formData.phone) throw new Error('Personal phone number required');
      const created = await createRequest({
        ...formData,
        contactPhone: formData.contactPhone || undefined,
        departmentId: formData.departmentId || undefined,
        departmentName: usingNewDept ? formData.departmentName : undefined,
        phone: (!currentUser?.phone && formData.phone) ? formData.phone : undefined,
      });
  push('Request created', 'success');
  navigate(`/requests/${created.id}`);
    } catch (err: any) {
  const msg = err?.response?.data?.message || 'Failed to create request';
  setError(msg);
  push(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
            <i className="fas fa-plus text-green-600 text-xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Service Request</h1>
            <p className="text-gray-600">Submit a new service request for catering services</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Event Information Section */}
          <div>
            <div className="form-title">
              <i className="fas fa-calendar-alt mr-3 text-green-600"></i>
              Event Information
            </div>
            
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">
                  Event Name *
                </label>
                <input 
                  type="text"
                  value={formData.eventName} 
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
                  value={formData.eventDate} 
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
                  value={formData.venue} 
                  onChange={e => setFormData({...formData, venue: e.target.value})} 
                  required 
                  className="form-input" 
                  placeholder="Event location or venue name"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Service Type *
                </label>
                <select 
                  value={formData.serviceType} 
                  onChange={e => setFormData({...formData, serviceType: e.target.value})} 
                  required 
                  className="form-select"
                >
                  <option value="">Select service type...</option>
                  <option value="Breakfast Service">Breakfast Service</option>
                  <option value="Lunch Service">Lunch Service</option>
                  <option value="Dinner Service">Dinner Service</option>
                  <option value="Special Events">Special Events</option>
                  <option value="Corporate Meetings">Corporate Meetings</option>
                  <option value="Academic Events">Academic Events</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Number of Attendees *
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.attendees} 
                  onChange={e => setFormData({...formData, attendees: Number(e.target.value)})} 
                  required 
                  className="form-input" 
                  placeholder="Expected number of attendees"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Contact Phone
                </label>
                <input 
                  type="tel" 
                  value={formData.contactPhone || ''} 
                  onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                  className="form-input" 
                  placeholder="Contact phone number for this event"
                  pattern="[+]?[0-9\s\-\(\)]+"
                />
                <p className="text-sm text-gray-500 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Optional phone number specific to this event for coordination
                </p>
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
              <i className="fas fa-dollar-sign mr-3 text-green-600"></i>
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
                    value={formData.estimateAmount} 
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
                  value={formData.fundingSource} 
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
          </div>

          {/* Department Information Section */}
          <div>
            <div className="form-title">
              <i className="fas fa-building mr-3 text-green-600"></i>
              Department Information
            </div>
            
            <div className="space-y-4">
              <div className="form-field">
                <label className="form-label">
                  Select Department *
                </label>
                <select 
                  value={formData.departmentId} 
                  onChange={e => {
                    setFormData({...formData, departmentId: e.target.value, departmentName: ''}); 
                  }} 
                  className="form-select" 
                  disabled={(formData.departmentName?.length || 0) > 0}
                >
                  <option value="">Select existing department...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500 bg-white">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              
              <div className="form-field">
                <label className="form-label">
                  Create New Department
                </label>
                <input
                  type="text"
                  placeholder="Enter new department name"
                  value={formData.departmentName}
                  onChange={e => {
                    setFormData({...formData, departmentName: e.target.value, departmentId: ''});
                  }}
                  className="form-input"
                  disabled={!!formData.departmentId}
                />
                <p className="text-sm text-gray-500 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Select an existing department or create a new one
                </p>
              </div>
            </div>
          </div>

          {/* Personal Contact Information Section - Only show if user has no phone */}
          {!currentUser?.phone && (
            <div>
              <div className="form-title">
                <i className="fas fa-user mr-3 text-green-600"></i>
                Personal Contact Information
              </div>
              
              <div className="form-field">
                <label className="form-label">
                  Your Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={e => {
                    setFormData({...formData, phone: e.target.value});
                  }}
                  className="form-input"
                  required={!currentUser?.phone}
                  pattern="[+]?[0-9\s\-\(\)]+"
                />
                <p className="text-sm text-gray-500 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  This will be saved to your profile for future requests
                </p>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div>
            <div className="form-title">
              <i className="fas fa-paperclip mr-3 text-green-600"></i>
              Attachments (Optional)
            </div>
            
            <div className="file-upload">
              <input 
                type="file" 
                id="attachments"
                multiple 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                className="hidden" 
                onChange={(e) => {
                  // Handle file upload here
                  const files = Array.from(e.target.files || []);
                  console.log('Selected files:', files);
                }}
              />
              <label htmlFor="attachments" className="cursor-pointer block">
                <div className="text-center">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    Click to upload files or drag and drop
                  </div>
                  <div className="text-sm text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX, PNG, JPG up to 10MB each
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <i className="fas fa-plus mr-2"></i>
                      Choose Files
                    </span>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              <i className="fas fa-info-circle mr-1 text-blue-500"></i>
              You can attach relevant documents such as event proposals, budgets, or supporting materials.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn btn-secondary"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating Request...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Create Request
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
