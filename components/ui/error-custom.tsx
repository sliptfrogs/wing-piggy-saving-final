import { AlertCircle } from 'lucide-react';

interface ErrorPageProps {
  error?: Error;
  reset?: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen">
      <AlertCircle className="w-10 h-10 text-red-500" />
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-gray-300">
          Oops! Something went wrong
        </p>
        <p className="text-xs text-gray-500">
          {error?.message ||
            'Failed to load the requested data. Please try again.'}
        </p>
      </div>
      <button
        onClick={handleRetry}
        className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Try again
      </button>
    </div>
  );
}
