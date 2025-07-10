"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";

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
    "fixed z-50 gap-4 bg-accent p-6 shadow-popup rounded-[20px] transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 overflow-y-auto scrollbar-hide",
    "md:grid md:w-full md:border md:duration-200 md:data-[state=open]:animate-in md:data-[state=closed]:animate-out md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0 md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95 md:data-[state=closed]:slide-out-to-top-[48%] md:data-[state=open]:slide-in-from-top-[48%] md:rounded-[20px]"
  ),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b rounded-b-xl max-h-[90%] md:h-fit data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t md:h-fit max-h-[90%] rounded-t-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full md:h-fit w-3/4 border-r rounded-r-xl data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full md:h-fit w-3/4 border-l rounded-l-xl data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      size: {
        small: "max-w-[200px]",
        medium: "max-w-[400px]",
        large: "max-w-[600px]",
        extraLarge: "max-w-[800px]",
      },
    },
    defaultVariants: {
      side: "bottom",
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
>(({ side = "bottom", size, className, children, ...props }, ref) => {
  const { language } = useLanguage();

  const rtlModalPosition = "md:right-[50%] md:top-[50%] md:translate-x-[50%] md:translate-y-[-50%] md:data-[state=closed]:slide-out-to-right-1/2 md:data-[state=open]:slide-in-from-right-1/2";
  const ltrModalPosition = "md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:data-[state=closed]:slide-out-to-left-1/2 md:data-[state=open]:slide-in-from-left-1/2";
  const modalPositionClass = language === "ar" ? rtlModalPosition : ltrModalPosition;

  const modalClasses = cn(ResponsiveModalVariants({ side, size }), modalPositionClass, className);

  return (
    <ResponsiveModalPortal>
      <ResponsiveModalOverlay />
      <DialogPrimitive.Content ref={ref} className={modalClasses} {...props}>
        {children}
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
      "flex flex-col text-center",
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
    className={cn("text-xl font-bold text-text-primary", className)}
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
