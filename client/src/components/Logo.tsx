import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, iconClassName, size = 'md' }: LogoProps) => {
  const [error, setError] = React.useState(false);

  const sizes = {
    sm: 'w-8 h-8 rounded-lg p-0.5',
    md: 'w-10 h-10 rounded-xl p-0.5',
    lg: 'w-12 h-12 rounded-2xl p-1'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  if (!error) {
    return (
      <img 
        src="https://storage.googleapis.com/nav-p-ais-dev-zmusutsmplkzzscnsmcbyh-721073005302.asia-southeast1.run.app/1744182100868-logo.png" 
        alt="Ai Journal Logo" 
        className={cn(sizes[size], "object-contain shadow-premium bg-white", className)}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={cn(sizes[size], "bg-status-success flex items-center justify-center text-white shadow-premium", className)}>
      <BrainCircuit className={cn(iconSizes[size], iconClassName)} />
    </div>
  );
};
