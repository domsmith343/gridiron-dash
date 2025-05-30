import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // Format timestamp to readable format
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get notification type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`notification-center relative ${className}`}>
      <button
        onClick={toggleOpen}
        className="relative p-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Mark all as read
              </button>
              <button
                onClick={clearNotifications}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 mt-1 mr-2 rounded-full ${getTypeColor(notification.type)}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                        {notification.gameId && (
                          <a
                            href={`/game/${notification.gameId}`}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View game details
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
