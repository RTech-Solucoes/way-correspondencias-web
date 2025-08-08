'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, max, indicatorClassName, ...props }, ref) => {
  // Validate max prop
  if (max !== undefined && (typeof max !== 'number' || max <= 0)) {
    console.error("Invalid prop max of value", max, "supplied to Progress. Only numbers greater than 0 are valid max values. Defaulting to 100.");
    max = 100;
  }
  
  const maxValue = max ?? 100;
  
  // Validate value prop
  if (value !== undefined && value !== null && (typeof value !== 'number' || value < 0 || value > maxValue)) {
    console.error("Invalid prop value of value", value, "supplied to Progress. The value prop must be a number between 0 and", maxValue, ". Defaulting to 0.");
    value = 0;
  }
  
  const progressValue = value ?? 0;
  const percentage = (progressValue / maxValue) * 100;
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      value={progressValue}
      max={maxValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          indicatorClassName
        )}
        style={{ transform: "translateX(-" + (100 - percentage) + "%)" }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
