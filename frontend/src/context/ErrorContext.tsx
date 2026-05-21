import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { reportError } from "@/services/errorReporter";

type ErrorContextType = {
  handleError: (error: unknown, source: string, metadata?: Record<string, unknown>) => void;
};

const ErrorContext = createContext<ErrorContextType | null>(null);

type ErrorProviderProps = {
  children: ReactNode;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Une erreur inattendue est survenue.";
};

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const handleError = useCallback(
    (error: unknown, source: string, metadata?: Record<string, unknown>) => {
      const message = getErrorMessage(error);

      toast.error("Une erreur est survenue", {
        description: message,
      });

      reportError({
        source,
        message,
        stack: error instanceof Error ? error.stack : undefined,
        metadata,
      });
    },
    [],
  );

  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, "window.unhandledrejection");
    };

    const onGlobalError = (event: ErrorEvent) => {
      handleError(event.error ?? event.message, "window.error", {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onGlobalError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onGlobalError);
    };
  }, [handleError]);

  return <ErrorContext.Provider value={{ handleError }}>{children}</ErrorContext.Provider>;
};

export const useGlobalError = () => {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error("useGlobalError must be used within ErrorProvider");
  }

  return context;
};
