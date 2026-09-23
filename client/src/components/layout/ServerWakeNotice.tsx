import { useEffect, useState } from 'react';
import { useServerHealth } from '../../hooks/useAuth';
import { Spinner } from '../ui/Spinner';

const SHOW_AFTER_MS = 2500;

// Free hosting puts the API to sleep when idle and the first request can take
// a minute. Only shown if the health check is slow, so it never flashes.
export function ServerWakeNotice() {
  const { isPending } = useServerHealth();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isPending || !slow) return null;

  return (
    <div
      role="status"
      className="mb-4 flex w-full max-w-sm items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      <Spinner className="mt-0.5 h-4 w-4 shrink-0 border-amber-300 border-t-amber-600" />
      <p>The server is starting up. This can take up to a minute, you can keep filling in the form.</p>
    </div>
  );
}
