import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "accent" | "destructive" | "ghost" | "link" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants = ({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) => {
  const variants = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 border-0 shadow-sm",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
    accent: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-100",
    outline:
      "bg-transparent border border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50",
    link: "text-purple-600 hover:underline underline-offset-4 bg-transparent p-0 h-auto",
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
