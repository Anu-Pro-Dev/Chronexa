import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
import { PaletteIcon } from "@/icons/icons"

const colors = [
  "#0E6ECF", "#00C875", "#DF2F4A", "#9D50DD",
];

const ColorPicker = () => {
  const [selectedColor, setSelectedColor] = useState("#000000");

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <Popover>
        <PopoverTrigger className="flex justify-between items-center h-10 w-full rounded-full border border-border-grey bg-transparent px-3 text-sm font-normal shadow-none text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">  
          <span className="uppercase">{selectedColor}</span>
          <div
            className="w-4 h-4"
            style={{ backgroundColor: selectedColor }}
          ></div>
        </PopoverTrigger>
        <PopoverContent className="bg-accent p-0 rounded-lg shadow-dropdown w-60">
          <div className="flex flex-col w-full">
            {colors.map((color) => (
              <button
                key={color}
                className="flex gap-3 justify-between items-center px-2 py-3 hover:bg-backdrop hover:text-primary"
                onClick={() => setSelectedColor(color)}
              >
                <span className="uppercase font-medium text-sm">{color}</span>
                <div
                  className="w-4 h-4"
                  style={{ backgroundColor: color }}
                ></div>
              </button>
            ))}
          </div>
          <div className="px-2 py-3 flex items-center gap-2">
            <PaletteIcon className="w-5 h-5 text-text-secondary" />
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full cursor-pointer bg-transparent border-none"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ColorPicker;