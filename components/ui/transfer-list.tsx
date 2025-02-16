"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SearchIcon } from "@/icons/icons";

interface Employee {
  id: string;
  name: string;
  selected: boolean;
}

interface TransferListProps {
  items: Employee[];
  onSelectionChange: (selectedItems: Employee[]) => void;
  className?: string;
  title?: string;
  height?: string;
}

const ArrowSvg = () => (
  <svg className='w-16 h-16' viewBox="0 0 62 61" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_1793_6315)">
          <rect x="12" y="9" width="38" height="37" rx="18.5" fill="#0078D4" />
      </g>
      <path d="M32.7851 23.6982C32.8103 23.6479 32.825 23.5931 32.8283 23.537C32.8317 23.4808 32.8237 23.4246 32.8048 23.3717C32.7859 23.3187 32.7564 23.2702 32.7183 23.2289C32.6801 23.1876 32.6339 23.1545 32.5826 23.1316L24.7476 19.6374C23.5009 19.0816 22.2084 20.3166 22.8259 21.4724L25.4526 26.3924C25.6568 26.7757 25.6568 27.2257 25.4526 27.6082L22.8259 32.5282C22.2084 33.6841 23.5009 34.9191 24.7476 34.3632L27.6843 33.0532C28.0369 32.8962 28.324 32.6217 28.4968 32.2766L32.7851 23.6982Z" fill="white" />
      <path opacity="0.6" d="M33.9437 24.1741C33.9915 24.0781 34.0746 24.0043 34.1754 23.968C34.2763 23.9317 34.3873 23.9356 34.4854 23.9791L38.5045 25.7716C39.6079 26.2632 39.6079 27.7341 38.5045 28.2257L31.0895 31.5324C31.0112 31.5671 30.924 31.5768 30.8399 31.5601C30.7558 31.5435 30.6789 31.5013 30.6197 31.4393C30.5605 31.3773 30.5218 31.2986 30.5089 31.2139C30.4961 31.1291 30.5097 31.0425 30.5479 30.9657L33.9437 24.1741Z" fill="white" />
      <defs>
          <filter id="filter0_d_1793_6315" x="0" y="0" width="62" height="61" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="3" />
              <feGaussianBlur stdDeviation="6" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.629067 0 0 0 0 0.375833 0 0 0 0.18 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1793_6315" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1793_6315" result="shape" />
          </filter>
      </defs>
  </svg>
);

export function TransferList({
  title,
  items,
  onSelectionChange,
  className,
  height = "250px", // Reduced default height
}: TransferListProps) {
  const [searchLeft, setSearchLeft] = React.useState("");
  const [searchRight, setSearchRight] = React.useState("");

  const handleItemSelection = (item: Employee, isSelected: boolean) => {
    const updatedItems = items.map((i) =>
      i.id === item.id ? { ...i, selected: isSelected } : i
    );
    onSelectionChange(updatedItems.filter((i) => i.selected));
  };

  const filteredLeftItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchLeft.toLowerCase())
  );

  const filteredRightItems = items.filter(
    (item) =>
      item.selected &&
      item.name.toLowerCase().includes(searchRight.toLowerCase())
  );

  return (
    <div className={cn("flex items-center gap-4 px-5", className)}>
      <Card className="flex-1">
        <CardHeader className="pb-4">
          <CardTitle className="text-center pb-3">All {title}</CardTitle>
          <div className="bg-white border border-border-accent px-4 py-3 flex items-center gap-2 shadow-searchbar rounded-full">
            <SearchIcon className="text-secondary"/>
            <input
              className="text-xs bg-transparent border-none outline-none font-medium text-text-primary w-full h-full placeholder-text-secondary"
              placeholder={'Search employee, admins, organizations...'}
              type="search"
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[240px] py-1">
            {filteredLeftItems.map((item) => (
              <div key={item.id} className="flex items-center bg-white gap-2 py-3 pl-2">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={(checked) =>
                    handleItemSelection(item, !!checked)
                  }
                  className="w-4 h-4"
                />
                <label className="text-[15px] font-semibold text-text-primary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {item.name}
                </label>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <div className='w-fit h-fit'>
        <button className='m-5 w-fit h-fit'>
            <ArrowSvg />
        </button>
      </div>

      <Card className="flex-1">
        <CardHeader className="pb-4">
          <CardTitle className="text-center pb-3">Selected {title}</CardTitle>
          <div className="bg-white border border-border-accent px-4 py-3 flex items-center gap-2 shadow-searchbar rounded-full">
            <SearchIcon className="text-secondary"/>
            <input
              className="text-xs bg-transparent border-none outline-none font-medium text-text-primary w-full h-full placeholder-text-secondary"
              placeholder={'Search employee, admins, organizations...'}
              type="search"
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[240px] py-1 bg-white">
            {filteredRightItems.map((item) => (
              <div key={item.id} className="flex items-start bg-white gap-2 py-3 pl-2">
                <span className="text-[15px] font-semibold text-text-primary leading-none">
                  {item.name}
                </span>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
