import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
  indeterminate?: boolean;
}

function Progress({
  value = 0,
  indeterminate = false,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full bg-accent transition-[width] duration-300 ease-out",
          indeterminate && "w-1/3 animate-[progress-indeterminate_1.2s_ease-in-out_infinite]",
        )}
        style={indeterminate ? undefined : { width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };
