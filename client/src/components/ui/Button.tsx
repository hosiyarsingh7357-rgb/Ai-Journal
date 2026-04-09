import React from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
  className?: string;
}

export const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-premium',
    secondary: 'bg-surface-muted text-text-primary hover:bg-border',
    outline: 'bg-transparent border border-border text-text-primary hover:border-brand-primary/50',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted',
    danger: 'bg-status-danger text-white hover:bg-status-danger/90 shadow-premium'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
    icon: 'p-2.5'
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
