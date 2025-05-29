import React, { useEffect, useState } from 'react';
import { websocketService } from '../services/websocket';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  showLabel?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showLabel = true,
  className = ''
}) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>(
    websocketService.getConnectionStatus()
  );
  
  useEffect(() => {
    // Subscribe to connection status updates
    const unsubscribe = websocketService.subscribeToConnectionStatus((newStatus) => {
      setStatus(newStatus);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);
  
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return styles.statusConnected;
      case 'connecting':
        return styles.statusConnecting;
      case 'disconnected':
        return styles.statusDisconnected;
      case 'error':
        return styles.statusError;
      default:
        return styles.statusDisconnected;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };
  
  const handleReconnect = () => {
    websocketService.reconnect();
  };
  
  return (
    <div className={`${styles.container} ${className}`} role="status" aria-live="polite">
      <div className={`${styles.indicator} ${getStatusColor()}`} aria-hidden="true"></div>
      {showLabel && (
        <span className={styles.label}>{getStatusText()}</span>
      )}
      {(status === 'disconnected' || status === 'error') && (
        <button 
          className={styles.reconnectButton}
          onClick={handleReconnect}
          aria-label="Reconnect to live updates"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
