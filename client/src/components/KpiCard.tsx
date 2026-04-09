import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconBg = "bg-brand-primary/10", 
  iconColor = "text-brand-primary",
  className 
}: KpiCardProps) => {
  return (
    <Card className={cn("p-8 relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-colors" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-brand-primary rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{title}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black text-text-primary tracking-tight">{value}</p>
            {subtitle && <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{subtitle}</p>}
          </div>
        </div>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-premium transition-transform group-hover:scale-110", iconBg, iconColor)}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </Card>
  );
};
