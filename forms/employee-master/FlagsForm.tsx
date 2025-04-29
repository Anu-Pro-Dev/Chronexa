"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export default function FlagsForm({
  flagForm,
  flagsFormSchema,
  handleFinalSubmit,
  loading,
}: {
  flagForm: any;
  flagsFormSchema: any;
  handleFinalSubmit: () => void;
  loading: boolean;
}) {
  const router = useRouter();

  const handleSaveAndRedirect = async () => {
    await handleFinalSubmit(); // Ensure the form is submitted
    router.push("/employee-master/users"); // Navigate to the user page after saving
  };

  return (
    <Form {...flagForm}>
      <form onSubmit={flagForm.handleSubmit(handleFinalSubmit)} className="w-11/12 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col">
            <div className="flex justify-between items-start gap-20">
              {/* LEFT COLUMN FLAGS */}
              <div className="flex flex-col flex-1 gap-5">
                {[
                  ["active", "Active"],
                  ["punch", "Punch"],
                  ["overtime", "Overtime"],
                  ["inpayroll", "Inpayroll"],
                  ["email_notification", "Email notification"],
                  ["open_shift", "Open shift"],
                  ["monthly_missed_hours", "Calculate monthly missed hours"],
                ].map(([name, label]) => (
                  <FormField
                    key={name}
                    control={flagForm.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FormLabel htmlFor={name} className="text-sm font-semibold">
                              {label}
                            </FormLabel>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* RIGHT COLUMN FLAGS */}
              <div className="flex flex-col flex-1 gap-5">
                {[
                  ["exclude_from_integration", "Exclude from integration"],
                  ["on_report", "On report"],
                  ["share_roster", "Share roster"],
                  ["include_in_email", "Include in email"],
                  ["web_punch", "Web punch"],
                  ["shift", "Shift"],
                  ["check_selfie", "Check In/Out selfie"],
                ].map(([name, label]) => (
                  <FormField
                    key={name}
                    control={flagForm.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FormLabel htmlFor={name} className="text-sm font-semibold">
                              {label}
                            </FormLabel>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 items-center py-5">
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                size="lg"
                className="w-full"
                onClick={() => router.push("/employee-master/users")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}