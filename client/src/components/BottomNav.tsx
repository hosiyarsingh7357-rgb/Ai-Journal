import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  History, 
  BookOpen, 
  LineChart, 
  Globe, 
  BrainCircuit 
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (id: string) => void;
}

export const BottomNav = ({ currentPage, onNavigate }: BottomNavProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'performance', label: 'Stats', icon: BarChart3 },
    { id: 'trades', label: 'Trades', icon: History },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analysis', label: 'Analysis', icon: LineChart },
    { id: 'market', label: 'Market', icon: Globe },
    { id: 'ai-report', label: 'AI', icon: BrainCircuit },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border z-[60] px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between h-16 max-w-md mx-auto">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-all relative group h-full",
                isActive ? "text-status-success" : "text-text-muted hover:text-text-primary"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive ? "bg-status-success/10" : "group-hover:bg-surface-muted"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter transition-all",
                isActive ? "opacity-100 translate-y-0" : "opacity-70"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-status-success rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
