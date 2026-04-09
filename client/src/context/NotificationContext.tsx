import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-status-success" />,
    error: <XCircle className="w-5 h-5 text-status-danger" />,
    info: <Info className="w-5 h-5 text-brand-primary" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-warning" />
  };

  const bgColors = {
    success: 'bg-status-success/10 border-status-success/20',
    error: 'bg-status-danger/10 border-status-danger/20',
    info: 'bg-brand-primary/10 border-brand-primary/20',
    warning: 'bg-status-warning/10 border-status-warning/20'
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-premium min-w-[320px] ${bgColors[n.type]}`}
            >
              {icons[n.type]}
              <p className="flex-1 text-sm font-bold text-text-primary">{n.message}</p>
              <button onClick={() => removeNotification(n.id)} className="p-1 hover:bg-surface-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
