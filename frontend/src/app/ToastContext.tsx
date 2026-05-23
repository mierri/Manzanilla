import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastTone = 'sage' | 'peach' | 'butter' | 'lavender' | 'danger';

export interface ToastItem {
  id: string;
  title: string;
  body?: string;
  tone?: ToastTone;
  hiding?: boolean;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, hiding: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 320);
  }, []);

  const push = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { ...item, id }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const iconMap: Record<ToastTone, ReactNode> = {
    sage: <CheckCircle size={18} color="var(--ok)" />,
    peach: <Info size={18} color="var(--warn)" />,
    butter: <Info size={18} color="#6E5418" />,
    lavender: <Info size={18} color="#4B3B68" />,
    danger: <AlertCircle size={18} color="var(--danger)" />,
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item${t.hiding ? ' hiding' : ''}`}>
            {iconMap[t.tone ?? 'sage']}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>{t.title}</div>
              {t.body && <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{t.body}</div>}
            </div>
            <button className="btn-icon" style={{ width: 26, height: 26, flexShrink: 0 }} onClick={() => dismiss(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
