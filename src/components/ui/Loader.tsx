import { Loader2, Shield } from "lucide-react";

// ─── Full page loader ──────────────────────────────────────────────

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Card skeleton ─────────────────────────────────────────────────

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Stats grid skeleton ───────────────────────────────────────────

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-2" />
          <div className="h-6 w-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Evaluator skeleton ────────────────────────────────────────────

export function EvaluatorSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
          <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
        <div className="mx-auto h-4 w-80 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
      <div className="h-12 w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mb-4" />
      <div className="h-10 w-32 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>
  );
}
