import { Card } from "@/components/ui/card";
import { CalendarDaysIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Violations() {
  return (
    <div className="w-full bg-white ">
      <h1 className="text-xl font-bold text-center my-4">Violations</h1>

      <div className="flex justify-between  w-full">
        <div className=" flex justify-center items-center p-3">
          <button className=" p-2 rounded-full bg-white shadow-lg">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 w-full px-2">
          {/* Missed In Card */}
          <Card className="p-6 bg-gradient-to-br from-blue-50/80 to-white">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-50 rounded-xl">
                <CalendarDaysIcon className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-blue-500">- 8.5%↗</span>
            </div>
            <div className="mt-4 space-y-1 text-center">
              <h2 className="text-5xl font-semibold">0</h2>
              <p className="text-gray-500 text-lg">Missed in</p>
            </div>
          </Card>

          {/* Missed Out Card */}
          <Card className="p-6 bg-gradient-to-br from-teal-50/80 to-white">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-teal-50 rounded-xl">
                <CalendarDaysIcon className="w-6 h-6 text-teal-500" />
              </div>
              <span className="text-sm font-medium text-teal-500">- 8.5%↗</span>
            </div>
            <div className="mt-4 space-y-1 text-center">
              <h2 className="text-5xl font-semibold">3</h2>
              <p className="text-gray-500 text-lg">Missed out</p>
            </div>
          </Card>
        </div>
        <div className=" flex justify-center items-center p-3">
          <button className=" p-2 rounded-full bg-white shadow-lg">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
