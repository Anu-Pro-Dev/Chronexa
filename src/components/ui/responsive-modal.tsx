"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/utils/utils";
import { useLanguage } from "@/src/providers/LanguageProvider";

const ResponsiveModal = DialogPrimitive.Root;

const ResponsiveModalTrigger = DialogPrimitive.Trigger;

const ResponsiveModalClose = DialogPrimitive.Close;

const ResponsiveModalPortal = DialogPrimitive.Portal;

const ResponsiveModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-accent/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
ResponsiveModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ResponsiveModalVariants = cva(
  cn(
    "fixed z-50 bg-accent p-6 shadow-popup rounded-[20px] transition ease-in-out",
    "flex flex-col gap-5",
    "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "w-full mx-auto max-h-[90vh]",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[state=closed]:duration-300 data-[state=open]:duration-500"
  ),
  {
    variants: {
      size: {
        small: "w-10/12 max-w-[200px] sm:w-[200px]",
        medium: "w-10/12 max-w-[400px] sm:w-[400px]",
        large: "w-10/12 max-w-[600px] sm:w-[600px]",
        extraLarge: "w-10/12 max-w-[800px] sm:w-[800px]",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

interface ResponsiveModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof ResponsiveModalVariants> {}

const ResponsiveModalContent = React.forwardRef<
React.ElementRef<typeof DialogPrimitive.Content>,
ResponsiveModalContentProps
>(({ size, className, children, ...props }, ref) => {
  const modalClasses = cn(
    ResponsiveModalVariants({ size }),
    className
  );

  return (
    <ResponsiveModalPortal>
      <ResponsiveModalOverlay />
      <DialogPrimitive.Content ref={ref} className={modalClasses} {...props}>
        <div className="max-h-[80vh] overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </DialogPrimitive.Content>
    </ResponsiveModalPortal>
  );
});

ResponsiveModalContent.displayName = "ResponsiveModalContent";
  
const ResponsiveModalHeader = ({
  className,
  dir,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col text-center gap-5",
      className
    )}
    {...props}
  />
);
ResponsiveModalHeader.displayName = "ResponsiveModalHeader";

const ResponsiveModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
ResponsiveModalFooter.displayName = "ResponsiveModalFooter";

const ResponsiveModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-base font-bold text-text-primary uppercase", className)}
    {...props}
  />
));
ResponsiveModalTitle.displayName = DialogPrimitive.Title.displayName;

const ResponsiveModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm font-semibold text-text-secondary", className)}
    {...props}
  />
));
ResponsiveModalDescription.displayName =
  DialogPrimitive.Description.displayName;

export {
  ResponsiveModal,
  ResponsiveModalPortal,
  ResponsiveModalOverlay,
  ResponsiveModalTrigger,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
};