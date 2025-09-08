"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { PolicyFormData } from "./types";

interface PolicyFormProps {
  data: PolicyFormData;
  onChange: (data: PolicyFormData) => void;
}

export function PolicyForm({ data, onChange }: PolicyFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Show on report:</Label>
        <RadioGroup
          value={data.showOnReport}
          onValueChange={(value: PolicyFormData["showOnReport"]) =>
            onChange({ ...data, showOnReport: value })
          }
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="first-in-last-out" id="show-first" />
            <Label htmlFor="show-first">First IN/Last Out</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all-transactions" id="show-all" />
            <Label htmlFor="show-all">All Transactions</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label>Email Notification:</Label>
        <RadioGroup
          value={data.emailNotification}
          onValueChange={(value: PolicyFormData["emailNotification"]) =>
            onChange({ ...data, emailNotification: value })
          }
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="first-in-last-out" id="email-first" />
            <Label htmlFor="email-first">First IN/Last Out</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all-transactions" id="email-all" />
            <Label htmlFor="email-all">All Transactions</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="calculate-hours"
            checked={data.calculateWorkedHours}
            onCheckedChange={(checked) =>
              onChange({ ...data, calculateWorkedHours: !!checked })
            }
          />
          <Label htmlFor="calculate-hours">
            Calculate Worked Hours From Schedule Start Time
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-overtime"
            checked={data.enableDefaultOvertime}
            onCheckedChange={(checked) =>
              onChange({ ...data, enableDefaultOvertime: !!checked })
            }
          />
          <Label htmlFor="enable-overtime">Enable Default Overtime</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-break"
            checked={data.enableDefaultBreakHours}
            onCheckedChange={(checked) =>
              onChange({ ...data, enableDefaultBreakHours: !!checked })
            }
          />
          <Label htmlFor="enable-break">Enable Default Break Hours</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="override-holiday"
            checked={data.overrideScheduleOnHoliday}
            onCheckedChange={(checked) =>
              onChange({ ...data, overrideScheduleOnHoliday: !!checked })
            }
          />
          <Label htmlFor="override-holiday">Override Schedule On Holiday</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="reduce-hours"
            checked={data.reduceRequiredHours}
            onCheckedChange={(checked) =>
              onChange({ ...data, reduceRequiredHours: !!checked })
            }
          />
          <Label htmlFor="reduce-hours">
            Reduce Required Hours if Personal Permission is approved
          </Label>
        </div>
      </div>
    </div>
  );
}
