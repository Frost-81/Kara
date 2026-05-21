import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export function LoadingSpinner({ label = "Chargement...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center gap-2 text-slate-600 ${className}`.trim()}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
