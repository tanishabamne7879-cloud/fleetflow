import React, { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const showToast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast(message),
    loading: (message) => toast.loading(message),
    dismiss: (toastId) => toast.dismiss(toastId),
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
    </ToastContext.Provider>
  );
};