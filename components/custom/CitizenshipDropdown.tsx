import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import { DropDownIcon } from "@/icons/icons";

interface Country {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
}

interface CitizenshipDropdownProps {
  value: Country | null;
  onChange: (value: Country | null) => void;
}
const CitizenshipDropdown = ({ value, onChange }: CitizenshipDropdownProps) => {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    fetch("/countries.json")
      .then((response) => response.json())
      .then((data: Country[]) => setCountries(data))
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      display: "flex",
      height: "2.5rem",
      width: "100%",
      borderRadius: "9999px",
      border: state.isFocused ? "1px solid #007bff" : "1px solid #808080cc",
      backgroundColor: "transparent",
      paddingLeft: "0.25rem",
      fontSize: "0.875rem",
      fontWeight: "400",
      boxShadow: "none",
      color: "#1f2937",
      transition: "border-color 0.2s ease-in-out",
      "&:hover": { borderColor: "#007bff" },
      "&:focus": { outline: "none", borderColor: "#007bff" },
      maxWidth: "350px",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6b7280",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#1f2937",
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "8px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      zIndex: 9999,
      margin: "5px"
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      padding: "10px",
      cursor: "pointer",
      backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
      color: "#1f2937",
      transition: "background-color 0.2s ease-in-out",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <DropDownIcon color="#6b7280"/>
      </components.DropdownIndicator>
    );
  };

  return (
    <Select
      options={countries}
      value={value}
      getOptionLabel={(country) => country.name} // Return a string (name)
      getOptionValue={(country) => country.code}
      formatOptionLabel={(country) => ( // Render custom JSX in the dropdown
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={country.flag} alt={country.code} width="20" height="15" />
          <span>{country.name} - {country.nameAr}</span>
        </div>
      )}
      onChange={(selected) => onChange(selected as Country)} // Pass the whole country object
      placeholder="Choose citizenship"
      styles={customStyles}
      components={{ DropdownIndicator }}
      menuPlacement="bottom"
    />
  );
};

export default CitizenshipDropdown;