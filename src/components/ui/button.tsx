import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "accent" | "destructive" | "ghost" | "link" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants = ({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) => {
  const variants = {
    primary: "bg-linear-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_20px_-5px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.7)] hover:scale-105 border-0",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10",
    accent: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm shadow-accent/20",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
    ghost: "bg-transparent text-purple-200 hover:text-white hover:bg-white/5",
    outline: "bg-transparent border border-white/20 text-white hover:border-fuchsia-500 hover:text-fuchsia-400 hover:bg-fuchsia-500/10",
    link: "text-primary hover:underline underline-offset-4 bg-transparent p-0 h-auto"
  };

  const sizes = {
    sm: "h-[var(--control-h-sm)] px-[var(--control-px-sm)] text-[length:var(--control-text-sm)] rounded-md",
    md: "h-[var(--control-h-md)] px-[var(--control-px-md)] text-[length:var(--control-text-md)] rounded-lg",
    lg: "h-[var(--control-h-lg)] px-[var(--control-px-lg)] text-[length:var(--control-text-lg)] rounded-xl",
    icon: "h-[var(--control-h-md)] w-[var(--control-h-md)] p-2 rounded-lg"
  };

  return cn(
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className
  );
};

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: "button" | "a";
  children?: React.ReactNode;
};

type ButtonProps = ButtonBaseProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" })
  );

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, size, as = "button", ...props }, ref) => {
    const Component = as;
    
    return (
      <Component
        // @ts-expect-error - Polymorphic refs are tricky
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps, ButtonVariant, ButtonSize };
