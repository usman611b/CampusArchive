import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, duration = 4500 }: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newToast: ToastMessage = { id, type, title, message, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 active toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}

      {/* Floating In-App Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          let borderClass = 'border-emerald-500/40 bg-slate-900/95 dark:bg-zinc-900/95 text-white shadow-emerald-500/10';
          let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

          if (toast.type === 'error') {
            icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            borderClass = 'border-rose-500/40 bg-slate-900/95 dark:bg-zinc-900/95 text-white shadow-rose-500/10';
            badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
          } else if (toast.type === 'warning') {
            icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
            borderClass = 'border-amber-500/40 bg-slate-900/95 dark:bg-zinc-900/95 text-white shadow-amber-500/10';
            badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          } else if (toast.type === 'info') {
            icon = <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />;
            borderClass = 'border-blue-500/40 bg-slate-900/95 dark:bg-zinc-900/95 text-white shadow-blue-500/10';
            badgeBg = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border ${borderClass} shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in space-y-1.5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl border ${badgeBg}`}>
                    {icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white">{toast.title}</h4>
                    {toast.message && (
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium mt-0.5">{toast.message}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
