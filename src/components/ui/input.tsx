import * as React from "react"

import { cn } from "@/src/lib/utils";

const   Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-w-[350px] 3xl:max-w-[450px]",
          "file:text-primary file:bg-[#F1F8FD] file:appearance-none file:border file:border-[#C1DEF5] file:px-2 file:py-1 file:rounded-[5px] file:border-solid file:font-xs file:cursor-pointer file:shadow-button file:outline-none",
          className
        )}
        ref={ref}
        {...props}
        autoComplete="off"
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
