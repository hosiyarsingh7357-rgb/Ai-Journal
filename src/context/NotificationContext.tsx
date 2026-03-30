import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext<{
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
} | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
