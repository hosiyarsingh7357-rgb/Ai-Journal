import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-xl shadow-slate-200/20 dark:shadow-none rounded-[2rem] p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 ${className}`}>
      {children}
    </div>
  );
};
