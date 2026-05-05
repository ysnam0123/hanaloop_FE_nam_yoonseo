'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const TOAST_CONFIG: Record<
  ToastType,
  { bg: string; icon: string; defaultMessage: string }
> = {
  success: { bg: 'bg-green-600', icon: '✅', defaultMessage: '저장되었습니다' },
  error: {
    bg: 'bg-red-500',
    icon: '❌',
    defaultMessage: '오류가 발생했습니다',
  },
  warning: {
    bg: 'bg-yellow-500',
    icon: '⚠️',
    defaultMessage: '확인이 필요합니다',
  },
};

function ToastBubble({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const { bg, icon } = TOAST_CONFIG[toast.type];

  return (
    <div
      className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2.5 text-sm font-medium min-w-55 animate-in slide-in-from-right-4 fade-in duration-200`}
    >
      <span>{icon}</span>
      <span>{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-auto opacity-70 hover:opacity-100 transition-opacity leading-none"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    const defaultMessage = TOAST_CONFIG[type].defaultMessage;
    setToasts((prev) => [
      ...prev,
      { id, type, message: message ?? defaultMessage },
    ]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <ToastBubble
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
