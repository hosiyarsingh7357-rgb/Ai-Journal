import React from 'react';
import { cn } from '../../lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = ({ className, label, error, ...props }: InputProps) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full h-12 px-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-bold text-text-primary placeholder:text-text-muted",
          error && "border-status-danger focus:ring-status-danger/50",
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-status-danger ml-1">{error}</p>}
    </div>
  );
};
