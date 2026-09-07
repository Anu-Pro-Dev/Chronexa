"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Search } from "lucide-react";

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
  const [searchValue, setSearchValue] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const [cachedLocationMap, setCachedLocationMap] = useState<Record<string, any>>({});

  useEffect(() => {
    setTempSelected(selectedLocations || []);
  }, [selectedLocations]);

  // Fetch locations with API search parameter
  const { data: locationsResponse, isLoading } = useFetchAllEntity("ifm-location-master", {
    searchParams: {
      limit: "10",
      offset: "1",
      ...(debouncedSearchValue && { search: debouncedSearchValue }),
    },
  });

  const locations = Array.isArray(locationsResponse?.data) ? locationsResponse.data : [];

  useEffect(() => {
    if (locations.length > 0) {
      setCachedLocationMap((prev) => {
        const next = { ...prev };
        locations.forEach((loc: any) => {
          next[String(loc.location_id)] = loc;
        });
        return next;
      });
    }
  }, [locations]);

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
      <div className="text-sm font-medium text-text-primary">
        {t.filter_by_location || "Filter by Location"}
      </div>

      {/* Search Filter Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t.placeholder_search_location || "Search project or location..."}
          className="pl-9 h-9 rounded-full border border-border-grey bg-transparent text-sm text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Location options list */}
      {isLoading ? (
        <div className="py-6 text-center text-sm text-text-secondary">Searching locations...</div>
      ) : locations.length === 0 ? (
        <div className="py-6 text-center text-sm text-text-secondary">No locations found</div>
      ) : (
        <div
          className="max-h-60 overflow-y-auto [scrollbar-width:auto] pr-2 flex flex-col gap-1 border border-border-grey p-2 rounded-xl"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {locations.map((loc: any) => {
            const locId = String(loc.location_id);
            const isChecked = tempSelected.includes(locId);
            return (
              <label
                key={locId}
                className="flex items-center gap-3 cursor-pointer hover:bg-backdrop p-2 rounded-lg transition text-text-primary"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(locId)}
                />
                <span className="text-sm font-medium truncate">
                  {loc.project_name} - {loc.location_name || loc.location_code || `ID #${locId}`}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Selected Items summary indicator */}
      {tempSelected.length > 0 && (
        <div className="text-xs text-text-secondary">
          {tempSelected.length} {tempSelected.length === 1 ? "location selected" : "locations selected"}
        </div>
      )}

      <div className="flex justify-between items-center gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={handleClear}>
          {translations?.buttons?.clear || "Clear Filter"}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => modal_props?.on_open_change?.(false)}
          >
            {translations?.buttons?.cancel || "Cancel"}
          </Button>
          <Button size="sm" onClick={handleApply}>
            {translations?.buttons?.apply || "Apply Filter"}
          </Button>
        </div>
      </div>
    </div>
  );
}
