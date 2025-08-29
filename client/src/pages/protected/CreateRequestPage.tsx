//client/src/pages/protected/CreateRequestPage.tsx

import { useState, useEffect } from 'react';
import { createRequest, getDepartments, uploadRequestAttachment } from '../../services/request.service';
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
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

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

  // File handling functions
  const handleFileSelect = (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        push(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
        return false;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        push(`File "${file.name}" has an unsupported format.`, 'error');
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) return 'fas fa-image text-green-500';
    if (fileType === 'application/pdf') return 'fas fa-file-pdf text-red-500';
    if (fileType.includes('word')) return 'fas fa-file-word text-blue-500';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel text-green-600';
    if (fileType.includes('text')) return 'fas fa-file-alt text-gray-500';
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return 'fas fa-file-pdf text-red-500';
      case 'doc':
      case 'docx': return 'fas fa-file-word text-blue-500';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel text-green-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'fas fa-image text-green-500';
      case 'txt': return 'fas fa-file-alt text-gray-500';
      default: return 'fas fa-file text-gray-400';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!formData.departmentId && !formData.departmentName) throw new Error('Department required');
      if (!formData.serviceType) throw new Error('Service type required');
      if (!currentUser?.phone && !formData.phone) throw new Error('Personal phone number required');
      
      // Create the request first
      const created = await createRequest({
        ...formData,
        contactPhone: formData.contactPhone || undefined,
        departmentId: formData.departmentId || undefined,
        departmentName: usingNewDept ? formData.departmentName : undefined,
        phone: (!currentUser?.phone && formData.phone) ? formData.phone : undefined,
      });

      // Upload files if any
      if (files.length > 0) {
        try {
          await Promise.all(
            files.map(file => uploadRequestAttachment(created.id, file))
          );
          push(`Request created with ${files.length} file(s) uploaded`, 'success');
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          push('Request created but some files failed to upload', 'error');
        }
      } else {
        push('Request created', 'success');
      }
      
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
    <div className="min-h-screen section-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
              <i className="fas fa-plus text-primary-600 text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Service Request</h1>
              <p className="text-gray-200">Submit a new service request for catering services</p>
            </div>
          </div>
        </div>

      {/* Form Container */}
      <div className="form-container-compact">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Event Information Section */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fas fa-calendar-alt mr-3 text-primary-600"></i>
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
          <div className="form-section">
            <div className="form-section-title">
              <i className="fas fa-dollar-sign mr-3 text-primary-600"></i>
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
          <div className="form-section">
            <div className="form-section-title">
              <i className="fas fa-building mr-3 text-primary-600"></i>
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
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-user mr-3 text-primary-600"></i>
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
          <div className="form-section">
            <div className="form-section-title">
              <i className="fas fa-paperclip mr-3 text-primary-600"></i>
              Attachments (Optional)
            </div>
            
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                isDragOver 
                  ? 'border-primary-400 bg-primary-50 scale-[1.02]' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="attachments"
                multiple 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files);
                  }
                }}
              />
              <label htmlFor="attachments" className="cursor-pointer block">
                <div className="text-center">
                  <i className={`fas fa-cloud-upload-alt text-4xl mb-4 transition-colors ${
                    isDragOver ? 'text-primary-500' : 'text-gray-400'
                  }`}></i>
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    {isDragOver ? (
                      <span className="text-primary-600 font-semibold">Drop files here to upload</span>
                    ) : (
                      'Click to upload files or drag and drop'
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    PDF, DOC, DOCX, XLS, XLSX, PNG, JPG up to 10MB each
                  </div>
                  {!isDragOver && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <i className="fas fa-plus mr-2"></i>
                        Choose Files
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Selected Files ({files.length}):</h4>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <i className={`${getFileIcon(file.name, file.type)} text-xl`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 text-sm text-gray-600">
              <i className="fas fa-info-circle mr-1 text-blue-500"></i>
              You can attach relevant documents such as event proposals, budgets, or supporting materials.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-accent-red-50 border border-accent-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-accent-red-600 mr-2"></i>
                <span className="text-accent-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-submit-section">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn-yellow"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="btn-primary btn-shimmer"
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
    </div>
  );
}
