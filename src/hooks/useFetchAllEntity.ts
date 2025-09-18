import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiHandler";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useMemo } from "react";

type Params = Record<string, string>;

interface Options {
  searchParams?: Params;
  enabled?: boolean;
  endpoint?: string;
  removeAll?: boolean;
}

export function useFetchAllEntity(entity: string, options?: Options) {
  const { searchParams = {}, enabled = true, endpoint, removeAll = false } = options || {};

  const immediateParams = ['limit', 'offset'];
  
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

  const debouncedSearchParams = useDebounce(searchable, 500);

  const finalParams = useMemo(() => {
    const combined = { ...debouncedSearchParams, ...immediate };
    return combined;
  }, [debouncedSearchParams, immediate]);

  const fetchFn = async () => {
    const queryString = Object.entries(finalParams)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Determine the base URL
    let baseUrl: string;
    if (endpoint) {
      // Use fully custom endpoint
      baseUrl = endpoint;
    } else if (removeAll) {
      // Use entity name without '/all'
      baseUrl = `/${entity}/`;
    } else {
      // Default behavior: use entity name with '/all'
      baseUrl = `/${entity}/all`;
    }
    
    const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(url, "GET");
    return response;
  };

  const queryKey = endpoint ? [endpoint, finalParams] : [entity, removeAll ? 'custom' : 'all', finalParams];

  return useQuery({
    queryKey,
    queryFn: fetchFn,
    enabled: !!entity && enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}