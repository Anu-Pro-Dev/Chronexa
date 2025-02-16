import React, { useEffect, useState } from "react";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"; // Import the necessary icons
import { Calendar } from "@/components/ui/calendar"; // Import your existing Calendar component
import { cn } from "@/lib/utils"; // Assuming you're using utility classes
import { DateRange } from "react-day-picker";

const CurrentDate: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<DateRange>({
    from: new Date(),
  }); 
  const [showCalendar, setShowCalendar] = useState<boolean>(false); // State to control calendar visibility

  useEffect(() => {
    setCurrentDate({ from: new Date() }); // Initialize selected date
  }, []);

  // Format the date
  const formattedDate = currentDate.from
  ? currentDate.from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  : "Select Date"; // Fallback text if no date is selected

  // Toggle for showing/hiding the calendar
  const toggleCalendar = () => setShowCalendar((prev) => !prev);

  return (
    <div className="flex justify-center items-center ">
      <div className="text-center">
        {/* Displaying calendar icon, current date, and chevron in a row */}
        <div className="flex items-center justify-center gap-1">
          <CalendarIcon className="w-4 h-5 text-sky-500" /> {/* Calendar Icon */}
          <p className="text-sm">
            {formattedDate}
          </p>

          {/* Chevron icon to toggle calendar visibility */}
          <div 
            className="cursor-pointer" 
            onClick={toggleCalendar}
          >
            {showCalendar ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Conditionally render the Calendar component */}
        {showCalendar && (
          <div className="absolute mt-2 bg-white shadow-lg rounded-lg z-50">
            <Calendar
            mode="single" // Ensure single date selection mode
            selected={currentDate.from} // Pass the selected date
            onSelect={(date) => {
              if (date) {
                setCurrentDate({ from: date }); // Update selected date
                setShowCalendar(false); // Close the calendar after selection
              }
            }}
          />
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentDate;
