import React from 'react';
import { Logo } from './Logo';
import { 
  Search, 
  Bell, 
  Menu, 
  RefreshCw, 
  Globe, 
  User, 
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  onOpenLogin: () => void;
  onSync: () => void;
  isSyncing: boolean;
  isAccountConnected: boolean;
  accountName?: string;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

export const Header = ({ 
  title, 
  onOpenLogin, 
  onSync, 
  isSyncing, 
  isAccountConnected, 
  accountName,
  onLogout,
  onNavigate
}: HeaderProps) => {
  const { toggleSidebar, theme } = useAppStore();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-8 relative z-30 shadow-premium">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Logo size="sm" className="lg:hidden" />
          <h2 className="text-lg lg:text-xl font-black text-text-primary tracking-tight truncate max-w-[120px] lg:max-w-none">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-4 w-4 h-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search trades, symbols..." 
            className="bg-surface-muted border border-border rounded-2xl pl-12 pr-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all w-64 text-text-primary placeholder:text-text-muted/70"
          />
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* MT5 Connection Status - Hidden on mobile, moved to profile dropdown */}
          <button 
            onClick={isAccountConnected ? onSync : onOpenLogin}
            disabled={isSyncing}
            className={cn(
              "hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-premium active:scale-95",
              isAccountConnected 
                ? "bg-status-success/10 text-status-success border border-status-success/30 hover:bg-status-success/20" 
                : "bg-status-success text-white hover:bg-status-success/90"
            )}
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isAccountConnected ? (
              <>
                <Globe className="w-4 h-4" />
                {accountName || 'MT5 CONNECTED'}
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                CONNECT MT5
              </>
            )}
          </button>

          {/* Notifications */}
          <button className="p-2.5 hover:bg-surface-muted rounded-2xl transition-colors relative group text-text-secondary">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-status-danger rounded-full border-2 border-surface animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1.5 hover:bg-surface-muted rounded-2xl transition-all group border border-transparent hover:border-border"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 overflow-hidden shadow-premium">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5 text-brand-primary" />
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-3xl shadow-premium z-50 p-3 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-border mb-2">
                    <p className="text-sm font-black text-text-primary truncate">{user?.displayName || 'Trader'}</p>
                    <p className="text-[10px] font-bold text-text-secondary truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    {/* Mobile Only: Connect MT5 */}
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        isAccountConnected ? onSync() : onOpenLogin();
                      }}
                      className="lg:hidden w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-status-success hover:bg-status-success/10 transition-all"
                    >
                      <Globe className="w-4 h-4" /> {isAccountConnected ? (accountName || 'Sync MT5') : 'Connect MT5'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate?.('settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate?.('subscription');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all"
                    >
                      <CreditCard className="w-4 h-4" /> Subscription
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate?.('support');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all"
                    >
                      <HelpCircle className="w-4 h-4" /> Support
                    </button>
                    <div className="h-px bg-border my-2 mx-2" />
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-status-danger hover:bg-status-danger/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
