import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./apiHandler";
import { useDebounce } from "@/hooks/useDebounce";

type Params = Record<string, string>;

interface Options {
  searchParams?: Params; // { name: "abc", code: "AE" }
  enabled?: boolean;
}

/**
 * Fetches all entities with optional debounced search params
 */
export function useFetchAllEntity(entity: string, options?: Options) {
  const { searchParams = {}, enabled = true } = options || {};

  // Debounce all search values
  const debouncedParams: Params = {};
  for (const key in searchParams) {
    debouncedParams[key] = useDebounce(searchParams[key], 500);
  }

  const fetchFn = async () => {
    return apiRequest(`/${entity}/all`, "GET", debouncedParams);
  };

  return useQuery({
    queryKey: [entity, debouncedParams],
    queryFn: fetchFn,
    enabled: !!entity && enabled,
  });
}
