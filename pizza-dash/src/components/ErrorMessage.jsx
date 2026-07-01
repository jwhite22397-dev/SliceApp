import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
      <div className="text-7xl">😿</div>
      <div className="text-center max-w-md">
        <h3 className="font-display font-bold text-2xl text-gray-800 mb-2">
          Oops! No pizza found
        </h3>
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 
                        rounded-xl px-4 py-3 text-red-700 text-sm text-left">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}

      <p className="text-sm text-gray-400 text-center max-w-sm">
        Make sure location permissions are enabled in your browser, 
        or try searching in a different area.
      </p>
    </div>
  );
}
