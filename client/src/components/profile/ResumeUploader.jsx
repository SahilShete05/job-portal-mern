import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import api, { getToken, refreshSession } from '../../services/authService';

const ResumeUploader = ({ currentResume, onUploadSuccess, onError }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx'];
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  const validateFile = (file) => {
    const fileExtension = `.${file.name.split('.').pop()}`.toLowerCase();
    if (!ACCEPTED_TYPES.includes(fileExtension)) {
      return 'Only PDF, DOC, and DOCX files are allowed';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 2MB';
    }
    return null;
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    const error = validateFile(file);
    if (error) {
      showMessage(error, 'error');
      onError?.(error);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/profile/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        showMessage('Resume uploaded successfully!', 'success');
        onUploadSuccess?.(response.data.data);
      } else {
        showMessage(response.data.message || 'Upload failed', 'error');
        onError?.(response.data.message);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Upload failed';
      showMessage(errorMsg, 'error');
      onError?.(errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    try {
      const response = await api.delete('/profile/delete-resume');
      if (response.data.success) {
        showMessage('Resume deleted successfully', 'success');
        onUploadSuccess?.({ resume: null });
      } else {
        showMessage(response.data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Delete failed';
      showMessage(errorMsg, 'error');
      onError?.(errorMsg);
    }
  };

  const getFileName = (resumePath) => {
    if (!resumePath) return null;
    return resumePath.split('/').pop();
  };

  const getResumeUrl = (resumePath) => {
    if (!resumePath) return null;
    if (resumePath.startsWith('http')) {
      return resumePath;
    }
    const apiBase = `${import.meta.env.VITE_API_BASE_URL}`;
    const apiOrigin = apiBase.replace(/\/api\/?$/, '') || window.location.origin;
    return `${apiOrigin}/${resumePath.replace(/^\//, '')}`;
  };

  const getViewerUrl = (resumePath) => {
    const resumeUrl = getResumeUrl(resumePath);
    if (!resumeUrl) return null;
    const lowerPath = resumePath.toLowerCase();
    if (lowerPath.endsWith('.pdf')) {
      return resumeUrl;
    }
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(resumeUrl)}`;
  };

  const handleViewResume = async () => {
    if (!currentResume) return;

    const lowerPath = currentResume.toLowerCase();
    if (!lowerPath.endsWith('.pdf')) {
      const viewerUrl = getViewerUrl(currentResume);
      if (viewerUrl) {
        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    try {
      if (!getToken()) {
        await refreshSession();
      }

      const makeRequest = () => api.get('/profile/resume/view', {
        responseType: 'blob',
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
      });

      let response;
      try {
        response = await makeRequest();
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          await refreshSession();
          response = await makeRequest();
        } else {
          throw requestError;
        }
      }

      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to open resume';
      showMessage(errorMsg, 'error');
      onError?.(errorMsg);
    }
  };

  return (
    <div className="rounded-lg p-6 border border-subtle bg-card shadow-card">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        Resume
      </h3>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-lg p-3 mb-4 flex items-start gap-3 border ${
            messageType === 'success'
              ? 'bg-success-soft border-success-soft'
              : 'bg-danger-soft border-danger-soft'
          }`}
        >
          {messageType === 'success' ? (
            <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              messageType === 'success' ? 'text-success' : 'text-danger'
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Current Resume */}
      {currentResume && !uploading && (
        <div
          className="rounded-lg p-4 mb-4 flex items-center justify-between bg-surface border border-subtle"
        >
          <div className="flex items-center gap-3">
            <File size={20} className="text-[color:var(--app-accent)]" />
            <div>
              <p className="text-sm font-medium text-primary">
                {getFileName(currentResume)}
              </p>
              <p className="text-xs text-muted">
                Current resume
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getViewerUrl(currentResume) && (
              <button
                type="button"
                onClick={handleViewResume}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[color:var(--app-accent)] border border-subtle hover:bg-[color:var(--app-accent-soft)] transition-colors"
              >
                View
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteResume}
              className="p-2 rounded-lg transition-colors duration-200 text-danger hover:bg-danger-soft"
              title="Delete resume"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer bg-surface ${
          isDragging
            ? 'border-[color:var(--app-accent)] bg-[color:var(--app-accent-soft)]'
            : 'border-subtle hover:border-[color:var(--app-accent)]'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
            </div>
            <p
              className="text-sm font-medium text-[color:var(--app-accent)]"
            >
              Uploading... {uploadProgress}%
            </p>
            <div className="w-full bg-[color:var(--app-accent-soft)] rounded-full h-2">
              <div
                className="bg-[color:var(--app-accent)] h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload
              size={32}
              className="mx-auto mb-2 text-muted"
            />
            <p
              className="text-sm font-medium text-primary"
            >
              Drag and drop your resume here
            </p>
            <p
              className="text-xs mt-1 text-muted"
            >
              or click to select (PDF, DOC, DOCX - Max 2MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
