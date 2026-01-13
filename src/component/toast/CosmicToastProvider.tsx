import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import CosmicToast from "./CosmicToast";

type ToastType = "success" | "error" | "info";

interface ToastData {
  title?: string;
  message: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (data: string | ToastData, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useCosmicToast = () => useContext(ToastContext);

export function CosmicToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    title?: string;
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (
    data: string | ToastData,
    type: ToastType = "info"
  ) => {
    if (typeof data === "string") {
      setToast({ message: data, type });
    } else {
      setToast({
        title: data.title,
        message: data.message,
        type: data.type || type,
      });
    }
  };

  useEffect(() => {
    const data = sessionStorage.getItem("queuedToast");
    if (data) {
      const { msg, type } = JSON.parse(data);
      showToast(msg, type);
      sessionStorage.removeItem("queuedToast");
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <CosmicToast
          {...(toast.title ? { title: toast.title } : {})}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}
