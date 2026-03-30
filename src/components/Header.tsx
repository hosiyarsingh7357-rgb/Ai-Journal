import React, { useState } from 'react';
import { Search, Bell, LogIn, Menu, RefreshCw, LogOut, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

export const Header = ({ 
  title, 
  onOpenLogin, 
  onSync,
  isSyncing = false,
  isAccountConnected,
  accountName,
  onLogout
}: { 
  title: string, 
  onOpenLogin: () => void,
  onSync: () => void,
  isSyncing: boolean,
  isAccountConnected: boolean,
  accountName?: string,
  onLogout: () => void
}) => {
  const { theme, toggleTheme, setSidebarOpen } = useAppStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 z-20 sticky top-0 backdrop-blur-2xl border-b border-border dark:border-border-dark bg-background/80 dark:bg-background-dark/80">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2.5 text-text-secondary dark:text-text-secondary-dark hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-2xl transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-text-primary dark:text-text-primary-dark truncate max-w-[150px] sm:max-w-none uppercase tracking-[0.1em]">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Search */}
        <div className="relative hidden md:block w-48 lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark group-focus-within:text-brand-primary w-4 h-4 transition-colors" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-surface-muted dark:bg-surface-muted-dark border border-border dark:border-border-dark rounded-2xl text-sm text-text-primary dark:text-text-primary-dark placeholder-text-muted dark:placeholder-text-muted-dark focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
            placeholder="Search analytics..."
            type="text"
          />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-3 lg:gap-5">
          <button onClick={toggleTheme} className="p-2.5 text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-xl transition-all active:scale-90">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {isAccountConnected && (
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className="p-2.5 text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-xl transition-all active:scale-90 relative"
            >
              <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
            </button>
          )}

          <button 
            onClick={onOpenLogin}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-premium border",
              isAccountConnected 
                ? "bg-status-success text-white border-status-success/20 shadow-premium" 
                : "bg-brand-primary text-white border-brand-primary/20 hover:scale-105 shadow-premium"
            )}
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">{isAccountConnected ? (accountName || 'CONNECTED') : 'MT5 LOGIN'}</span>
            <span className="sm:hidden">{isAccountConnected ? 'OK' : 'LOGIN'}</span>
          </button>

          <button 
            onClick={onLogout}
            className="p-2.5 text-text-secondary dark:text-text-secondary-dark hover:text-danger hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-xl transition-all active:scale-90"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative text-text-secondary dark:text-text-secondary-dark hover:text-brand-primary hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded-xl transition-all p-2.5 active:scale-90"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background dark:border-background-dark"></span>
          </button>
          
          <div className="h-10 w-10 rounded-2xl overflow-hidden border-2 border-border dark:border-border-dark cursor-pointer flex-shrink-0 bg-surface-muted dark:bg-surface-muted-dark hover:scale-110 transition-transform shadow-premium">
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
