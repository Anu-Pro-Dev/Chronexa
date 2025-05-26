import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getAllCountries } from "@/lib/apiHandler";

export interface Country {
  country_code: string;
  country_eng: string;
  country_arb: string;
  country_flag: string;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await getAllCountries();
        const mappedCountries = response.data.map((item: any) => ({
          country_code: item.country_code,
          country_eng: item.country_eng,
          country_arb: item.country_arb,
          country_flag: item.country_flag_url,
        }));
        setCountries(mappedCountries);
      } catch (error: any) {
        console.error("Error fetching countries:", error.message);
        toast.error(error.message);
      }
    };

    fetchCountries();
  }, []);

  const getCountryByCode = (country_code: string | null): Country | null => {
    if (!country_code) return null;
    return countries.find((c) => c.country_code === country_code) ?? null;
  };

  return { countries, getCountryByCode };
};
