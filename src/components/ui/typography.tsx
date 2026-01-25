import React from "react";
import { cn } from "@/lib/utils";

type TypographyVariant = 
  | "h1" 
  | "h2" 
  | "h3" 
  | "h4" 
  | "body" 
  | "body-sm" 
  | "caption" 
  | "lead" 
  | "mono";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
}

const variants: Record<TypographyVariant, string> = {
  h1: "typography-h1",
  h2: "typography-h2",
  h3: "typography-h3",
  h4: "typography-h4",
  lead: "typography-lead",
  body: "typography-body",
  "body-sm": "typography-body-sm",
  caption: "typography-caption",
  mono: "typography-mono"
};

const tagMap: Record<TypographyVariant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  lead: "p",
  body: "p",
  "body-sm": "p",
  caption: "span",
  mono: "code"
};

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "body", as, children, ...props }, ref) => {
    const Component = as || tagMap[variant] || "div";
    return (
      <Component 
        ref={ref} 
        className={cn(variants[variant], className)} 
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Typography.displayName = "Typography";

export { Typography };
