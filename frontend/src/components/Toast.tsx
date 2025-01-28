import React, { useEffect } from 'react';
import { RiCheckLine, RiErrorWarningLine, RiCloseLine } from 'react-icons/ri';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
          type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}
      >
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <RiCheckLine className="text-xl text-green-500" />
          ) : (
            <RiErrorWarningLine className="text-xl text-red-500" />
          )}
        </div>
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ml-4 text-lg ${
            type === 'success' ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'
          }`}
        >
          <RiCloseLine />
        </button>
      </div>
    </div>
  );
};

export default Toast; 