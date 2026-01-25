import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  size?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-[var(--control-h-sm)] px-[var(--control-px-sm)] text-[length:var(--control-text-sm)] rounded-md",
      md: "h-[var(--control-h-md)] px-[var(--control-px-md)] text-[length:var(--control-text-md)] rounded-lg",
      lg: "h-[var(--control-h-lg)] px-[var(--control-px-lg)] text-[length:var(--control-text-lg)] rounded-xl",
    };

    return (
      <input
        className={cn(
          "flex w-full border border-white/10 bg-white/5 text-white ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-purple-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 focus-visible:border-fuchsia-500/50 focus-visible:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 backdrop-blur-md shadow-inner",
          sizeClasses[size],
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
