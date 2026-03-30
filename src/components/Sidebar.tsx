import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Bot, 
  History, 
  Users, 
  Wrench, 
  Settings, 
  HelpCircle, 
  CreditCard, 
  MessageSquare,
  Moon,
  DollarSign,
  Globe,
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
  { icon: History, label: 'Backtesting', id: 'backtesting' },
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
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-gradient-to-b from-[#020617] to-[#0f172a] border-r border-white/10 flex flex-col justify-between h-full flex-shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer text-white" onClick={() => onNavigate('dashboard')}>
            <span className="italic font-black text-blue-500 text-xl">AJ</span>
            <span className="font-bold text-white text-lg">Ai Journal</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors group ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.label}</span>
              </div>
              {item.hasSubmenu && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
            </button>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1 flex-shrink-0">
          {bottomItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
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

