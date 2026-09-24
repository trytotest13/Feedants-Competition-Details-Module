import { useEffect, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function compute(endsAt: string): CountdownParts {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

/**
 * Live countdown anchored to a server-provided ISO timestamp. Ticks locally
 * every second; the server value is re-fetched on focus so the anchor stays
 * honest across sleep/resume.
 */
export function useCountdown(endsAt: string | null | undefined): CountdownParts | null {
  const [parts, setParts] = useState<CountdownParts | null>(
    endsAt ? compute(endsAt) : null,
  );

  useEffect(() => {
    if (!endsAt) {
      setParts(null);
      return;
    }
    setParts(compute(endsAt));
    const id = setInterval(() => setParts(compute(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return parts;
}
