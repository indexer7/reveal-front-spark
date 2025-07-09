import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-solid",
  {
    variants: {
      variant: {
        default: "border-primary border-t-transparent",
        secondary: "border-muted-foreground border-t-transparent",
        success: "border-success border-t-transparent",
        warning: "border-warning border-t-transparent",
        destructive: "border-destructive border-t-transparent",
      },
      size: {
        sm: "h-4 w-4 border",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(spinnerVariants({ variant, size, className }))}
        ref={ref}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };