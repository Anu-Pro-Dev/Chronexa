import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-100",
        success:
          "bg-success text-white hover:bg-success-100",
        destructive:
          "bg-destructive text-white hover:bg-destructive-100",
        outline:
          "border bg-transparent hover:bg-accent hover:text-accent-foreground text-border-grey border-border-grey",
        secondary:
          "bg-text-secondary text-white hover:bg-text-secondary/80",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-[#0078D4] to-[#003E6E] text-white",
        primaryoutline: `bg-[#F1F8FD] text-primary border border-[#C1DEF5] shadow-button`,
        outlineGrey: "border hover:bg-accent hover:text-accent-foreground text-border-grey"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs font-bold",
        lg: "h-10 rounded-full px-8",
        icon: "h-9 w-9",
        pagination: "h-6 w-6 rounded-md text-sm font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
