"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function WorkflowTable() {
  const rows = [1, 2, 3];

  const router = useRouter();
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid gap-4">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 text-sm font-medium text-blue-600">
          <div>Type</div>
          <div>Value</div>
          <div>On Success</div>
          <div>On Failure</div>
          <div>Status Text</div>
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <div key={row} className="grid grid-cols-5 gap-4">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Workflows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workflow1">Workflow 1</SelectItem>
                <SelectItem value="workflow2">Workflow 2</SelectItem>
                <SelectItem value="workflow3">Workflow 3</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value1">Value 1</SelectItem>
                <SelectItem value="value2">Value 2</SelectItem>
                <SelectItem value="value3">Value 3</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Step 2" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="step1">Step 1</SelectItem>
                <SelectItem value="step2">Step 2</SelectItem>
                <SelectItem value="step3">Step 3</SelectItem>
              </SelectContent>
            </Select>

            <Input type="text" placeholder="Rejected" className="w-full" />

            <Input
              type="text"
              placeholder="Enter sample text"
              className="w-full"
            />
          </div>
        ))}
      </div>
      <div className="w-full flex gap-2 items-center col-span-2 justify-end mt-6">
        <Button
          variant={"outline"}
          type="button"
          size={"lg"}
          className=""
          onClick={() => router.push("/self-services/workflow")}
        >
          Cancel
        </Button>
        <Button type="submit" size={"lg"} className="">
          Save
        </Button>
      </div>
    </div>
  );
}
