"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/src/components/ui/form";
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
  const { language, translations, dir } = useLanguage();
  const t = translations?.modules?.employeeMaster || {};
  const isEditing = !!selectedRowData;
  const clearSelectedRowData = useEmployeeEditStore(
    (state) => state.clearSelectedRowData
  );

  const leftColumnFlags = [
    ["active_flag", t.active || "Active"],
    ["punch_flag", t.punch || "Punch"],
    ["overtime_flag", t.overtime || "Overtime"],
    ["inpayroll_flag", t.in_payroll || "Inpayroll"],
    ["email_notification_flag", t.email_notification || "Email notification"],
    ["open_shift_flag", t.open_shift || "Open shift"],
    ["geofence_flag", t.geo_fence || "Geo Fence"],
    ["SAP_user_flag", "SAP user"],
    [
      "calculate_monthly_missed_hrs_flag",
      t.cal_monthly_missed_hrs || "Calculate monthly missed hours",
    ],
  ];

  const rightColumnFlags = [
    [
      "exclude_from_integration_flag",
      t.exclude_integration || "Exclude from integration",
    ],
    ["on_reports_flag", t.on_report || "On report"],
    ["share_roster_flag", t.share_roster || "Share roster"],
    ["include_email_flag", t.include_email || "Include in email"],
    ["web_punch_flag", t.web_punch || "Web punch"],
    ["shift_flag", t.shift || "Shift"],
    [
      "check_inout_selfie_flag",
      t.check_in_out_selfie || "Check In/Out selfie",
    ],
    ["local_user_flag", "Local user"],
  ];

  const toBoolean = (value: any): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1";
    }
    return false;
  };

  return (
    <Form {...flagForm} className="w-11/12 mx-auto">
      <div className="mb-3 relative">
        <p
          className={`text-xs text-primary border border-blue-200 rounded-md px-2 py-1 font-semibold bg-blue-400 bg-opacity-10 absolute -top-[25px] ${
            dir === "rtl" ? "left-0" : "right-0"
          }`}
        >
          {t.flags_note ||
            "Note: Active, Punch & On report flags should be enabled."}
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <div className="p-5 flex flex-col">
          <div className="flex justify-between items-start gap-20">
            <div className="flex flex-col flex-1 gap-5">
              {leftColumnFlags.map(([name, label]) => (
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
                            checked={toBoolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel
                            htmlFor={name}
                            className="text-sm font-semibold"
                          >
                            {label}
                          </FormLabel>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="flex flex-col flex-1 gap-5">
              {rightColumnFlags.map(([name, label]) => (
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
                            checked={toBoolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel
                            htmlFor={name}
                            className="text-sm font-semibold"
                          >
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
              {loading
                ? isEditing
                  ? translations.buttons.updating
                  : translations.buttons.saving
                : isEditing
                ? translations.buttons.update
                : translations.buttons.save}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
}