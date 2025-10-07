import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer space-x-2">
      {label && <span>{label}</span>}
      <div className="relative w-14 h-8">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-12 h-6 rounded-full transition-colors duration-300 ${
            checked ? "bg-primary" : "bg-border-grey"
          }`}
        />
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </div>
    </label>
  );
};

export default Switch;
