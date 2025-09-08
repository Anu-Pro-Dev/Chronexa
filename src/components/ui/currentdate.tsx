import React, { useEffect, useState } from "react";
import { Calendar } from "@/src/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { CalendarIcon, FaChevronUpIcon, FaChevronDownIcon } from "@/src/icons/icons";

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
    <div className="flex justify-center items-center bg-accent rounded-md px-2">
      <div className="text-center">
        {/* Displaying calendar icon, current date, and chevron in a row */}
        <div className="flex items-center justify-center gap-1">
          <div 
            className="cursor-pointer flex justify-center items-center gap-2" 
            onClick={toggleCalendar}
          >
            <div className="w-7 h-7 bg-backdrop rounded-full flex justify-center items-center"><CalendarIcon className="w-4 h-4" /></div> {/* Calendar Icon */}
            <p className="text-sm text-text-primary font-semibold">
              {formattedDate}
            </p>
          
            {showCalendar ? (
              <FaChevronUpIcon className="w-4 h-4 text-text-primary" />
            ) : (
              <FaChevronDownIcon className="w-4 h-4 text-text-primary" />
            )}
          </div>
        </div>

        {/* Conditionally render the Calendar component */}
        {showCalendar && (
          <div className="absolute mt-2 bg-accent shadow-lg rounded-lg z-50">
            <Calendar
            mode="single" // Ensure single date selection mode
            selected={currentDate.from} // Pass the selected date
            onSelect={(date) => {
              if (date) {
                setCurrentDate({ from: date }); // Update selected date
                setShowCalendar(false); // Close the calendar after selection
              }
            }}
            disabled={{ after: new Date() }}
          />
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentDate;
