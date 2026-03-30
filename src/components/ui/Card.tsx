import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`glass glass-hover ${className}`} {...props}>
      {children}
    </div>
  );
};
