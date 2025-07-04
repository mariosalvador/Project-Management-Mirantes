import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "info", isVisible, onClose, duration = 5000 }: ToastProps) {
  // Auto-close after duration
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-300 dark:border-green-800";
      case "error":
        return "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/10 dark:text-red-300 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-300 dark:border-yellow-800";
      default:
        return "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm",
        "animate-in slide-in-from-top-2 duration-300",
        getColorClasses()
      )}>
        {getIcon()}
        <span className="font-medium">{message}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 ml-2 hover:bg-black/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Hook para usar o toast
export function useToast() {
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
}
