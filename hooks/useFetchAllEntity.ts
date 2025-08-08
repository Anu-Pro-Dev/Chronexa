// import { useQuery } from "@tanstack/react-query";
// import { apiRequest } from "../lib/apiHandler";
// import { useDebounce } from "@/hooks/useDebounce";

// type Params = Record<string, string>;

// interface Options {
//   searchParams?: Params; // { name: "abc", code: "AE" }
//   enabled?: boolean;
// }

// /**
//  * Fetches all entities with optional debounced search params
//  */
// export function useFetchAllEntity(entity: string, options?: Options) {
//   const { searchParams = {}, enabled = true } = options || {};

//   // Debounce all search values
//   const debouncedParams: Params = {};
//   for (const key in searchParams) {
//     debouncedParams[key] = useDebounce(searchParams[key], 500);
//   }

//   const fetchFn = async () => {
//     return apiRequest(`/${entity}/all`, "GET", debouncedParams);
//   };

//   return useQuery({
//     queryKey: [entity, debouncedParams],
//     queryFn: fetchFn,
//     enabled: !!entity && enabled,
//   });
// }
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiHandler";
import { useDebounce } from "@/hooks/useDebounce";
import { useMemo } from "react";

type Params = Record<string, string>;

interface Options {
  searchParams?: Params;
  enabled?: boolean;
}

/**
 * Fetches all entities with selective debouncing
 * Only search-related params are debounced, pagination params are immediate
 */
export function useFetchAllEntity(entity: string, options?: Options) {
  const { searchParams = {}, enabled = true } = options || {};

  // Define which parameters should NOT be debounced (immediate response needed)
  const immediateParams = ['limit', 'offset', 'page', 'sortField', 'sortDirection'];
  
  // Separate immediate params from search params
  const { immediate, searchable } = useMemo(() => {
    const immediate: Params = {};
    const searchable: Params = {};
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (immediateParams.includes(key)) {
        immediate[key] = value;
      } else {
        searchable[key] = value;
      }
    });
    
    return { immediate, searchable };
  }, [searchParams]);

  // Only debounce searchable parameters
  const debouncedSearchParams = useDebounce(searchable, 500);

  // Combine both sets of parameters
  const finalParams = useMemo(() => {
    const combined = { ...debouncedSearchParams, ...immediate };
    console.log('Final API params:', combined);
    return combined;
  }, [debouncedSearchParams, immediate]);

  const fetchFn = async () => {
    console.log(`🚀 API Call: /${entity}/all`, finalParams);
    const response = await apiRequest(`/${entity}/all`, "GET", finalParams);
    console.log(`📥 API Response:`, response);
    return response;
  };

  return useQuery({
    queryKey: [entity, finalParams],
    queryFn: fetchFn,
    enabled: !!entity && enabled,
    staleTime: 0, // Force fresh data
    refetchOnWindowFocus: false,
  });
}