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
      return Promise.allSettled(
        ids.map(id =>
          apiRequest(`/${entityName}/delete/${String(id)}`, "DELETE")
        )
        // ids.map(id => deleteEntityRequest(entityName, String(id)))
      );
    },
    onSuccess: (results, variables) => {
      const displayText = camelToSentence(variables.entityName);
      const failedDeletes = results.filter(r => r.status === "rejected");
      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete some ${displayText}(s).`);
      } else {
        toast.success(`${displayText} deleted successfully!`);
      }
      queryClient.invalidateQueries({
        // queryKey: [camelToSnake(variables.entityName)],
        queryKey: [variables.entityName],
      });
      onSelectionClear?.();
    },
    onError: () => {
      toast.error("Failed to delete.");
    },
  });
}