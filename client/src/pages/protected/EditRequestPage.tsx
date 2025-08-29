import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { updateRequest, uploadRequestAttachment } from '../../services/request.service';
import { useToast } from '../../contexts/ToastContext';
import type { ServiceRequest, UpdateServiceRequestInput } from '../../types/request';

export default function EditRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

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
    serviceType: '',
    description: '',
    fundingSource: '',
    contactPhone: '',
  });

  // File upload state
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data) {
      // Convert ISO date to yyyy-MM-dd format for date input
      const eventDate = data.eventDate ? new Date(data.eventDate).toISOString().split('T')[0] : '';
      
      setFormData({
        eventName: data.eventName,
        eventDate: eventDate,
        venue: data.venue,
        estimateAmount: data.estimateAmount,
        attendees: data.attendees,
        serviceType: data.serviceType || '',
        description: data.description,
        fundingSource: data.fundingSource,
        contactPhone: data.contactPhone,
      });
    }
  }, [data]);

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

  const uploadFiles = async () => {
    if (files.length === 0 || !id) return;
    
    setUploading(true);
    try {
      await Promise.all(
        files.map(file => uploadRequestAttachment(id, file))
      );
      push(`${files.length} file(s) uploaded successfully`, 'success');
      setFiles([]); // Clear files after successful upload
      queryClient.invalidateQueries({ queryKey: ['request', id] });
    } catch (error) {
      console.error('File upload error:', error);
      push('Some files failed to upload', 'error');
    } finally {
      setUploading(false);
    }
  };

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
    
    // Convert string numbers to actual numbers
    const submitData = {
      ...formData,
      estimateAmount: Number(formData.estimateAmount),
      attendees: Number(formData.attendees)
    };
    
    mutation.mutate(submitData);
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
      <div className="form-container-compact">
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
                  Service Type *
                </label>
                <select 
                  value={formData.serviceType || ''} 
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
              Upload Additional Attachments (Optional)
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
                id="edit-attachments"
                multiple 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files);
                  }
                }}
              />
              <label htmlFor="edit-attachments" className="cursor-pointer block">
                <div className="text-center">
                  <i className={`fas fa-cloud-upload-alt text-4xl mb-4 transition-colors ${
                    isDragOver ? 'text-primary-500' : 'text-gray-400'
                  }`}></i>
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    {isDragOver ? (
                      <span className="text-primary-600 font-semibold">Drop files here to upload</span>
                    ) : (
                      'Click to upload additional files or drag and drop'
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    PDF, DOC, DOCX, XLS, XLSX, PNG, JPG up to 10MB each
                  </div>
                  {!isDragOver && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <i className="fas fa-plus mr-2"></i>
                        Add Files
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">New Files to Upload ({files.length}):</h4>
                  <button
                    type="button"
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-1"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload mr-1"></i>
                        Upload All
                      </>
                    )}
                  </button>
                </div>
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
                      disabled={uploading}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 text-sm text-gray-600">
              <i className="fas fa-info-circle mr-1 text-blue-500"></i>
              Upload any additional documents. Existing attachments are managed in the request detail view.
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
