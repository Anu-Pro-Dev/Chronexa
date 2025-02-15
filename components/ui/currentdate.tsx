import React, { useEffect, useState } from "react";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"; // Import the necessary icons
import { Calendar } from "@/components/ui/calendar"; // Import your existing Calendar component
import { cn } from "@/lib/utils"; // Assuming you're using utility classes

const CurrentDate: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false); // State to control calendar visibility

  useEffect(() => {
    // Update the current date when the component mounts
    setCurrentDate(new Date());
  }, []);

  // Format the date
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "short", // e.g., "Feb"
    day: "numeric", // e.g., "9"
    year: "numeric", // e.g., "2025"
  });

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
            <Calendar />
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentDate;
