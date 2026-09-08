import { AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Suggestion } from "@/types";

interface FeedbackPanelProps {
  suggestions: Suggestion[];
}

export function FeedbackPanel({ suggestions }: FeedbackPanelProps) {
  if (suggestions.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/20">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <p className="text-sm text-green-700 dark:text-green-400">
          No issues found — this is a strong password!
        </p>
      </div>
    );
  }

  // Separate warnings from tips
  const warnings = suggestions.filter((s) => s.type === "warning");
  const tips = suggestions.filter((s) => s.type === "tip");

  return (
    <div className="space-y-4">
      {/* Warnings — things that make the password weak */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Issues Found
          </h4>
          <ul className="space-y-2">
            {warnings.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-400">
                  {s.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips — general advice for improvement */}
      {tips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Suggestions
          </h4>
          <ul className="space-y-2">
            {tips.map((s, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg px-3 py-2",
                  "bg-amber-50 dark:bg-amber-900/20"
                )}
              >
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <span className="text-sm text-amber-700 dark:text-amber-400">
                  {s.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
