import React, { useEffect, useState } from "react";
import { Calendar } from "@/src/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { CalendarIcon, FaChevronUpIcon, FaChevronDownIcon } from "@/src/icons/icons";

const CurrentDate: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<DateRange>({
    from: new Date(),
  }); 
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  useEffect(() => {
    setCurrentDate({ from: new Date() });
  }, []);

  const formattedDate = currentDate.from
  ? currentDate.from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  : "Select Date";

  const toggleCalendar = () => setShowCalendar((prev) => !prev);

  return (
    <div className="flex justify-center items-center bg-accent rounded-md px-2">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <div 
            className="flex justify-center items-center gap-2" 
          >
            <div className="w-7 h-7 bg-backdrop rounded-full flex justify-center items-center"><CalendarIcon className="w-4 h-4" /></div> {/* Calendar Icon */}
            <p className="text-sm text-text-primary font-semibold">
              {formattedDate}
            </p>
          
            {/* {false && showCalendar ? (
              <FaChevronUpIcon className="w-4 h-4 text-text-primary" />
            ) : (
              <FaChevronDownIcon className="w-4 h-4 text-text-primary" />
            )} */}
          </div>
        </div>

        {showCalendar && (
          <div className="absolute mt-2 bg-accent shadow-lg rounded-lg z-50">
            <Calendar
            mode="single"
            selected={currentDate.from}
            onSelect={(date) => {
              if (date) {
                setCurrentDate({ from: date });
                setShowCalendar(false);
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
