import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="rounded-full bg-red-50 p-4 text-red-600">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">You don't have access to this page</h1>
        <p className="text-sm text-slate-500">Your account role doesn't include this section.</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 h-10 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
