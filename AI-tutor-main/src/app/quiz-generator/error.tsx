'use client';

import { useEffect } from 'react';

export default function QuizGeneratorError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {

  useEffect(() => {
    console.error(
      'Quiz Generator Error:',
      error
    );
  }, [error]);


  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">

      <div className="w-full max-w-md rounded-xl border p-6 text-center">

        <h2 className="text-xl font-semibold">
          Quiz Generator
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while loading the quiz.
        </p>

        <button
          onClick={() => reset()}
          className="mt-5 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Try Again
        </button>

      </div>

    </div>
  );
}
