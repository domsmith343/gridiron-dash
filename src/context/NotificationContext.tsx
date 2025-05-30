import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { websocketService } from '../services/websocket';

// Define notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  gameId?: string;
  timestamp: Date;
  read: boolean;
}

// Define context type
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Create context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {}
});

// Custom hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

// Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxNotifications = 10 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => {
      // Add new notification at the beginning and limit to maxNotifications
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });
    
    // If browser notifications are supported and permitted, show a browser notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  // Subscribe to WebSocket updates for real-time notifications
  useEffect(() => {
    // Subscribe to score updates
    const unsubscribeScoreUpdates = websocketService.subscribeToScoreUpdates(
      (gameId, homeScore, awayScore) => {
        addNotification({
          title: 'Score Update',
          message: `Score changed in game ${gameId}`,
          type: 'info',
          gameId
        });
      }
    );
    
    // Subscribe to news updates
    const unsubscribeNewsUpdates = websocketService.subscribeToNewsUpdates(
      (news) => {
        addNotification({
          title: news.headline,
          message: news.summary,
          type: 'info',
          gameId: news.gameId
        });
      }
    );
    
    // Subscribe to status updates
    const unsubscribeStatusUpdates = websocketService.subscribeToStatusUpdates(
      (gameId, status) => {
        if (status === 'LIVE') {
          addNotification({
            title: 'Game Started',
            message: `Game ${gameId} is now live!`,
            type: 'success',
            gameId
          });
        } else if (status === 'FINAL') {
          addNotification({
            title: 'Game Ended',
            message: `Game ${gameId} has ended`,
            type: 'info',
            gameId
          });
        }
      }
    );
    
    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeScoreUpdates();
      unsubscribeNewsUpdates();
      unsubscribeStatusUpdates();
    };
  }, []);
  
  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        addNotification, 
        markAsRead, 
        markAllAsRead, 
        clearNotifications 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
