import React, { useState, useEffect } from 'react';
import { ToastNotification } from './ToastNotification';
import { webSocketService, Notification } from '../../lib/websocket_service';

interface ToastState {
  notification: Notification;
  id: string;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const handleToastNotification = (notification: Notification) => {
      const toastState: ToastState = {
        notification,
        id: `toast-${notification.id}`
      };
      
      setToasts(prev => [...prev, toastState]);

      // Auto-remove toast after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastState.id));
      }, 7000);
    };

    webSocketService.onToastNotification(handleToastNotification);

    return () => {
      webSocketService.removeToastListener(handleToastNotification);
    };
  }, []);

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          notification={toast.notification}
          onClose={() => removeToast(toast.id)}
          duration={6000}
        />
      ))}
    </div>
  );
};