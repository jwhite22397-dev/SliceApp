import { AlertCircle, Pizza } from "lucide-react";

interface EmptyStateProps {
  message: string;
  onRetry: () => void;
}

export function EmptyState({ message, onRetry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-slice-charcoal/10 bg-white px-8 py-16 text-center">
      <div className="mb-4 text-6xl opacity-50">🍕</div>
      <h3 className="font-display text-xl font-bold text-slice-charcoal">
        No pizza found nearby
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slice-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slice-red px-6 py-3 font-bold text-white transition hover:bg-slice-red-dark"
      >
        <Pizza className="h-4 w-4" />
        Try a wider search
      </button>
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slice-red/20 bg-slice-red/5 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slice-red" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slice-charcoal">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-bold text-slice-red hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white px-8 py-16 text-center shadow-sm">
      <div className="relative mb-6">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slice-cheese/30 border-t-slice-red" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">
          🍕
        </span>
      </div>
      <p className="font-semibold text-slice-charcoal">{message}</p>
      <p className="mt-1 text-sm text-slice-muted">Scanning pizzerias in your area...</p>
    </div>
  );
}
