"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ── Types ────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "delete" | "update" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  delete:  (title: string, message?: string) => void;
  update:  (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

// ── Context ──────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Theme config ─────────────────────────────────────────────────
const THEMES: Record<
  ToastType,
  {
    icon: string;
    label: string;
    glow: string;
    bar: string;
    border: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  success: {
    icon: "check_circle",
    label: "SUCCESS",
    glow: "shadow-[0_0_25px_rgba(255,46,46,0.25)]",
    bar: "bg-[#ff2e2e]",
    border: "border-crimson/40",
    iconBg: "bg-crimson/15",
    iconColor: "text-[#ffb4ab]",
  },
  error: {
    icon: "gpp_bad",
    label: "ERROR",
    glow: "shadow-[0_0_25px_rgba(255,46,46,0.35)]",
    bar: "bg-[#ff2e2e]",
    border: "border-[#ff2e2e]/60",
    iconBg: "bg-[#ff2e2e]/20",
    iconColor: "text-[#ffb4ab]",
  },
  warning: {
    icon: "warning",
    label: "ATTENTION",
    glow: "shadow-[0_0_25px_rgba(255,180,171,0.25)]",
    bar: "bg-[#ffb4ab]",
    border: "border-[#ffb4ab]/40",
    iconBg: "bg-[#ffb4ab]/15",
    iconColor: "text-[#ffb4ab]",
  },
  delete: {
    icon: "delete_forever",
    label: "DELETED",
    glow: "shadow-[0_0_25px_rgba(255,46,46,0.3)]",
    bar: "bg-red-700",
    border: "border-red-800/60",
    iconBg: "bg-red-900/40",
    iconColor: "text-red-400",
  },
  update: {
    icon: "edit_note",
    label: "UPDATED",
    glow: "shadow-[0_0_25px_rgba(255,180,171,0.25)]",
    bar: "bg-[#ffb4ab]",
    border: "border-[#ffb4ab]/40",
    iconBg: "bg-[#ffb4ab]/15",
    iconColor: "text-[#ffb4ab]",
  },
  info: {
    icon: "info",
    label: "INFO",
    glow: "shadow-[0_0_25px_rgba(255,180,171,0.2)]",
    bar: "bg-[#ffb4ab]",
    border: "border-[#ffb4ab]/30",
    iconBg: "bg-[#ffb4ab]/10",
    iconColor: "text-[#ffb4ab]",
  },
};

const DEFAULT_DURATION = 3500;

// ── Single Toast Card ────────────────────────────────────────────
function ToastCard({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  const t = THEMES[toast.type];
  const duration = toast.duration ?? DEFAULT_DURATION;
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number>(0);

  // Animated countdown bar
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  return (
    <div
      className={`
        relative w-80 rounded-2xl overflow-hidden
        border ${t.border}
        bg-[#131313]/90 backdrop-blur-xl
        ${t.glow}
        animate-[toastIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_both]
        font-sora
      `}
    >
      {/* Top accent line */}
      <div className={`h-[2px] w-full ${t.bar} opacity-80`} />

      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon bubble */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center mt-0.5`}>
          <span className={`material-symbols-outlined text-[20px] ${t.iconColor}`}>
            {t.icon}
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`font-jetbrains text-[10px] tracking-[0.15em] uppercase mb-0.5 ${t.iconColor}`}>
            {t.label}
          </p>
          <p className="text-sm font-semibold text-white leading-snug">{toast.title}</p>
          {toast.message && (
            <p className="text-[11px] text-white/60 mt-0.5 leading-snug">{toast.message}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors mt-0.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-white/5">
        <div
          className={`h-full ${t.bar} transition-none`}
          style={{ width: `${progress}%`, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (type: ToastType, title: string, message?: string, duration = DEFAULT_DURATION) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (title, msg) => add("success", title, msg),
    error:   (title, msg) => add("error",   title, msg),
    warning: (title, msg) => add("warning", title, msg),
    delete:  (title, msg) => add("delete",  title, msg),
    update:  (title, msg) => add("update",  title, msg),
    info:    (title, msg) => add("info",    title, msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast stack — top-right */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} onClose={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
