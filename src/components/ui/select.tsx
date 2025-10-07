"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { DropDownIcon } from "@/src/icons/icons";
import { Search, X } from "lucide-react";

import { cn } from "@/src/utils/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

interface SearchableSelectProps {
  children: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

const SearchableSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & SearchableSelectProps
>(({ children, showSearch = false, searchPlaceholder = "Search...", onSearchChange, searchValue, ...props }, ref) => (
  <SelectPrimitive.Root {...props}>
    {children}
  </SelectPrimitive.Root>
));

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { 
    field?: { value?: any }; 
    iconSize?: number; 
  }
>(({ className, children, field, iconSize = 24, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    dir={undefined}
    className={cn(
      "flex h-10 w-full items-center justify-between whitespace-nowrap rounded-full border border-border-grey bg-transparent px-3 py-2 text-sm shadow-none ring-offset-background focus:outline-none focus:ring-0 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      "text-text-primary",
      "[&[data-placeholder]]:text-text-secondary",
      "placeholder:text-text-secondary",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <DropDownIcon width={`${iconSize}`} height={`${iconSize}`} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectValueWithPlaceholder = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> & {
    hasValue?: boolean;
  }
>(({ className, placeholder, hasValue, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn(
      hasValue ? "text-text-primary" : "text-text-secondary",
      className
    )}
    placeholder={
      <span className="text-text-secondary">
        {placeholder}
      </span>
    }
    {...props}
  />
));
SelectValueWithPlaceholder.displayName = "SelectValueWithPlaceholder";

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ 
  className, 
  children, 
  position = "popper", 
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearchChange,
  searchValue = "",
  ...props 
}, ref) => {
  const [internalSearchValue, setInternalSearchValue] = React.useState(searchValue);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalSearchValue(value);
    onSearchChange?.(value);
  };

  const clearSearch = () => {
    setInternalSearchValue("");
    onSearchChange?.("");
    searchInputRef.current?.focus();
  };

  React.useEffect(() => {
    if (showSearch && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSearch]);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        dir={undefined}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border-none bg-accent text-text-primary shadow-dropdown data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        {showSearch && (
          <div className="sticky top-0 z-10 bg-accent p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={internalSearchValue}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-8 py-2 text-sm bg-transparent border border-border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
              />
              {internalSearchValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
        
        <SelectPrimitive.Viewport
          className={cn(
            "max-h-52 overflow-y-auto scrollbar-hide",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-bold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "flex w-full cursor-default select-none items-center font-medium text-sm p-3 hover:bg-backdrop hover:text-primary outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[state=checked]:text-primary",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SearchableSelect,
  SelectGroup,
  SelectValue,
  SelectValueWithPlaceholder,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};