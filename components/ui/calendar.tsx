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
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => props.month || new Date())
  const [displayYears, setDisplayYears] = React.useState<{
    from: number
    to: number
  }>(
    React.useMemo(() => {
      const currentYear = (props.month || new Date()).getFullYear()
      return {
        from: currentYear - Math.floor(yearRange / 2 - 1),
        to: currentYear + Math.ceil(yearRange / 2),
      }
    }, [yearRange, props.month])
  )

  const { onNextClick, onPrevClick, startMonth, endMonth, month, onMonthChange, ...restProps } = props

  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths

  // Sync internal month with external month prop
  React.useEffect(() => {
    if (month) {
      setInternalMonth(month)
    }
  }, [month])

  // Handle year selection
  const handleYearSelect = (year: number) => {
    const currentMonth = internalMonth
    const newDate = new Date(year, currentMonth.getMonth(), 1)
    
    setInternalMonth(newDate)
    
    if (onMonthChange) {
      onMonthChange(newDate)
    }
    
    setNavView("days")
  }

  // Handle year range navigation
  const handleYearRangeNext = () => {
    setDisplayYears(prev => ({
      from: prev.from + yearRange,
      to: prev.to + yearRange
    }))
  }

  const handleYearRangePrev = () => {
    setDisplayYears(prev => ({
      from: prev.from - yearRange,
      to: prev.to - yearRange
    }))
  }

  // Generate years array for the current range
  const years = React.useMemo(() => {
    const yearArray = []
    for (let year = displayYears.from; year <= displayYears.to; year++) {
      yearArray.push(year)
    }
    return yearArray
  }, [displayYears])

  // Custom year picker component
  const YearPicker = () => (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleYearRangePrev}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {displayYears.from} - {displayYears.to}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleYearRangeNext}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {years.map((year) => (
          <Button
            key={year}
            variant="ghost"
            size="sm"
            onClick={() => handleYearSelect(year)}
            className={cn(
              "h-8 text-sm hover:bg-[#0078d4] hover:text-white transition-colors",
              year === internalMonth.getFullYear() && "bg-[#0078d4] text-white hover:bg-[#0078d4] hover:text-white"
            )}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  )

  if (navView === "years") {
    return (
      <div className={cn("bg-accent rounded-md", className)} style={{ width: "248.8px" }}>
        <YearPicker />
      </div>
    )
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-accent rounded-md", className)}
      style={{
        width: 248.8 * (columnsDisplayed ?? 1) + "px",
      }}
      month={internalMonth}
      onMonthChange={(newMonth) => {
        setInternalMonth(newMonth)
        if (onMonthChange) {
          onMonthChange(newMonth)
        }
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
        day: "p-0 size-7 text-sm flex-1 flex items-center justify-center has-[button]:hover:!bg-accent rounded-md has-[button]:hover:aria-selected:!bg-[#0078d4] has-[button]:hover:text-accent-foreground has-[button]:hover:aria-selected:text-white",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-6 p-0 font-normal text-sm transition-none hover:bg-transparent hover:text-inherit aria-selected:opacity-100 aria-selected:bg-[#0078d4] aria-selected:text-white"
        ),
        selected:
          "bg-[#0078d4] text-white hover:!bg-[#0078d4] hover:!text-white focus:bg-[#0078d4] focus:text-white",
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
      {...restProps}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }