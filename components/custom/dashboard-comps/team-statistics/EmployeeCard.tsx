"use client";
import React from "react";
import Link from "next/link";
import {
  EmployeesIcon,
  OrgIcon,
  LeaveTakenIcon,
  ManagerIcon,
  EmployeeCountIcon,
  VoilationIcon,
} from "@/lib/svg/icons";

function LeaveCard() {
  return (
    <div className="shadow-card rounded-[10px] bg-white p-2 flex flex-col justify-between">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          Employee Overview
        </h5>
        <Link
          href="/self-services"
          className="text-primary text-sm font-medium flex items-center justify-center gap-1"
        >
          View more
          <svg
            width="15"
            height="16"
            viewBox="0 0 15 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.93496 3.28394L13.1537 7.50269C13.2193 7.56801 13.2713 7.64563 13.3068 7.73109C13.3422 7.81656 13.3605 7.90819 13.3605 8.00073C13.3605 8.09327 13.3422 8.18491 13.3068 8.27037C13.2713 8.35584 13.2193 8.43346 13.1537 8.49878L8.93496 12.7175C8.80287 12.8496 8.62372 12.9238 8.43691 12.9238C8.25011 12.9238 8.07096 12.8496 7.93887 12.7175C7.80678 12.5854 7.73257 12.4063 7.73257 12.2195C7.73257 12.0327 7.80678 11.8535 7.93887 11.7214L10.957 8.70327H2.34375C2.15727 8.70327 1.97843 8.62919 1.84657 8.49733C1.7147 8.36547 1.64063 8.18663 1.64063 8.00015C1.64063 7.81367 1.7147 7.63482 1.84657 7.50296C1.97843 7.3711 2.15727 7.29702 2.34375 7.29702L10.957 7.29702L7.93828 4.27886C7.80619 4.14677 7.73198 3.96762 7.73198 3.78081C7.73198 3.59401 7.80619 3.41486 7.93828 3.28276C8.07037 3.15067 8.24952 3.07647 8.43633 3.07647C8.62313 3.07647 8.80228 3.15067 8.93437 3.28276L8.93496 3.28394Z"
              fill="#0078D4"
            />
          </svg>
        </Link>
      </div>
      <div className="flex p-4">
        <div>
          <div className="flex gap-10">
            <p className="text-text-secondary font-semibold text-sm w-[60px]">
              Total Workforce
            </p>
            <div className="icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]">
              {EmployeesIcon()}
            </div>
          </div>
          <p className="text-2xl text-primary font-bold pt-2">120</p>
        </div>
        <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>
        <div>
          <div className="flex gap-10">
            <p className="text-text-secondary font-semibold text-sm w-[60px]">
              Total Organizations
            </p>
            <div className="icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(125,63,255,0.05)]">
              {OrgIcon()}
            </div>
          </div>
          <p className="text-2xl text-[#7D3FFF] font-bold pt-2">12</p>
        </div>
        <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>
        <div>
          <div className="flex gap-10">
            <p className="text-text-secondary font-semibold text-sm w-[60px]">
              Team Managers
            </p>
            <div className="icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(255,45,107,0.15)]">
              {ManagerIcon()}
            </div>
          </div>
          <p className="text-2xl text-[#FF6B2D] font-bold pt-2">30</p>
        </div>
      </div>
      <div className="flex justify-around py-2">
        <div className="h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10"></div>
        <div className="h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10"></div>
        <div className="h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10"></div>
      </div>
      <div className="flex p-4">
        <div>
          <div className="flex gap-10">
            <p className="text-text-secondary font-semibold text-sm w-[60px]">
              Employees Count
            </p>
            <div className="icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(255,195,0,0.15)]">
              {EmployeeCountIcon()}
            </div>
          </div>
          <p className="text-2xl text-[#FFC300] font-bold pt-2">90</p>
        </div>
        <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>
        <div>
          <div className="flex gap-10">
            <p className="text-text-secondary font-semibold text-sm w-[60px]">
              Total Violations
            </p>
            <div className="icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] shadow-[0_0_20px_15px_rgba(255,59,59,0.1)]">
              {VoilationIcon()}
            </div>
          </div>
          <p className="text-2xl text-[#FF3B3B] font-bold pt-2">18</p>
        </div>
        <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>
        <div>
          <div className="flex gap-10">
            <p className="text-text-secondary font-semibold text-sm w-[60px]">
              Total Leaves
            </p>
            <div className="icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] text-[#1DAA61] shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]">
              {LeaveTakenIcon()}
            </div>
          </div>
          <p className="text-2xl text-[#1DAA61] font-bold pt-2">08</p>
        </div>
      </div>
    </div>
  );
}

export default LeaveCard;
