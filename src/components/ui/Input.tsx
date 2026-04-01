import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-11 px-4 rounded-xl bg-surface-muted border border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all duration-200 text-sm font-medium',
            error && 'border-status-danger focus:ring-status-danger/50 focus:border-status-danger',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[10px] font-bold text-status-danger ml-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
