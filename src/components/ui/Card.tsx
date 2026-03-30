import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`glass border border-white/10 dark:border-white/5 shadow-premium transition-all duration-300 hover:shadow-glow hover:scale-[1.01] ${className}`}>
      {children}
    </div>
  );
};
