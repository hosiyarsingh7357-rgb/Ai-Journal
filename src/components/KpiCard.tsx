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
  iconBg = 'bg-blue-500/20',
  iconColor = 'text-blue-400'
}: KpiCardProps) => {
  return (
    <div className="glass relative p-6 hover:scale-105 transition-all duration-300 shadow-xl flex flex-col justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <h2 className="text-3xl font-bold text-white">{value}</h2>
      </div>
      <p className="text-xs text-gray-500 mt-4">{subtitle}</p>
      <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
