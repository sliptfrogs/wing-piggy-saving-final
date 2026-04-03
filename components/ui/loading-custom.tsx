import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4  h-screen">
      <Loader2 className="w-10 h-10 animate-spin  text-primary" />
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-gray-300">Just a moment</p>
        <p className="text-xs text-gray-500">Fetching latest data...</p>
      </div>
    </div>
  );
}
