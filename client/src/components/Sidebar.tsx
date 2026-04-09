import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  History, 
  BookOpen, 
  LineChart, 
  Globe, 
  BrainCircuit, 
  HelpCircle, 
  CreditCard, 
  MessageSquare, 
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (id: string, tradeId?: string) => void;
}

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const { isSidebarOpen, setSidebarOpen } = useAppStore();
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'trades', label: 'Trades', icon: History },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analysis', label: 'Analysis', icon: LineChart },
    { id: 'market', label: 'Market', icon: Globe },
    { id: 'ai-report', label: 'AI Intelligence', icon: BrainCircuit },
  ];

  const secondaryItems = [
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border transition-transform duration-300 transform lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-success rounded-2xl flex items-center justify-center text-white shadow-premium">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Ai Journal</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-surface-muted rounded-xl transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 ml-4">Main Navigation</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all group",
                  currentPage === item.id 
                    ? "bg-status-success text-white shadow-premium" 
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", currentPage === item.id ? "text-white" : "text-text-muted")} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-8 space-y-1">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 ml-4">System Settings</p>
            {secondaryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all group",
                  currentPage === item.id 
                    ? "bg-status-success text-white shadow-premium" 
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", currentPage === item.id ? "text-white" : "text-text-muted")} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="pt-6 border-t border-border mt-6">
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-status-danger hover:bg-status-danger/10 transition-all group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
