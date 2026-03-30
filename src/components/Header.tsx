import React, { useState } from 'react';
import { Search, Bell, LogIn, Menu, RefreshCw, LogOut } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

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
    <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-20 shadow-lg rounded-none border-t-0 border-l-0 border-r-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-white truncate max-w-[150px] sm:max-w-none">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Search */}
        <div className="relative hidden md:block w-48 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-400 focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
            placeholder="Search..."
            type="text"
          />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {isAccountConnected && (
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className="p-2 text-slate-300 hover:text-white transition-colors relative"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button 
            onClick={onOpenLogin}
            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-[10px] lg:text-xs font-bold transition-all active:scale-95 shadow-sm whitespace-nowrap border ${
              isAccountConnected 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAccountConnected ? (accountName || 'ACCOUNT CONNECTED') : 'MT5 LOGIN'}</span>
            <span className="sm:hidden">{isAccountConnected ? 'CONNECTED' : 'LOGIN'}</span>
          </button>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative text-slate-300 hover:text-white transition-colors p-1"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
          </button>
          
          {isNotificationOpen && (
            <div className="absolute top-16 right-4 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-50">
              <h3 className="text-slate-900 font-bold mb-2">Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-sm">No new errors.</p>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((n, i) => (
                    <li key={i} className="text-red-600 text-sm">{n}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-300 cursor-pointer flex-shrink-0 bg-white">
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
