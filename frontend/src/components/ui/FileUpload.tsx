import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onFileSelect,
  description,
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
      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-accent bg-indigo-50 dark:bg-indigo-950'
            : 'border-gray-300 dark:border-gray-700 hover:border-accent'
        }`}
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
        />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {fileName ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </p>
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
