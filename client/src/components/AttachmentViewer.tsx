import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';

interface AttachmentViewerProps {
  attachments: any[];
  entityId: string;
  entityType: 'request' | 'invoice' | 'payment';
  canUpload?: boolean;
  uploadFunction: (entityId: string, file: File) => Promise<any>;
  queryKey: string[];
}

export default function AttachmentViewer({ 
  attachments, 
  entityId, 
  entityType, 
  canUpload = false, 
  uploadFunction,
  queryKey 
}: AttachmentViewerProps) {
  const { push } = useToast();
  const qc = useQueryClient();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const uploadMut = useMutation({
    mutationFn: async (file: File) => uploadFunction(entityId, file),
    onSuccess: () => { 
      push('File uploaded successfully', 'success'); 
      qc.invalidateQueries({ queryKey }); 
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      const message = error?.response?.data?.message || 'Upload failed';
      push(message, 'error');
    },
  });

  const handleFileSelect = (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      push('File size must be less than 10MB', 'error');
      return;
    }

    // Validate file type
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
      push('File type not supported. Please upload PDF, images, documents, or text files.', 'error');
      return;
    }

    uploadMut.mutate(file);
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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Construct proper file URL with base API URL
  const getFileUrl = (attachment: any) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const fileUrl = attachment.fileUrl || attachment.url;
    
    // If the URL is already absolute, return as is
    if (fileUrl?.startsWith('http')) {
      return fileUrl;
    }
    
    // If the URL starts with /uploads, construct the full URL
    if (fileUrl?.startsWith('/uploads')) {
      return `${baseUrl}${fileUrl}`;
    }
    
    // Fallback construction
    return `${baseUrl}/uploads/${fileUrl}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.startsWith('image/')) return 'fas fa-image text-green-500';
    if (fileType === 'application/pdf') return 'fas fa-file-pdf text-red-500';
    if (fileType.includes('word')) return 'fas fa-file-word text-blue-500';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel text-green-600';
    if (fileType.includes('text')) return 'fas fa-file-alt text-gray-500';
    
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Supporting Documents ({attachments.length})
        </h3>
        {canUpload && (
          <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <i className="fas fa-plus mr-2"></i>
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={e => { 
                const f = e.target.files?.[0]; 
                if (f) handleFileSelect(f); 
              }} 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
            />
          </label>
        )}
      </div>

      {/* Drag and Drop Area */}
      {canUpload && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center mb-4 transition-all duration-200 ${
            isDragOver 
              ? 'border-primary-400 bg-primary-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <i className={`fas fa-cloud-upload-alt text-2xl sm:text-3xl mb-2 transition-colors ${
            isDragOver ? 'text-primary-500' : 'text-gray-400'
          }`}></i>
          <p className="text-gray-600 text-sm sm:text-base">
            {isDragOver ? (
              <span className="text-primary-600 font-semibold">Drop files here to upload</span>
            ) : (
              <>
                <span className="hidden sm:inline">Drag and drop files here, or </span>
                <span className="sm:hidden">Tap to </span>
                <label className="text-primary-600 font-medium cursor-pointer hover:text-primary-700">
                  browse
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={e => { 
                      const f = e.target.files?.[0]; 
                      if (f) handleFileSelect(f); 
                    }} 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                </label>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="hidden sm:inline">Supports: PDF, Images, Word, Excel, Text files (Max 10MB)</span>
            <span className="sm:hidden">Max 10MB</span>
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadMut.isPending && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <i className="fas fa-spinner fa-spin text-blue-600 mr-2"></i>
            <span className="text-blue-800 text-sm">Uploading file...</span>
          </div>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 ? (
        <div className="space-y-3">
          {attachments.map((attachment: any) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {attachment.fileType?.startsWith('image/') ? (
                    <img
                      src={getFileUrl(attachment)}
                      alt={attachment.fileName}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border"
                    />
                  ) : null}
                  <i 
                    className={`${getFileIcon(attachment.fileName, attachment.fileType)} text-xl sm:text-2xl ${
                      attachment.fileType?.startsWith('image/') ? 'hidden' : 'block'
                    }`} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.fileName}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(attachment.fileSize || 0)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(attachment.uploadedAt || attachment.createdAt).toLocaleDateString()}</span>
                    {attachment.fileType && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="uppercase">{attachment.fileType.split('/')[1] || 'file'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                <a
                  href={getFileUrl(attachment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-100 rounded-md hover:bg-primary-200 transition-colors"
                >
                  <i className="fas fa-external-link-alt mr-1"></i>
                  <span className="hidden sm:inline">View</span>
                  <span className="sm:hidden">View</span>
                </a>
                <a
                  href={getFileUrl(attachment)}
                  download={attachment.fileName}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <i className="fas fa-download mr-1"></i>
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">DL</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <i className="fas fa-file-alt text-4xl sm:text-6xl text-gray-300 mb-4"></i>
          <p className="text-base sm:text-lg font-medium mb-2">No documents uploaded</p>
          <p className="text-sm">
            {canUpload ? 'Upload supporting documents to get started.' : 'No supporting documents available.'}
          </p>
        </div>
      )}
    </div>
  );
}
