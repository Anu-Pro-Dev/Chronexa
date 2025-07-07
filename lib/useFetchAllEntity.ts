import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./apiHandler";

export function useFetchAllEntity(entity: string) {
  const fetchFn = async () => {
    return apiRequest(`/${entity}/all`, "GET");
  };

  return useQuery({
    queryKey: [entity],
    queryFn: fetchFn,
    enabled: !!entity,
  });
}