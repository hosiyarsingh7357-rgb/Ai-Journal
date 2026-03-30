import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-primary text-white hover:bg-indigo-600 shadow-premium',
      secondary: 'bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark border border-border dark:border-border-dark',
      outline: 'border border-border dark:border-border-dark bg-transparent hover:bg-surface dark:hover:bg-surface-dark text-text-primary dark:text-text-primary-dark',
      ghost: 'bg-transparent hover:bg-surface dark:hover:bg-surface-dark text-text-primary dark:text-text-primary-dark',
      danger: 'bg-danger text-white hover:bg-danger/90 shadow-premium',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
