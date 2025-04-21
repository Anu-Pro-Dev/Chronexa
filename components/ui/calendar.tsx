"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { differenceInCalendarDays } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import {
  DayPicker,
  labelNext,
  labelPrevious,
  useDayPicker,
  type DayPickerProps,
} from "react-day-picker"

export type CalendarProps = DayPickerProps & {
  yearRange?: number
}

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  yearRange = 12,
  numberOfMonths,
  ...props
}: CalendarProps) {
  const [navView, setNavView] = React.useState<"days" | "years">("days")
  const [displayYears, setDisplayYears] = React.useState<{
    from: number
    to: number
  }>(
    React.useMemo(() => {
      const currentYear = new Date().getFullYear()
      return {
        from: currentYear - Math.floor(yearRange / 2 - 1),
        to: currentYear + Math.ceil(yearRange / 2),
      }
    }, [yearRange])
  )

  const { onNextClick, onPrevClick, startMonth, endMonth } = props

  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-accent rounded-md", className)}
      style={{
        width: 248.8 * (columnsDisplayed ?? 1) + "px",
      }}
      classNames={{
        months: "flex flex-col relative",
        month_caption: "flex justify-center h-7 mx-10 relative items-center",
        weekdays: "flex flex-row",
        weekday: "text-text-secondary w-8 font-normal text-[0.8rem]",
        month: "gap-y-4 overflow-x-hidden w-full",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium truncate",
        button_next: cn(
          buttonVariants({
            variant: "outline",
            className:
              "absolute right-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          })
        ),
        button_previous: cn(
          buttonVariants({
            variant: "outline",
            className:
              "absolute left-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          })
        ),
        nav: "flex items-start",
        month_grid: "mt-4",
        week: "flex w-full mt-2",
        day: "p-0 size-7 text-sm flex-1 flex items-center justify-center has-[button]:hover:!bg-accent rounded-md has-[button]:hover:aria-selected:!bg-primary has-[button]:hover:text-accent-foreground has-[button]:hover:aria-selected:text-primary-foreground",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-6 p-0 font-normal text-sm transition-none hover:bg-transparent hover:text-inherit aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-accent hover:!bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-backdrop text-text-primary",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
        CaptionLabel: ({ children }) => (
          <Button
            className="h-7 w-full truncate text-sm font-medium"
            variant="ghost"
            size="sm"
            onClick={() =>
              setNavView((prev) => (prev === "days" ? "years" : "days"))
            }
          >
            {navView === "days"
              ? children
              : displayYears.from + " - " + displayYears.to}
          </Button>
        ),
      }}
      numberOfMonths={columnsDisplayed}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
