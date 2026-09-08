import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeColor = "gray" | "red" | "amber" | "green" | "blue" | "purple";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colors: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function Badge({ color = "gray", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Helper to map strength level to badge color
export function strengthToColor(level: string): BadgeColor {
  switch (level) {
    case "Weak":
      return "red";
    case "Medium":
      return "amber";
    case "Strong":
      return "green";
    case "Very Strong":
      return "green";
    default:
      return "gray";
  }
}
