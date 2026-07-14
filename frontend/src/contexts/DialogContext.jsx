import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';

const DialogContext = createContext(null);

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div 
      className={`flex items-start gap-3 p-4 rounded-2xl shadow-lg border animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto bg-surface text-on-surface ${
        toast.type === 'success' ? 'border-green-500/20' : 
        toast.type === 'error' ? 'border-red-500/20' : 'border-outline-variant/30'
      }`}
    >
      <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${
        toast.type === 'success' ? 'bg-green-500/10 text-green-500' :
        toast.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
      }`}>
        {toast.type === 'success' ? <IconCheck size={18} /> : 
         toast.type === 'error' ? <IconAlertTriangle size={18} /> : <IconInfoCircle size={18} />}
      </div>
      <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
      <button 
        onClick={() => onClose(toast.id)}
        className="text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <IconX size={16} />
      </button>
    </div>
  );
};

export const DialogProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { title, message, resolve }

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const toast = useMemo(() => ({
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
  }), [showToast]);

  const confirm = useMemo(() => (title, message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({ title, message, resolve, ...options });
    });
  }, []);

  const alert = useMemo(() => (title, message) => {
    return new Promise((resolve) => {
      setConfirmState({ title, message, resolve, isAlert: true });
    });
  }, []);

  const contextValue = useMemo(() => ({
    toast,
    confirm,
    alert,
  }), [toast, confirm, alert]);

  const handleCloseConfirm = useCallback((result) => {
    if (confirmState && confirmState.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState(null);
  }, [confirmState]);

  useEffect(() => {
    if (!confirmState) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseConfirm(confirmState.isAlert ? true : false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmState, handleCloseConfirm]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}

      {/* Global Confirm/Alert Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-modal flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => !confirmState.isAlert && handleCloseConfirm(false)}
          />
          {/* Modal Container */}
          <div className="relative bg-surface rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-outline-variant/30 animate-in zoom-in-95 duration-200 text-center text-on-surface">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              confirmState.isAlert ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
            }`}>
              {confirmState.isAlert ? <IconInfoCircle size={32} /> : <IconAlertTriangle size={32} />}
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">{confirmState.title}</h2>
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              {confirmState.message}
            </p>

            <div className="flex justify-center gap-4 w-full">
              {!confirmState.isAlert && confirmState.showCancel !== false && (
                <button
                  type="button"
                  onClick={() => handleCloseConfirm(false)}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-variant transition-colors border border-outline-variant/30"
                >
                  {confirmState.cancelText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCloseConfirm(true)}
                className={`flex-1 py-3 px-6 font-bold rounded-xl transition-colors shadow-sm text-white ${
                  confirmState.confirmClass ? confirmState.confirmClass : (confirmState.isAlert ? 'bg-primary hover:bg-primary/95' : 'bg-red-500 hover:bg-red-600')
                }`}
              >
                {confirmState.confirmText || (confirmState.isAlert ? 'OK' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notifications Stack */}
      <div className="fixed bottom-6 right-6 z-toast flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onClose={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))}
          />
        ))}
      </div>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within a DialogProvider');
  return context;
};
