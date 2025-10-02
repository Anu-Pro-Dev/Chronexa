import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/apiHandler";
import { useShowToast } from "@/src/utils/toastHelper";
import { useLanguage } from "@/src/providers/LanguageProvider";

export function useDeleteEntityMutation({
  onSelectionClear,
}: { onSelectionClear?: () => void } = {}) {
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const { translations } = useLanguage();

  const getEntityDisplayName = (entityName: string) => {
    const subModules = translations?.sub_modules || {};
    const key = entityName.toLowerCase();
    const pluralKey = key.endsWith("s") ? key : key + "s";

    return subModules[key] || subModules[pluralKey] || entityName;
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
    onSuccess: (_result, variables) => {
      const displayText = getEntityDisplayName(variables.entityName);
      const count = variables.ids.length;

      if (count === 1) {
        showToast("success", "delete_success", { displayText });
      } else {
        showToast("success", "delete_multiple_success", { displayText, count });
      }

      queryClient.invalidateQueries({ queryKey: [variables.entityName] });
      onSelectionClear?.();
    },
    onError: (error, variables) => {
      const displayText = getEntityDisplayName(variables.entityName);
      console.error("Delete operation failed:", error);
      showToast("error", "form_error", { displayText });
    },
  });
}
