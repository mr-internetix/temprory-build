import React, {useState, useEffect} from 'react';
import { Icon } from '@iconify/react';
import { Notification } from '../../lib/websocket_service';

interface ToastNotificationProps {
    notification: Notification;
    onClose: () => void;
    duration?: number;
}


export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    console.log("🍞 ToastNotification mounted for:", notification.id);
    
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide timer
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      console.log("🍞 ToastNotification unmounted for:", notification.id);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, notification.id]);

  const handleClose = () => {
    console.log("🍞 ToastNotification closing:", notification.id);
    setIsRemoving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'idatagenerator_project_created':
        return { icon: 'heroicons:folder-plus', color: 'text-green-500' };
      case 'idatagenerator_test_case_created':
        return { icon: 'heroicons:document-plus', color: 'text-blue-500' };
      case 'idatagenerator_mdd_processing_start':
      case 'idatagenerator_test_case_processing_start':
        return { icon: 'heroicons:play-circle', color: 'text-yellow-500' };
      case 'idatagenerator_mdd_processing_update':
      case 'idatagenerator_data_generation_progress':
        return { icon: 'heroicons:arrow-path', color: 'text-blue-500' };
      case 'idatagenerator_mdd_processed':
      case 'idatagenerator_test_case_completed':
      case 'idatagenerator_respondent_completed':
        return { icon: 'heroicons:check-circle', color: 'text-green-500' };
      case 'idatagenerator_error':
        return { icon: 'heroicons:exclamation-triangle', color: 'text-red-500' };
      default:
        return { icon: 'heroicons:bell', color: 'text-blue-500' };
    }
  };

  const { icon, color } = getIcon();

  return (
    <div
      className={`min-w-[420px] max-w-[500px] w-full bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 transform ${
        isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`border-l-4 ${notification.color} p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon icon={icon} className={`w-6 h-6 ${color}`} />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1 leading-relaxed">
              {notification.title}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed break-words">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};