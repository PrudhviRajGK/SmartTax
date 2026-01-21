import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium
    rounded-lg
    transition-all duration-150 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))] focus-visible:ring-offset-2
    active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ');
  
  const variants = {
    primary: `
      bg-[rgb(var(--color-accent))] text-white
      hover:bg-[rgb(var(--color-accent-hover))]
      shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
    `,
    secondary: `
      bg-[rgb(var(--color-bg-primary))]
      text-[rgb(var(--color-text-primary))]
      border border-[rgb(var(--color-border))]
      hover:bg-[rgb(var(--color-bg-tertiary))]
      hover:border-[rgb(var(--color-border))]
    `,
    ghost: `
      text-[rgb(var(--color-text-secondary))]
      hover:text-[rgb(var(--color-text-primary))]
      hover:bg-[rgb(var(--color-bg-tertiary))]
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-[15px]',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
