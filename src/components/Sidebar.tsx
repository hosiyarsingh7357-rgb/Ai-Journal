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
import { motion } from 'motion/react';

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
  isOpen, 
  onClose,
  onNavigate
}: { 
  currentPage: string, 
  isOpen: boolean,
  onClose: () => void,
  onNavigate: (id: string) => void
}) => {
  return (
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-theme-bg-light dark:bg-theme-bg-dark border-r border-theme-border-light dark:border-theme-border-dark flex flex-col justify-between h-full flex-shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <span className="text-white text-xs font-black">AJ</span>
            </div>
            <span className="font-black text-theme-text-primary-light dark:text-theme-text-primary-dark text-lg tracking-tighter">Ai Journal</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark"
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all group ${
                currentPage === item.id
                  ? 'bg-brand-primary text-white shadow-glow' 
                  : 'text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-surface-light dark:hover:bg-theme-surface-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon className={`w-5 h-5 transition-colors ${currentPage === item.id ? 'text-white' : 'text-theme-text-secondary-light dark:text-theme-text-secondary-dark group-hover:text-theme-text-primary-light dark:group-hover:text-theme-text-primary-dark'}`} />}
                <span>{item.label}</span>
              </div>
              {item.hasSubmenu && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
            </button>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="px-4 py-6 border-t border-theme-border-light dark:border-theme-border-dark space-y-1 flex-shrink-0">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                currentPage === item.id
                  ? 'bg-brand-primary text-white'
                  : 'text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark hover:bg-theme-surface-light dark:hover:bg-theme-surface-dark'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer Preferences */}
      </div>

      {/* Collapse Toggle */}
      <button className="absolute -right-3 top-20 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-full p-1 shadow-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </button>
    </aside>
  );
};

