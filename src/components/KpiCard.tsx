import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconBg = 'bg-brand-primary/10',
  iconColor = 'text-brand-primary'
}: KpiCardProps) => {
  return (
    <div className="glass p-6 border border-white/10 dark:border-white/5 shadow-premium relative hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 blur-3xl -mr-12 -mt-12 rounded-full group-hover:bg-brand-primary/10 transition-colors" />
      
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{title}</p>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</h2>
      </div>
      
      <div className="relative z-10 mt-6 flex items-center gap-2">
        <div className="h-1 w-8 rounded-full bg-brand-primary/20 overflow-hidden">
          <div className="h-full w-2/3 bg-brand-primary rounded-full" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</p>
      </div>

      <div className={`absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${iconBg} ${iconColor} shadow-glow`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
