"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/src/components/ui/form";
import { Checkbox } from "@/src/components/ui/checkbox";
import { useEmployeeEditStore } from "@/src/stores/employeeEditStore";
import { useLanguage } from "@/src/providers/LanguageProvider";

export default function FlagsForm({
  flagForm,
  flagsFormSchema,
  handleFinalSubmit,
  loading,
  selectedRowData,
}: {
  flagForm: any;
  flagsFormSchema: any;
  handleFinalSubmit: () => void;
  loading: boolean;
  selectedRowData?: any;
}) {
  
  const router = useRouter();
  const { translations } = useLanguage();
  const isEditing = !!selectedRowData;
  const clearSelectedRowData = useEmployeeEditStore((state) => state.clearSelectedRowData);
  
  return (
    <Form {...flagForm} className="w-11/12 mx-auto">
      {/* <form> */}
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col">
            <div className="flex justify-between items-start gap-20">
              {/* LEFT COLUMN FLAGS */}
              <div className="flex flex-col flex-1 gap-5">
                {[
                  ["active_flag", "Active"],
                  ["punch_flag", "Punch"],
                  ["overtime_flag", "Overtime"],
                  ["inpayroll_flag", "Inpayroll"],
                  ["email_notification_flag", "Email notification"],
                  ["open_shift_flag", "Open shift"],
                  ["geofench_flag", "Geo Fench"],
                  ["calculate_monthly_missed_hrs_flag", "Calculate monthly missed hours"],
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
                              checked={!!field.value}
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
                  ["exclude_from_integration_flag", "Exclude from integration"],
                  ["on_report_flag", "On report"],
                  ["share_roster_flag", "Share roster"],
                  ["include_email_flag", "Include in email"],
                  ["web_punch_flag", "Web punch"],
                  ["shift_flag", "Shift"],
                  ["check_inout_selfie_flag", "Check In/Out selfie"],
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
                              checked={!!field.value}
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
                onClick={() => {
                  clearSelectedRowData();
                  router.push("/employee-master/employee");
                }}
              >
                {translations.buttons.cancel}
              </Button>
              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={() => handleFinalSubmit()}
              >
                {loading ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update" : "Save")}
              </Button>
            </div>
          </div>
        </div>
      {/* </form> */}
    </Form>
  );
}