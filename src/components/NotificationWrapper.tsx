import React, { ReactNode } from 'react';
import { NotificationProvider } from '../context/NotificationContext';

interface NotificationWrapperProps {
  children: ReactNode;
}

const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ children }) => {
  return <NotificationProvider maxNotifications={20}>{children}</NotificationProvider>;
};

export default NotificationWrapper;
