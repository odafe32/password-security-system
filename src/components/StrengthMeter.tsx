import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrengthLevel } from "@/types";

interface StrengthMeterProps {
  score: number;
  level: StrengthLevel;
  showLabel?: boolean;
}

const levelConfig: Record<
  StrengthLevel,
  { color: string; bgColor: string; textColor: string; icon: typeof Shield }
> = {
  Weak: {
    color: "bg-strength-weak",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-strength-weak",
    icon: ShieldAlert,
  },
  Medium: {
    color: "bg-strength-medium",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-strength-medium",
    icon: ShieldAlert,
  },
  Strong: {
    color: "bg-strength-strong",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-strength-strong",
    icon: ShieldCheck,
  },
  "Very Strong": {
    color: "bg-strength-verystrong",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-strength-verystrong",
    icon: ShieldCheck,
  },
};

export function StrengthMeter({ score, level, showLabel = true }: StrengthMeterProps) {
  const config = levelConfig[level];
  const Icon = config.icon;
  const segments = 4;
  const filledSegments = Math.ceil((score / 100) * segments);

  return (
    <div className="space-y-3">
      {/* Score bar — 4 segments */}
      <div className="flex gap-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-300",
              i < filledSegments ? config.color : "bg-gray-200 dark:bg-gray-800"
            )}
          />
        ))}
      </div>

      {/* Label + score */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5",
              config.bgColor
            )}
          >
            <Icon className={cn("h-5 w-5", config.textColor)} />
            <span className={cn("font-semibold", config.textColor)}>
              {level}
            </span>
          </div>
          <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {score}
            <span className="text-sm font-normal text-gray-400">/100</span>
          </span>
        </div>
      )}
    </div>
  );
}
