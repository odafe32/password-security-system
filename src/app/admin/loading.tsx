import { StatsSkeleton, CardSkeleton } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="p-4 sm:px-6 sm:py-8">
      <div className="h-7 w-48 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-6" />
      <StatsSkeleton />
      <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
