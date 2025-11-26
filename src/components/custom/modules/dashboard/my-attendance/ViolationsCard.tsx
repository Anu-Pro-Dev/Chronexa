// "use client";
// import React from "react";
// import { useLanguage } from "@/src/providers/LanguageProvider";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/src/components/ui/Carousel";
// import {
//   MissedInIcon,
//   MissedOutIcon,
//   EarlyOutIcon,
//   LateInIcon,
// } from "@/src/icons/icons";
// import { useAttendanceData } from "../my-attendance/AttendanceData";

// function ViolationsCard() {
//   const { dir, translations } = useLanguage();
//   const t = translations?.modules?.dashboard || {};
//   const { attendanceDetails, loading } = useAttendanceData();

//   const formatValue = (value: any): number => {
//     if (value === null || value === undefined) return 0;
//     return typeof value === 'string' ? parseInt(value) || 0 : Number(value) || 0;
//   };

//   const missedIn = formatValue(attendanceDetails?.TotalMissedIn);
//   const missedOut = formatValue(attendanceDetails?.TotalMissedOut);
//   const lateIn = formatValue(attendanceDetails?.MonthlyLate);
//   const earlyOut = formatValue(attendanceDetails?.MonthlyEarly);
  
//   return (
//     <div className="relative shadow-card h-full rounded-[10px] bg-accent px-2 pt-3 pb-10 flex flex-col items-center">
//       <div className="w-44 h-44 rounded-full bg-[#0078D426] blur-[50px] absolute left-[50px] top-[50px]"></div>
//       <div className="w-44 h-44 rounded-full bg-[#0078D426] blur-[50px] absolute right-[50px] bottom-[50px]"></div>
//       <div className="flex flex-row justify-between py-4">
//         <h5 className="text-lg text-text-primary font-bold">{t?.violations}</h5>
//       </div>
//       <Carousel className="w-full max-w-xs px-5" dir={dir}>
//         <CarouselContent className={dir === "rtl" ? "flex-row-reverse" : ""}>
//           <CarouselItem className="pl-0">
//             <div className="aspect-square flex flex-col items-center justify-center gap-4 px-6">
//               <div className="h-auto w-full rounded-[10px] bg-gradient-to-r from-[#0078D450] to-[#DAEDFF] p-[2px]">
//                 <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
//                   <div className="flex justify-between w-full">
//                     <div className="icon-group text-primary bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]">
//                       {MissedInIcon()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-3xl text-text-primary font-bold">
//                       {loading ? "-" : missedIn}
//                     </p>
//                     <p className="text-text-secondary font-semibold text-sm">
//                       {t?.missed_in}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="h-[1px] w-[60px] bg-background flex self-center"></div>
//               <div className="h-auto w-full rounded-[10px] bg-gradient-to-l from-[#0078D450] to-[#DAEDFF] p-[2px]">
//                 <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
//                   <div className="flex justify-between w-full">
//                     <div className="icon-group text-[#1E9090] bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(30,144,144,0.15)]">
//                       {MissedOutIcon()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-3xl text-text-primary font-bold">
//                       {loading ? "-" : missedOut}
//                     </p>
//                     <p className="text-text-secondary font-semibold text-sm">
//                       {t?.missed_out}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CarouselItem>

//           <CarouselItem className="pl-0">
//             <div className="aspect-square flex flex-col items-center justify-center gap-4 px-6">
//               <div className="h-auto w-full rounded-[10px] bg-gradient-to-r from-[#0078D450] to-[#DAEDFF] p-[2px]">
//                 <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
//                   <div className="flex justify-between w-full">
//                     <div className="icon-group text-[#4318FF] bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(67,24,255,0.15)]">
//                       {LateInIcon()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-3xl text-text-primary font-bold">
//                       {loading ? "-" : lateIn}
//                     </p>
//                     <p className="text-text-secondary font-semibold text-sm">
//                       {t?.late_in}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="h-[1px] w-[60px] bg-background flex self-center"></div>
//               <div className="h-auto w-full rounded-[10px] bg-gradient-to-l from-[#0078D450] to-[#DAEDFF] p-[2px]">
//                 <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
//                   <div className="flex justify-between w-full">
//                     <div className="icon-group text-[#D2691E] bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(210,105,30,0.15)]">
//                       {EarlyOutIcon()}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-3xl text-text-primary font-bold">
//                       {loading ? "-" : earlyOut}
//                     </p>
//                     <p className="text-text-secondary font-semibold text-sm">
//                       {t?.early_out}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CarouselItem>
//         </CarouselContent>
//         <CarouselPrevious />
//         <CarouselNext />
//       </Carousel>
//     </div>
//   );
// }

