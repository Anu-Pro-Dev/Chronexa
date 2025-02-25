"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter

export const LeaveCardHeader = ({ page, setPage }: any) => {
  const router = useRouter(); // Get the router object

  // Determine the href based on the current path
  const getApplyLink = () => {
    if (page === "Leaves") {
      return "/self-services/manage-leaves/leave-application/add"; // Navigate to this page if the path is /leaves
    } else if (page === "Permissions") {
      return "/self-services/manage-permissions/permission-application/add"; // Navigate to this page if the path is /permissions
    }
    return "/dashboard/self-statistics/"; // Default fallback
  }

  return (
    <div className='flex flex-row justify-between p-4'>
      <div className='flex gap-2'>
        <h5
          className={`cursor-pointer font-bold text-lg ${
            page === "Leaves"
              ? "border-b-[2px] border-primary text-primary"
              : "text-text-primary"
          }`}
          onClick={() => setPage("Leaves")}
        >
          Leaves
        </h5>
        <h5 className='cursor-pointer font-bold text-lg text-text-primary'>/</h5>
        <h5
          className={`cursor-pointer font-bold text-lg ${
            page === "Permissions"
              ? "border-b-[2px] border-primary text-primary"
              : "text-text-primary"
          }`}
          onClick={() => setPage("Permissions")}
        >
          Permissions
        </h5>
      </div>
      <Link
        href={getApplyLink()} // Use the conditional href
        className='text-primary text-sm font-medium flex items-center justify-center gap-1'
      >
        Apply
      </Link>
    </div>
  );
};