import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  description?: string;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onFileSelect,
  description,
  error,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-[13px] font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
        {label}
      </label>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
          transition-all duration-150
          ${isDragging
            ? 'border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent-light))]'
            : error
            ? 'border-[rgb(var(--color-error))] bg-[rgb(var(--color-error-bg))]'
            : 'border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-bg-tertiary))]'
          }
        `.trim().replace(/\s+/g, ' ')}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          aria-label={label}
        />
        <div className="space-y-3">
          <svg
            className="mx-auto h-12 w-12 text-[rgb(var(--color-text-tertiary))]"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {fileName ? (
            <div className="space-y-1">
              <p className="text-[15px] font-medium text-[rgb(var(--color-text-primary))]">{fileName}</p>
              <p className="text-[13px] text-[rgb(var(--color-text-tertiary))]">Click to change file</p>
            </div>
          ) : (
            <>
              <p className="text-[15px] text-[rgb(var(--color-text-secondary))]">
                Click to upload or drag and drop
              </p>
              {description && (
                <p className="text-[13px] text-[rgb(var(--color-text-tertiary))]">{description}</p>
              )}
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-[13px] text-[rgb(var(--color-error))] flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
