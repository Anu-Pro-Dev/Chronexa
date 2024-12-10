import Image from "next/image";
import React from "react";

export default function ClockYourHours() {
  return (
    <div className=" p-4 relative ">
      <h1 className="text-center">Clock your Hours</h1>
      <div className="text-center">
        <h1>07 : 30 :24</h1>ing
        <div className="flex justify-center gap-4">
          <div>
            <h1>Remaining</h1>
            <h1>04:26</h1>
          </div>
          <div>
            <h1>Overtime</h1>
            <h1>00:00</h1>
          </div>
          <div>
            <h1>Break Time</h1>
            <h1>00:30</h1>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex">
            <Image
              src={"/icons/right_arrow.svg"}
              width={20}
              height={20}
              alt="right_arrow"
            />
            <h1>07:30 AM</h1>
          </div>
          <div className="flex">
            <Image
              className="rotate-90"
              src={"/icons/right_arrow.svg"}
              width={20}
              height={20}
              alt="right_arrow"
            />
            <h1>--:-- PM</h1>
          </div>
        </div>
      </div>

      {/* <Image
        src={"/bg-future.png"}
        width={400}
        height={100}
        alt="futuristic"
        className="absolute h-[200px] top-0 left-0 right-0 z-40"
      /> */}
    </div>
  );
}
