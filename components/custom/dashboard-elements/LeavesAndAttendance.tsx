import { Button } from "@/components/ui/button";
import { BsArrowRightShort } from "react-icons/bs";
import React from "react";

export default function LeavesAndAttendance({ data }: { data: any }) {
  return (
    <div className="bg-white p-5">
      <div className="flex flex-row gap-2 items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <h1 className="font-bold">Leaves and Attendance</h1>
          <div className="flex items-center  ">
            <span className="text-primary">Apply Leave</span>
            <div className="text-primary">
              <BsArrowRightShort size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {data?.map((item: any, index: number) => (
          <div
            className={`
        p-3 flex flex-col gap-1 relative 
    
      `}
            key={index}
          >
            {(index === 0 || index === 1 || index === 2) && (
              <div className="absolute right-0 mx-auto bottom-0 left-0 w-4/12 border-b"></div>
            )}

            {(index === 0 || index === 1 || index === 3 || index === 4) && (
              <div className="absolute right-0 top-0 mx-auto bottom-0 w-2  border-r h-10 flex flex-col my-auto"></div>
            )}
            <div className="flex items-center justify-between">
              <h1 className="break-words">{item?.label}</h1>{" "}
              {/* Use break-words for text wrapping */}
              <span>{item?.icon}</span>
            </div>
            <div className="mb-3">
              <h1 className="text-3xl font-bold">{item?.value}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
