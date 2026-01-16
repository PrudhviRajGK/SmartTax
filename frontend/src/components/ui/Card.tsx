import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = `
    bg-[rgb(var(--color-bg-primary))] 
    border border-[rgb(var(--color-border-subtle))] 
    rounded-xl 
    shadow-[var(--shadow-card)]
    ${hover ? 'transition-all duration-180 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5' : ''}
    ${paddings[padding]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};
