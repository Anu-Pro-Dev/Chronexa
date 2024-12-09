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
        p-3 flex flex-col gap-1
        ${index !== 2 && index !== 5 ? "border-r" : ""}
        ${index !== 3 && index !== 4 && index !== 5 ? "border-b" : ""}
      `}
            key={index}
          >
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
