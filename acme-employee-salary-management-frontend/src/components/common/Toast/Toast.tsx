import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const bgColor = isSuccess ? '#014d43' : isError ? '#cf2e2e' : '#1e293b';

  return (
    <div
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: '8px',
        backgroundColor: bgColor,
        color: '#ffffff',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isSuccess && <CheckCircle2 size={18} color="#d3fe73" />}
        {isError && <AlertCircle size={18} color="#ffffff" />}
        {!isSuccess && !isError && <Info size={18} color="#38bdf8" />}
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          opacity: 0.8,
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
