import { useMutation, useQueryClient } from "@tanstack/react-query";
import { camelToSnake, camelToSentence } from "@/utils/caseConverters";
import toast from "react-hot-toast";
import { apiRequest } from "./apiHandler";

export function useDeleteEntityMutation({
  onSelectionClear,
}: {
  onSelectionClear?: () => void;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityName,
      ids,
    }: {
      entityName: string;
      ids: (string | number)[];
    }) => {
      // Check if it's single or multiple deletion
      if (ids.length === 1) {
        // Single deletion: DELETE /{entityName}/delete/{id}
        return apiRequest(`/${entityName}/delete/${String(ids[0])}`, "DELETE");
      } else {
        // Multiple deletion: POST /{entityName}/delete with body {"ids": [...]}
        return apiRequest(`/${entityName}/delete`, "POST", {
          ids: ids
        });
      }
    },
    onSuccess: (result, variables) => {
      const displayText = camelToSentence(variables.entityName);
      const count = variables.ids.length;
      
      toast.success(
        `${count} ${displayText}${count > 1 ? 's' : ''} deleted successfully!`
      );
      
      queryClient.invalidateQueries({
        queryKey: [variables.entityName],
      });
      onSelectionClear?.();
    },
    onError: (error, variables) => {
      const displayText = camelToSentence(variables.entityName);
      console.error('Delete operation failed:', error);
      toast.error(`Failed to delete ${displayText}(s).`);
    },
  });
}