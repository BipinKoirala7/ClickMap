"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const retry = () => {
    startTransition(() => {
      router.refresh(); // re-runs the server components (and getUser)
      reset(); // clears the error state
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        We couldn&apos;t reach the server. Please try again.
      </p>
      <button onClick={retry} className="rounded border px-4 py-2">
        Try again
      </button>
    </div>
  );
}
