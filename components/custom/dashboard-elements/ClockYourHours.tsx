import Image from "next/image";
import React from "react";

export default function ClockYourHours() {
  return (
    <div className=" p-4 bg-[url(/bg-future.png)] rounded-md shadow-sm w-full bg-auto bg-no-repeat">
      <div className="text-center">
        <h1 className="text-primary-50">Clock your Hours</h1>
        <h1 className="text-5xl text-primary-50">07 : 30 :24</h1>
        <div className="flex justify-around gap-4">
          <div className="backdrop-blur-md  px-2 py-1 rounded-md">
            <h1 className="text-primary-50">Remaining</h1>
            <h1 className="text-primary-50">04:26</h1>
          </div>
          <div className="backdrop-blur-md  px-2 py-1 rounded-md">
            <h1 className="text-primary-50">Overtime</h1>
            <h1 className="text-primary-50">00:00</h1>
          </div>
          <div className="backdrop-blur-md  px-2 py-1 rounded-md">
            <h1 className="text-primary-50">Break Time</h1>
            <h1 className="text-primary-50">00:30</h1>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex gap-1">
            <Image
              src={"/icons/right_arrow.svg"}
              width={20}
              height={20}
              alt="right_arrow"
            />
            <h1 className="text-primary-50">07:30 AM</h1>
          </div>
          <div className="flex gap-1">
            <Image
              className="rotate-180"
              src={"/icons/right_arrow.svg"}
              width={20}
              height={20}
              alt="right_arrow"
            />
            <h1 className="text-primary-50">--:-- PM</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
