import React, { useEffect, useState, useCallback } from 'react';
import { useWizard } from '../../hooks/useWizard.tsx';

const DocumentUploadStep: React.FC = () => {
  const { data, updateData, updateStepValidity } = useWizard();
  const [file, setFile] = useState<File | null>(data.supporting_document || null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update wizard data when file changes
  useEffect(() => {
    updateData('supporting_document', file);
  }, [file]);

  // This step is optional, so always mark as valid
  useEffect(() => {
    updateStepValidity('documents', true);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please select a valid file type (PDF, DOC, DOCX, TXT, or images)');
      return;
    }

    if (selectedFile.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleFileRemove = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📋';
    return '📁';
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
          Supporting Documents
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Upload any supporting documents that help justify your access request (optional).
        </p>
      </div>

      <div className="space-y-4">
        {!file ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-6xl text-gray-400">📎</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your file here, or browse
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Supports: PDF, DOC, DOCX, TXT, Images (max 10MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Choose File
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>
              </div>
              <button
                onClick={handleFileRemove}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
            
            {uploadProgress < 100 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {uploadProgress === 100 && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <span className="mr-1">✅</span>
                File ready for upload
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-gray-400 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                Helpful documents to include
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Project requirements or specifications</li>
                  <li>Manager approval emails</li>
                  <li>Security clearance documents</li>
                  <li>Compliance certifications</li>
                  <li>Training completion certificates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">🔒</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Security & Privacy
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                All uploaded documents are encrypted and securely stored. Only authorized administrators can review your documents. Documents are automatically deleted after 90 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadStep;