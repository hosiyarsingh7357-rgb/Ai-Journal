import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Bot, 
  Settings, 
  HelpCircle, 
  CreditCard, 
  MessageSquare,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: TrendingUp, label: 'Performance', id: 'performance' },
  { icon: ArrowLeftRight, label: 'Trades', id: 'trades' },
  { icon: BookOpen, label: 'Journal', id: 'journal' },
  { icon: Bot, label: 'AI Report', id: 'ai-report' },
  { icon: BarChart3, label: 'Analysis', id: 'analysis', hasSubmenu: true },
  { icon: TrendingUp, label: 'Market', id: 'market' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: HelpCircle, label: 'Help & Support', id: 'support' },
  { icon: CreditCard, label: 'Subscription', id: 'subscription' },
  { icon: MessageSquare, label: 'Feedback', id: 'feedback' },
];

export const Sidebar = ({ 
  currentPage, 
  onNavigate
}: { 
  currentPage: string, 
  onNavigate: (id: string) => void
}) => {
  const { isSidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <aside className={cn(
      "fixed lg:static inset-y-0 left-0 w-64 bg-background dark:bg-background-dark border-r border-border dark:border-border-dark flex flex-col justify-between h-full flex-shrink-0 z-50 transition-transform duration-300 lg:translate-x-0",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border dark:border-border-dark flex-shrink-0">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform">
              <span className="text-white text-xs font-black">AJ</span>
            </div>
            <span className="font-black text-text-primary dark:text-text-primary-dark text-lg tracking-tighter">Ai Journal</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all group",
                currentPage === item.id
                  ? "bg-brand-primary text-white shadow-premium" 
                  : "text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark"
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  currentPage === item.id ? "text-white" : "text-text-secondary dark:text-text-secondary-dark group-hover:text-text-primary dark:group-hover:text-text-primary-dark"
                )} />}
                <span>{item.label}</span>
              </div>
              {item.hasSubmenu && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
            </button>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="px-4 py-6 border-t border-border dark:border-border-dark space-y-1 flex-shrink-0">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all",
                currentPage === item.id
                  ? "bg-brand-primary text-white shadow-premium"
                  : "text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

