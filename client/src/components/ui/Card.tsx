import React from 'react';
import { cn } from '@/utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ className, children, hoverable = true, ...props }: CardProps) => {
  return (
    <div 
      className={cn(
        "bg-surface border border-border rounded-[2.5rem] p-6 transition-all duration-300",
        hoverable && "hover:border-brand-primary/30 hover:shadow-premium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
