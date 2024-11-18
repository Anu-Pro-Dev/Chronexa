"use client";

import React, {useState} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { sidebar_primary, sidebar_secondary } from "@/lib/routes/routes-data";
import { LogoIcon, MenuFold, MenuUnFold } from "@/lib/svg/icons";
import { cn } from "@/lib/utils";

function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [expanded, setExpanded] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menuName: string, linkTo: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
    router.push(linkTo);
  };


  const activeItemColors = {
    iconColor: "text-primary",
    textColor: "text-primary",
    backgroundColor: "bg-backdrop"
  }

  const nonActiveItemColors = {
    iconColor: "text-text-secondary",
    textColor: "text-text-secondary",
    backgroundColor: "bg-bg-transparent"
  }

  return (
    <div className="sidebar-container px-5">
      <div className="app-logo flex items-center justify-between w-full h-[5em]">
        {expanded ? 
          <Link href="#" className="transition-all flex gap-2">
            <span className="text-primary">{LogoIcon()}</span>
            <h1 className='font-bold text-xl cursor-pointer text-text-primary'>Chronologix</h1>
          </Link>
        : 
          null
        }
        <button
          onClick={() => setExpanded((curr) => !curr)}
          className="p-2.5 rounded-lg bg-backdrop"
        >
          {expanded ? <span className="text-primary">{MenuFold()}</span> : <span className="text-primary">{MenuUnFold()}</span>}
        </button>
      </div>
      <div className="sidebar-items-container h-full text-sm font-medium pb-5">
        <div className="sidebar-primary-items">
          {expanded ? <div className="font-medium text-xs text-secondary pb-2">Primary</div> : null }
          <ul className="list-none sidebar-menu flex flex-col gap-3 mt-2">
            {sidebar_primary.map((item, index) => {
              const isActive = pathname === item.linkTo;
              return (
                <li key={index} className={cn(
                  `${
                    expanded ? "h-auto" : "h-10"
                  }`, 
                  `sidebar-item relative transition-colors group`)}>
                  <div
                    className={cn(
                      `${
                        expanded ? "rounded-full" : "rounded-lg justify-center px-2.5"
                      }`,
                      `cursor-pointer relative font-semibold flex items-center ${nonActiveItemColors.backgroundColor}`,
                      isActive && `${activeItemColors.backgroundColor}`,
                      `hover:bg-backdrop`
                    )}
                    onClick={() => toggleMenu(item.name, item.linkTo)}>
                    <div className={cn(
                      `${
                        expanded ? "pl-3" : "pl-0"
                      }`, 
                      `${
                        expanded ? "w-8" : "w-auto"
                      }`, 
                      `sidebar-menu-item-icon h-10 flex items-center ${nonActiveItemColors.iconColor}`,
                      isActive && `${activeItemColors.iconColor}`)}>
                      {isActive
                        ? item.icon(activeItemColors.iconColor)
                        : item.icon(nonActiveItemColors.iconColor)}
                    </div>
                    <div
                      className={`name ${
                        isActive
                          ? `${activeItemColors.textColor}`
                          : `${nonActiveItemColors.textColor}`
                      } overflow-hidden transition-all ${
                        expanded ? "w-52 px-2.5" : "w-0"
                      }`}>
                      <p className="sidebar-menu-item-text w-full text-sm font-medium flex flex-row justify-between items-center">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  {!expanded && (
                    <div
                      className={`absolute left-[10px] top-0 w-auto rounded-md px-2 py-1 ml-6 bg-backdrop text-primary text-xs invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
                    >
                      {item.name}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <hr className="h-[1px] my-4 text-secondary"></hr>
        <div className="sidebar-secondary-items">
          {expanded ? <div className="font-medium text-xs text-secondary pb-2">Secondary</div> : null }
          <ul className="list-none sidebar-menu flex flex-col gap-3 mt-2">
            {sidebar_secondary.map((item, index) => {
              const isActive = pathname === item.linkTo;
              return (
                <li key={index} className={cn(
                  `${
                    expanded ? "h-auto" : "h-10"
                  }`, 
                  `sidebar-item relative transition-colors group`)}>
                  <div
                    className={cn(
                      `${
                        expanded ? "rounded-full" : "rounded-lg justify-center px-2.5"
                      }`,
                      `cursor-pointer relative font-semibold flex items-center ${nonActiveItemColors.backgroundColor}`,
                      isActive && `${activeItemColors.backgroundColor}`
                    )}
                    onClick={() => toggleMenu(item.name, item.linkTo)}>
                    <div className={cn(
                      `${
                        expanded ? "pl-3" : "pl-0"
                      }`,
                      `${
                        expanded ? "w-8" : "w-auto"
                      }`, 
                      `sidebar-menu-item-icon h-10 flex items-center ${nonActiveItemColors.iconColor}`,
                      isActive && `${activeItemColors.iconColor}`)}>
                      {isActive
                        ? item.icon(activeItemColors.iconColor)
                        : item.icon(nonActiveItemColors.iconColor)}
                    </div>
                    <div
                      className={`name ${
                        isActive
                          ? `${activeItemColors.textColor}`
                          : `${nonActiveItemColors.textColor}`
                      } overflow-hidden transition-all ${
                        expanded ? "w-52 px-2.5" : "w-0"
                      }`}>
                      <p className="sidebar-menu-item-text w-full text-sm font-medium flex flex-row justify-between items-center">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  {!expanded && (
                    <div
                      className={`absolute left-[10px] top-0 w-auto rounded-md px-2 py-1 ml-6 bg-backdrop text-primary text-xs invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
                    >
                      {item.name}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

