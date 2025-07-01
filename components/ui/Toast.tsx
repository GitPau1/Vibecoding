
import React, { useEffect } from 'react';
import { ToastMessage } from '../../contexts/ToastContext';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { XIcon } from '../icons/XIcon';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  const typeStyles = {
    success: {
      icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
      containerClasses: 'bg-green-50 border-green-500',
      messageClasses: 'text-green-800 font-medium',
      buttonClasses: 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50',
    },
    error: {
      icon: <ErrorIcon className="h-6 w-6 text-red-500" />,
      containerClasses: 'bg-red-50 border-red-500',
      messageClasses: 'text-red-800 font-medium',
      buttonClasses: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50',
    },
    info: {
      icon: <InfoIcon className="h-6 w-6 text-blue-500" />,
      containerClasses: 'bg-blue-50 border-blue-500',
      messageClasses: 'text-blue-800 font-medium',
      buttonClasses: 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50',
    },
  };

  const styles = typeStyles[toast.type];

  return (
    <div className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-toast-in border-l-4 ${styles.containerClasses}`} role="alert" aria-live="assertive">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm ${styles.messageClasses}`}>{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 ${styles.buttonClasses}`}
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
