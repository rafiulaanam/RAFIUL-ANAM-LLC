'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <div className="flex space-x-4">
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
          Go Home
        </Button>
        <Button onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
} 