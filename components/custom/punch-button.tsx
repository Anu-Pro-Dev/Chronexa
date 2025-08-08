// "use client";
// import React, { useState, useEffect } from 'react';
// import { useLanguage } from "@/providers/LanguageProvider";
// import { Button } from "../ui/button";
// import { usePunch } from "../../providers/PunchProvider";
// import { PunchInIcon, PunchOutIcon } from "@/icons/icons";

// export function PunchButton() {
//   const { translations } = useLanguage();
//   const t = translations?.buttons || {};
//   const { isPunchedIn, punchInTime, togglePunch } = usePunch();
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   if (!isClient) {
//     return (
//       <Button
//         variant={"gradient"}
//         className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-accent hover:opacity-90"
//         disabled
//       >
//         <PunchInIcon/>
//         <span>Loading...</span>
//       </Button>
//     );
//   }

//   return (
//     <Button
//       onClick={togglePunch}
//       variant={"gradient"}
//       className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-accent hover:opacity-90"
//     >
//       {isPunchedIn ? (
//         <>
//           <PunchOutIcon/>
//           <span>{t?.punch_out}</span>
//         </>
//       ) : (
//         <>
//           <PunchInIcon/>
//           <span>{t?.punch_in}</span>
//         </>
//       )}
//     </Button>
//   );
// }

"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/providers/LanguageProvider";
import { Button } from "../ui/button";
import { usePunch } from "../../providers/PunchProvider";
import { PunchInIcon, PunchOutIcon } from "@/icons/icons";
import { useAuthGuard } from "@/hooks/useAuthGuard"; // Adjust import path as needed
import { addEventTransaction } from "@/lib/apiHandler"; // Adjust import path as needed

export function PunchButton() {
  const { translations } = useLanguage();
  const t = translations?.buttons || {};
  const { isPunchedIn, punchInTime, togglePunch } = usePunch();
  const { employeeId } = useAuthGuard();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePunchClick = async () => {
    if (!employeeId) {
      console.error("Employee ID not found");
      return;
    }

    setIsLoading(true);
    
    try {
      // Get current server time (you might want to get this from your server)
      const currentTime = new Date().toISOString();
      
      const transactionData = {
        employee_id: employeeId,
        transaction_time: currentTime,
        reason: isPunchedIn ? "OUT" : "IN",
        user_entry_flag: true
      };

      console.log("🕐 Submitting punch transaction:", transactionData);
      
      const response = await addEventTransaction(transactionData);
      
      if (response.success || response) {
        // Call the original toggle function after successful API call
        togglePunch();
        console.log("✅ Punch transaction successful:", response);
      } else {
        console.error("❌ Punch transaction failed:", response);
        // You might want to show an error message to the user here
      }
      
    } catch (error) {
      console.error("❌ Error during punch transaction:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <Button
        variant={"gradient"}
        className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-accent hover:opacity-90"
        disabled
      >
        <PunchInIcon/>
        <span>Loading...</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePunchClick}
      variant={"gradient"}
      className="flex items-center px-3 gap-2 rounded-md font-bold text-sm text-accent hover:opacity-90"
      disabled={isLoading || !employeeId}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing...</span>
        </>
      ) : isPunchedIn ? (
        <>
          <PunchOutIcon/>
          <span>{t?.punch_out}</span>
        </>
      ) : (
        <>
          <PunchInIcon/>
          <span>{t?.punch_in}</span>
        </>
      )}
    </Button>
  );
}