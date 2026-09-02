"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { getAllIfmLocationMasterUnpaginated } from "@/src/lib/apiHandler";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function FilterUserMapping({
  modal_props,
  selectedLocations,
  onApplyFilter,
}: {
  modal_props?: { open?: boolean; on_open_change?: (open: boolean) => void };
  selectedLocations: string[];
  onApplyFilter: (locationIds: string[]) => void;
}) {
  const { translations } = useLanguage();
  const t = translations?.modules?.workload || {};

  const [tempSelected, setTempSelected] = useState<string[]>(selectedLocations || []);

  useEffect(() => {
    setTempSelected(selectedLocations || []);
  }, [selectedLocations]);

  const { data: locationsResponse, isLoading } = useQuery({
    queryKey: ["ifm-location-master-unpaginated"],
    queryFn: getAllIfmLocationMasterUnpaginated,
  });

  const locations = Array.isArray(locationsResponse?.data) ? locationsResponse.data : [];

  const handleToggle = (id: string) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const handleApply = () => {
    onApplyFilter(tempSelected);
    modal_props?.on_open_change?.(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-medium text-muted-foreground">
        {t.filter_by_location || "Filter by Location"}
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-sm">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="py-4 text-center text-sm">No locations available</div>
      ) : (
        <div className="max-h-60 overflow-y-auto flex flex-col gap-2 border p-3 rounded-md">
          {locations.map((loc: any) => {
            const locId = String(loc.location_id);
            const isChecked = tempSelected.includes(locId);
            return (
              <label
                key={locId}
                className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-1.5 rounded transition"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(locId)}
                />
                <span className="text-sm">
                  {loc.project_name} - {loc.location_name || loc.location_code || `ID #${locId}`}
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Clear Filter
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => modal_props?.on_open_change?.(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