// export default ViolationsCard;
"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/ui/Carousel";
import {
  MissedInIcon,
  MissedOutIcon,
  EarlyOutIcon,
  LateInIcon,
} from "@/src/icons/icons";
import { useAttendanceData } from "../my-attendance/AttendanceData";

function ViolationsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { attendanceDetails, loading } = useAttendanceData();
  const [animatedValues, setAnimatedValues] = useState<any>(null);

  useEffect(() => {
    if (attendanceDetails && !loading) {
      animateValues(attendanceDetails);
    }
  }, [attendanceDetails, loading]);

  const animateValues = (data: any) => {
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newValues = {
        missedIn: Math.floor(formatValue(data?.TotalMissedIn) * progress),
        missedOut: Math.floor(formatValue(data?.TotalMissedOut) * progress),
        lateIn: Math.floor(formatValue(data?.MonthlyLate) * progress),
        earlyOut: Math.floor(formatValue(data?.MonthlyEarly) * progress),
      };

      setAnimatedValues(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const formatValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value) || 0 : Number(value) || 0;
  };

  const displayValues = animatedValues || {
    missedIn: 0,
    missedOut: 0,
    lateIn: 0,
    earlyOut: 0,
  };

  const missedIn = displayValues.missedIn;
  const missedOut = displayValues.missedOut;
  const lateIn = displayValues.lateIn;
  const earlyOut = displayValues.earlyOut;
  
  return (
    <div className="relative shadow-card h-full rounded-[10px] bg-accent px-2 pt-3 pb-10 flex flex-col items-center">
      <div className="w-44 h-44 rounded-full bg-[#0078D426] blur-[50px] absolute left-[50px] top-[50px]"></div>
      <div className="w-44 h-44 rounded-full bg-[#0078D426] blur-[50px] absolute right-[50px] bottom-[50px]"></div>
      <div className="flex flex-row justify-between py-4">
        <h5 className="text-lg text-text-primary font-bold">{t?.violations}</h5>
      </div>
      <Carousel className="w-full max-w-xs px-5" dir={dir}>
        <CarouselContent className={dir === "rtl" ? "flex-row-reverse" : ""}>
          <CarouselItem className="pl-0">
            <div className="aspect-square flex flex-col items-center justify-center gap-4 px-6">
              <div className="h-auto w-full rounded-[10px] bg-gradient-to-r from-[#0078D450] to-[#DAEDFF] p-[2px]">
                <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
                  <div className="flex justify-between w-full">
                    <div className="icon-group text-primary bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]">
                      {MissedInIcon()}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl text-text-primary font-bold">
                      {missedIn}
                    </p>
                    <p className="text-text-secondary font-semibold text-sm">
                      {t?.missed_in}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[1px] w-[60px] bg-background flex self-center"></div>
              <div className="h-auto w-full rounded-[10px] bg-gradient-to-l from-[#0078D450] to-[#DAEDFF] p-[2px]">
                <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
                  <div className="flex justify-between w-full">
                    <div className="icon-group text-[#1E9090] bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(30,144,144,0.15)]">
                      {MissedOutIcon()}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl text-text-primary font-bold">
                      {missedOut}
                    </p>
                    <p className="text-text-secondary font-semibold text-sm">
                      {t?.missed_out}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="pl-0">
            <div className="aspect-square flex flex-col items-center justify-center gap-4 px-6">
              <div className="h-auto w-full rounded-[10px] bg-gradient-to-r from-[#0078D450] to-[#DAEDFF] p-[2px]">
                <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
                  <div className="flex justify-between w-full">
                    <div className="icon-group text-[#4318FF] bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(67,24,255,0.15)]">
                      {LateInIcon()}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl text-text-primary font-bold">
                      {lateIn}
                    </p>
                    <p className="text-text-secondary font-semibold text-sm">
                      {t?.late_in}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[1px] w-[60px] bg-background flex self-center"></div>
              <div className="h-auto w-full rounded-[10px] bg-gradient-to-l from-[#0078D450] to-[#DAEDFF] p-[2px]">
                <div className="flex flex-col h-full w-full items-center justify-center bg-background rounded-[8px] px-3 py-6">
                  <div className="flex justify-between w-full">
                    <div className="icon-group text-[#D2691E] bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(210,105,30,0.15)]">
                      {EarlyOutIcon()}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl text-text-primary font-bold">
                      {earlyOut}
                    </p>
                    <p className="text-text-secondary font-semibold text-sm">
                      {t?.early_out}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export default ViolationsCard;