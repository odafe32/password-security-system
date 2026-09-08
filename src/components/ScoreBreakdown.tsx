import { Check, X, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HybridEvaluationResult } from "@/lib/password-engine";

interface ScoreBreakdownProps {
  result: HybridEvaluationResult;
}

export function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      {/* Rule checks */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Rule Checks
        </h4>
        <ul className="space-y-1.5">
          {result.checks.map((check) => (
            <li
              key={check.rule}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {check.passed ? (
                  <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                ) : (
                  <X className="h-4 w-4 flex-shrink-0 text-red-500" />
                )}
                <span
                  className={cn(
                    check.passed
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {check.label}
                </span>
              </div>
              <span className="text-xs tabular-nums text-gray-400">
                {check.points}/{check.maxPoints}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800" />

      {/* ML Neural Network prediction */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          <Brain className="h-4 w-4 text-purple-600" />
          AI Neural Network Prediction
        </h4>

        {/* ML class + confidence */}
        <div className="flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-900/20">
          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
            {result.ml.className}
          </span>
          <span className="text-xs tabular-nums text-purple-600 dark:text-purple-400">
            {(result.ml.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>

        {/* Probability bars */}
        <div className="space-y-1.5">
          {["Weak", "Medium", "Strong"].map((cls, i) => {
            const prob = result.ml.probabilities[i] || 0;
            const colors = ["bg-red-400", "bg-amber-400", "bg-green-400"];
            return (
              <div key={cls} className="flex items-center gap-2">
                <span className="w-14 text-xs text-gray-500">{cls}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", colors[i])}
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-gray-400">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800" />

      {/* Scoring breakdown */}
      <div className="space-y-1.5 text-xs">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Scoring Breakdown
        </h4>
        <div className="flex justify-between text-gray-500">
          <span>Rule-based score</span>
          <span className="tabular-nums">{result.scoring.ruleScore}/100</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>ML neural network score</span>
          <span className="tabular-nums">{result.scoring.mlScore}/100</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Entropy</span>
          <span className="tabular-nums">{result.entropy} bits</span>
        </div>
        <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300">
          <span>Method</span>
          <span className="text-right text-xs">{result.scoring.method}</span>
        </div>
      </div>
    </div>
  );
}
