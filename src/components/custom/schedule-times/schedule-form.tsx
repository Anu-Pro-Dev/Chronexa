"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { TimeEntry, NormalFormData } from "./types";

interface ScheduleFormProps {
  data: NormalFormData;
  onChange: (data: NormalFormData) => void;
}

export function ScheduleForm({ data, onChange }: ScheduleFormProps) {
  const handleTimeEntryChange = (
    index: number,
    field: keyof TimeEntry,
    value: any
  ) => {
    const newTimeEntries = [...data.timeEntries];
    newTimeEntries[index] = {
      ...newTimeEntries[index],
      [field]: value,
    };
    onChange({ ...data, timeEntries: newTimeEntries });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="organization">
            Organization <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.organization}
            onValueChange={(value) =>
              onChange({ ...data, organization: value })
            }
          >
            <SelectTrigger className="max-w-[350px]">
              <SelectValue placeholder="Choose organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="org1">Organization 1</SelectItem>
              <SelectItem value="org2">Organization 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduleTimes">
            Schedule times <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.scheduleTimes}
            onValueChange={(value) =>
              onChange({ ...data, scheduleTimes: value })
            }
          >
            <SelectTrigger className="max-w-[350px]">
              <SelectValue placeholder="Choose organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time1">Schedule Time 1</SelectItem>
              <SelectItem value="time2">Schedule Time 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="code">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            value={data.code}
            onChange={(e) => onChange({ ...data, code: e.target.value })}
            placeholder="This is a sample Context"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">
            Color <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="text"
              value={data.color}
              onChange={(e) => onChange({ ...data, color: e.target.value })}
              placeholder="#000000"
            />
            <Input
              type="color"
              value={data.color}
              onChange={(e) => onChange({ ...data, color: e.target.value })}
              className="w-12 p-1 h-10"
            />
          </div>
        </div>
      </div>

      {data.timeEntries.map((entry, index) => (
        <div key={index} className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                In time {index + 1} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select
                  value={entry.inTime}
                  onValueChange={(value) =>
                    handleTimeEntryChange(index, "inTime", value)
                  }
                >
                  <SelectTrigger className="max-w-[350px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                  </SelectContent>
                </Select>
                <Clock className="absolute right-8 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required work hours</Label>
              <div className="relative">
                <Select
                  value={entry.requiredWorkHours}
                  onValueChange={(value) =>
                    handleTimeEntryChange(index, "requiredWorkHours", value)
                  }
                >
                  <SelectTrigger className="max-w-[350px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="9">9 hours</SelectItem>
                  </SelectContent>
                </Select>
                <Clock className="absolute right-8 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Out time {index + 1} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select
                  value={entry.outTime}
                  onValueChange={(value) =>
                    handleTimeEntryChange(index, "outTime", value)
                  }
                >
                  <SelectTrigger className="max-w-[350px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="17:00">17:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                  </SelectContent>
                </Select>
                <Clock className="absolute right-8 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`openShift-${index}`}
                  checked={entry.openShift}
                  onCheckedChange={(checked) =>
                    handleTimeEntryChange(index, "openShift", checked)
                  }
                />
                <label
                  htmlFor={`openShift-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Open shift
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`nightShift-${index}`}
                  checked={entry.nightShift}
                  onCheckedChange={(checked) =>
                    handleTimeEntryChange(index, "nightShift", checked)
                  }
                />
                <label
                  htmlFor={`nightShift-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Night shift
                </label>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="graceIn">Grace In (Minutes)</Label>
          <Input
            id="graceIn"
            type="number"
            value={data.graceInMinutes}
            onChange={(e) =>
              onChange({ ...data, graceInMinutes: parseInt(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="graceOut">Grace Out (Minutes)</Label>
          <Input
            id="graceOut"
            type="number"
            value={data.graceOutMinutes}
            onChange={(e) =>
              onChange({ ...data, graceOutMinutes: parseInt(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="flexible">Flexible (Minutes)</Label>
        <Input
          id="flexible"
          type="number"
          value={data.flexibleMinutes}
          onChange={(e) =>
            onChange({ ...data, flexibleMinutes: parseInt(e.target.value) })
          }
        />
      </div>
    </div>
  );
}
