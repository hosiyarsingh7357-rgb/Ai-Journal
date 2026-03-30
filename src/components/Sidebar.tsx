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
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#020617] border-r border-white/5 flex flex-col justify-between h-full flex-shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <span className="text-white text-xs font-black">AJ</span>
            </div>
            <span className="font-black text-white text-lg tracking-tighter">Ai Journal</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
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
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon className={`w-5 h-5 transition-colors ${currentPage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />}
                <span>{item.label}</span>
              </div>
              {item.hasSubmenu && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
            </button>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="px-4 py-6 border-t border-white/5 space-y-1 flex-shrink-0">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                currentPage === item.id
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
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
      <button className="absolute -right-3 top-20 bg-slate-800 border border-white/10 rounded-full p-1 shadow-sm text-slate-400 hover:text-white transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </button>
    </aside>
  );
};

