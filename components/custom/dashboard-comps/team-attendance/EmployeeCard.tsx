"use client";
import React from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";
import {
  EmployeesIcon,
  OrgIcon,
  LeaveTakenIcon,
  ManagerIcon,
  EmployeeCountIcon,
  VoilationIcon,
} from "@/icons/icons";

function LeaveCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2 flex flex-col justify-between">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          {t?.emp_overview}
        </h5>
      </div>
      <div className="flex p-4">
        <div>
          <div className="flex gap-10">
            <p className="text-text-secondary font-semibold text-sm w-[60px]">
              {t?.total_workforce}
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
              {t?.total_org}
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
              {t?.team_managers}
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
              {t?.emps_count}
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
              {t?.total_violations}
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
              {t?.total_leaves}
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
