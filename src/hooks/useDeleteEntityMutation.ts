import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import { useLanguage } from "@/src/providers/LanguageProvider";

export function useDeleteEntityMutation({
  onSelectionClear,
  onSuccess: customOnSuccess,
}: { 
  onSelectionClear?: () => void;
  onSuccess?: (result: any, variables: { entityName: string; ids: (string | number)[] }) => void;
} = {}) {
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const { translations } = useLanguage();

  const formatEntityName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getEntityDisplayName = (entityName: string) => {
    const subModules = translations?.sub_modules || {};
    const key = entityName.toLowerCase();
    const pluralKey = key.endsWith("s") ? key : key + "s";

    const translatedName = subModules[key] || subModules[pluralKey];
    
    return translatedName || formatEntityName(entityName);
  };

  return useMutation({
    mutationFn: async ({
      entityName,
      ids,
    }: { entityName: string; ids: (string | number)[] }) => {
      if (ids.length === 1) {
        return apiRequest(`/${entityName}/delete/${String(ids[0])}`, "DELETE");
      } else {
        return apiRequest(`/${entityName}/delete`, "DELETE", { ids });
      }
    },
    onSuccess: (result, variables) => {
      const displayText = getEntityDisplayName(variables.entityName);
      const count = variables.ids.length;

      if (count === 1) {
        showToast("success", "delete_success", { displayText });
      } else {
        showToast("success", "delete_multiple_success", { displayText, count });
      }

      queryClient.invalidateQueries({ queryKey: [variables.entityName] });
      onSelectionClear?.();
      
      customOnSuccess?.(result, variables);
    },
    onError: (error: any, variables) => {
      const displayText = getEntityDisplayName(variables.entityName);
      console.error("Delete operation failed:", error);
      
      let errorMessage = null;
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorMessage) {
        showToast("error", errorMessage, null, false);
      } else {
        showToast("error", "delete_error", { displayText });
      }
    },
  });
}