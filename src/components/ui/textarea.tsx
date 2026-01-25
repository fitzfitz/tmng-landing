import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  size?: "sm" | "md" | "lg";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "p-[var(--control-px-sm)] text-[length:var(--control-text-sm)] rounded-md",
      md: "p-[var(--control-px-md)] text-[length:var(--control-text-md)] rounded-lg",
      lg: "p-[var(--control-px-lg)] text-[length:var(--control-text-lg)] rounded-xl",
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full border border-white/10 bg-white/5 text-white ring-offset-transparent placeholder:text-purple-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 focus-visible:border-fuchsia-500/50 focus-visible:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 resize-y backdrop-blur-md shadow-inner",
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
Textarea.displayName = "Textarea";

export { Textarea };
