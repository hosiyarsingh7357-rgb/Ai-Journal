import React, { useState } from 'react';
import { Search, Bell, LogIn, Menu, RefreshCw, LogOut, Sun, Moon } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { toggleTheme } from '../utils/theme';

export const Header = ({ 
  title, 
  onMenuClick, 
  onOpenLogin, 
  onSync,
  isSyncing = false,
  isAccountConnected,
  accountName,
  onLogout
}: { 
  title: string, 
  onMenuClick: () => void,
  onOpenLogin: () => void,
  onSync: () => void,
  isSyncing: boolean,
  isAccountConnected: boolean,
  accountName?: string,
  onLogout: () => void
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications } = useNotifications();

  return (
    <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 z-20 shadow-premium sticky top-0 backdrop-blur-2xl">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 text-slate-400 hover:bg-white/5 rounded-2xl transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-none uppercase tracking-[0.1em]">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Search */}
        <div className="relative hidden md:block w-48 lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary w-4 h-4 transition-colors" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
            placeholder="Search analytics..."
            type="text"
          />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-3 lg:gap-5">
          <button onClick={toggleTheme} className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all active:scale-90">
            <Sun className="w-5 h-5 hidden dark:block" />
            <Moon className="w-5 h-5 block dark:hidden" />
          </button>
          
          {isAccountConnected && (
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all active:scale-90 relative"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button 
            onClick={onOpenLogin}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-glow border ${
              isAccountConnected 
                ? 'bg-status-success/10 text-status-success border-status-success/20' 
                : 'bg-brand-primary text-white border-brand-primary/20 hover:scale-105'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">{isAccountConnected ? (accountName || 'CONNECTED') : 'MT5 LOGIN'}</span>
            <span className="sm:hidden">{isAccountConnected ? 'OK' : 'LOGIN'}</span>
          </button>

          <button 
            onClick={onLogout}
            className="p-2.5 text-slate-500 hover:text-status-danger hover:bg-status-danger/5 rounded-xl transition-all active:scale-90"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all p-2.5 active:scale-90"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-status-danger rounded-full border-2 border-[#020617]"></span>
          </button>
          
          <div className="h-10 w-10 rounded-2xl overflow-hidden border-2 border-white/10 cursor-pointer flex-shrink-0 bg-white hover:scale-110 transition-transform shadow-glow">
            <img
              alt="User Avatar"
              className="w-full h-full object-cover"
              src="https://picsum.photos/seed/user/100/100"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
