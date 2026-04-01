import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  key?: React.Key;
}

export const Card = ({ children, className, hoverable = true, ...props }: CardProps) => {
  return (
    <div 
      className={cn(
        'glass',
        hoverable && 'glass-hover',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
