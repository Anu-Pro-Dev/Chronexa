"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex items-center gap-4", className)}>
      <Card className="flex-1 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-center pb-2">All {title}</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee,admins..."
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className={`h-[${height}] pr-4`}>
            {filteredLeftItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={(checked) =>
                    handleItemSelection(item, !!checked)
                  }
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {item.name}
                </label>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1 border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-center pb-2">Selected {title}</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee,admins..."
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className={`h-[${height}] pr-4`}>
            {filteredRightItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2 py-1">
                <span className="text-sm font-medium leading-none">
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
