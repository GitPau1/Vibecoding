import React from 'react';
import { ToastMessage } from '../../contexts/ToastContext';
import Toast from './Toast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 flex flex-col items-center gap-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default ToastContainer;