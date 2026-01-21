import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText,
  className = '', 
  disabled,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 
          rounded-lg 
          border border-[rgb(var(--color-border))]
          bg-[rgb(var(--color-bg-primary))]
          text-[rgb(var(--color-text-primary))]
          text-[15px]
          placeholder:text-[rgb(var(--color-text-tertiary))]
          focus:outline-none 
          focus:ring-2 
          focus:ring-[rgb(var(--color-accent))] 
          focus:border-transparent
          disabled:opacity-50 
          disabled:cursor-not-allowed
          disabled:bg-[rgb(var(--color-bg-tertiary))]
          transition-all duration-150
          ${error ? 'border-[rgb(var(--color-error))] focus:ring-[rgb(var(--color-error))]' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        disabled={disabled}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-[13px] text-[rgb(var(--color-text-tertiary))]">{helperText}</p>
      )}
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
