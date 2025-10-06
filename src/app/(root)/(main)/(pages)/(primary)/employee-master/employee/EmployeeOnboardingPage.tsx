"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { z } from "zod";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import PowerMultiStepCard from "@/src/components/custom/power-comps/power-multi-step-card";

import { usePersonalForm, personalFormSchema } from "@/src/components/custom/modules/employee-master/hooks/usePersonalForm";
import { useCredentialsForm, credentialsFormSchema } from "@/src/components/custom/modules/employee-master/hooks/useCredentialsForm";
import { useOfficialForm, officialFormSchema } from "@/src/components/custom/modules/employee-master/hooks/useOfficialForm";
import { useFlagsForm, flagsFormSchema } from "@/src/components/custom/modules/employee-master/hooks/useFlagsForm";

import PersonalForm from "@/src/components/custom/modules/employee-master/PersonalForm";
import CredentialsForm from "@/src/components/custom/modules/employee-master/CredentialsForm";
import OfficialForm from "@/src/components/custom/modules/employee-master/OfficialForm";
import FlagsForm from "@/src/components/custom/modules/employee-master/FlagsForm";

import {
  addEmployeeRequest,
  editEmployeeRequest,
  addSecUserRequest,
  getSecUserByEmployeeId,
} from "@/src/lib/apiHandler";

import { useEmployeeEditStore } from "@/src/stores/employeeEditStore";
import { useShowToast } from "@/src/utils/toastHelper";

type EmployeeData =
  z.infer<typeof personalFormSchema> &
  z.infer<typeof credentialsFormSchema> &
  z.infer<typeof officialFormSchema> &
  z.infer<typeof flagsFormSchema>;

const transformDatesForAPI = (data: any, language: any) => {
  const transformed = { ...data };

  if (data.firstname && data.lastname) {
    if (language === "en") {
      transformed.firstname_eng = data.firstname;
      transformed.lastname_eng = data.lastname;
    } else {
      transformed.firstname_arb = data.firstname;
      transformed.lastname_arb = data.lastname;
    }
    
    delete transformed.firstname;
    delete transformed.lastname;
  }

  return transformed;
};

export default function EmployeeOnboardingPage({ mode, id }: { mode: "add" | "edit"; id?: string | null }) {  
  const router = useRouter();
  const { modules, language, translations } = useLanguage();
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("personal-form");

  const { form: personalForm, schema: personalSchema } = usePersonalForm();
  const { form: credentialsForm, schema: credentialsSchema } = useCredentialsForm();
  const { form: officialForm, schema: officialSchema } = useOfficialForm();
  const { form: flagsForm, schema: flagsSchema } = useFlagsForm();

  const selectedRowData = useEmployeeEditStore((state) => state.selectedRowData);
  const clearSelectedRowData = useEmployeeEditStore((state) => state.clearSelectedRowData);

  const resetAllForms = () => {
    personalForm.reset();
    credentialsForm.reset();
    officialForm.reset();
    flagsForm.reset();
    setActiveStep("personal-form");
  };

  useEffect(() => {
    if (!selectedRowData) {
      clearSelectedRowData();
      resetAllForms();
    }
  }, []);

  useEffect(() => {
    if (selectedRowData) {
      const convertToDate = (val: any) =>
        val && typeof val === "string" ? new Date(val) : val;

      const firstName = language === "en" 
        ? selectedRowData.firstname_eng || selectedRowData.firstname_arb || ""
        : selectedRowData.firstname_arb || selectedRowData.firstname_eng || "";
      
      const lastName = language === "en" 
        ? selectedRowData.lastname_eng || selectedRowData.lastname_arb || ""
        : selectedRowData.lastname_arb || selectedRowData.lastname_eng || "";

      personalForm.reset({
        emp_no: selectedRowData.emp_no ?? "",
        firstname: firstName,
        lastname: lastName,
        mobile: selectedRowData.mobile ?? "",
        email: selectedRowData.email ?? "",
        card_number: selectedRowData.card_number ?? "",
        pin: selectedRowData.pin ?? "",
        gender: selectedRowData.gender ?? "",
        passport_number: selectedRowData.passport_number ?? "",
        passport_issue_country_id: selectedRowData.passport_issue_country_id ?? undefined,
        national_id: selectedRowData.national_id ?? "",
        remarks: selectedRowData.remarks ?? "",
        join_date: convertToDate(selectedRowData.join_date),
        active_date: convertToDate(selectedRowData.active_date),
        passport_expiry_date: convertToDate(selectedRowData.passport_expiry_date),
        national_id_expiry_date: convertToDate(selectedRowData.national_id_expiry_date),
        inactive_date: convertToDate(selectedRowData.inactive_date),
      });

      officialForm.reset({
        employee_type_id: selectedRowData.employee_type_id ?? undefined,
        location_id: selectedRowData.location_id ?? undefined,
        citizenship_id: selectedRowData.citizenship_id ?? undefined,
        designation_id: selectedRowData.designation_id ?? undefined,
        grade_id: selectedRowData.grade_id ?? undefined,
        organization_id: selectedRowData.organization_id ?? undefined,
        manager_id: selectedRowData.manager_id ?? undefined,
        manager_flag: selectedRowData.manager_flag ?? false,
      });

      flagsForm.reset({
        active_flag: selectedRowData.active_flag ?? true,
        punch_flag: selectedRowData.punch_flag ?? true,
        overtime_flag: selectedRowData.overtime_flag ?? false,
        inpayroll_flag: selectedRowData.inpayroll_flag ?? false,
        email_notification_flag: selectedRowData.email_notification_flag ?? false,
        open_shift_flag: selectedRowData.open_shift_flag ?? false,
        calculate_monthly_missed_hrs_flag: selectedRowData.calculate_monthly_missed_hrs_flag ?? false,
        exclude_from_integration_flag: selectedRowData.exclude_from_integration_flag ?? false,
        shift_flag: selectedRowData.shift_flag ?? false,
        on_reports_flag: selectedRowData.on_reports_flag ?? true,
        share_roster_flag: selectedRowData.share_roster_flag ?? false,
        include_email_flag: selectedRowData.include_email_flag ?? false,
        web_punch_flag: selectedRowData.web_punch_flag ?? false,
        check_inout_selfie_flag: selectedRowData.check_inout_selfie_flag ?? false,
        geofence_flag: selectedRowData.geofence_flag ?? false,
        SAP_user_flag: selectedRowData.SAP_user_flag ?? false,
        local_user_flag: selectedRowData.local_user_flag ?? false,
      });

      if (selectedRowData.employee_id) {
        getSecUserByEmployeeId(selectedRowData.employee_id)
          .then((res) => {
            credentialsForm.reset({
              username: res.data.login || "",
              password: res.data.password || "p@ssw0rd",
            });
          })
          .catch(() => {
            credentialsForm.reset({
              username: "",
              password: "",
            });
          });
      } else {
        credentialsForm.reset({
          username: "",
          password: "",
        });
      }
    } else {
      resetAllForms();
      clearSelectedRowData();
    }
  }, [selectedRowData, language]); 

  const createEmployeeWithCredentials = async (data: EmployeeData) => {
    const transformed = transformDatesForAPI(data, language);
    const employeeResponse = await addEmployeeRequest(transformed);
    const employee_id = employeeResponse?.data?.employee_id;

    if (!employee_id) throw new Error("Employee ID not returned");

    const login = data.username;
    const password = data.password;

    if (!login || !password) throw new Error("Missing credentials");

    await addSecUserRequest({ employee_id, login, password });

    return employeeResponse;
  }

  const addMutation = useMutation({
    mutationFn: createEmployeeWithCredentials,
    onSuccess: () => {
      setLoading(false);
      showToast("success", "employee_created_success");
      clearSelectedRowData();
      resetAllForms();
      router.push("/employee-master/employee");
    },
    onError: (error) => {
      setLoading(false);
      console.error("Submission Error:", error);
      showToast("error", "formsubmission_error");
    },
  });

  const editMutation = useMutation({
    mutationFn: editEmployeeRequest,
    onSuccess: () => {
      setLoading(false);
      showToast("success", "employee_updated_success");
      clearSelectedRowData();
      resetAllForms();
      router.push("/employee-master/employee");
    },
    onError: (error) => {
      setLoading(false);
      clearSelectedRowData();
      console.error("Submission Error:", error);
      showToast("error", "employee_update_failed");
    },
  });

  const extractErrorsFromForm = (form: any, formLabel: string) => {
    const errs = form.formState?.errors || {};
    const messages: string[] = [];

    const traverse = (obj: any, path = "") => {
      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const val = obj[key];
        const newPath = path ? `${path}.${key}` : key;
        if (val?.message) {
          messages.push(`${formLabel}: ${newPath} — ${String(val.message)}`);
        } else if (typeof val === "object") {
          traverse(val, newPath);
        }
      }
    };

    traverse(errs);
    return messages;
  };

  const validateCurrentForm = async () => {
    const isEdit = !!selectedRowData?.employee_id;
    let isValid = false;

    switch (activeStep) {
      case "personal-form":
        isValid = await personalForm.trigger();
        if (!isValid) {
          const msgs = extractErrorsFromForm(personalForm, "Personal");
          showToast("error", "validation_error", msgs.slice(0, 3).join(" | ") || undefined);
        }
        break;

      case "credentials-form":
        if (isEdit) {
          isValid = true;
        } else {
          isValid = await credentialsForm.trigger();
          if (!isValid) {
            const msgs = extractErrorsFromForm(credentialsForm, "Credentials");
            showToast("error", "validation_error", msgs.slice(0, 3).join(" | ") || undefined);
          }
        }
        break;

      case "official-form":
        isValid = await officialForm.trigger();
        if (!isValid) {
          const msgs = extractErrorsFromForm(officialForm, "Official");
          showToast("error", "validation_error", msgs.slice(0, 3).join(" | ") || undefined);
        }
        break;

      case "flags-form":
        isValid = await flagsForm.trigger();
        if (!isValid) {
          const msgs = extractErrorsFromForm(flagsForm, "Flags");
          showToast("error", "validation_error", msgs.slice(0, 3).join(" | ") || undefined);
        }
        break;

      default:
        isValid = true;
    }

    return isValid;
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const isEdit = !!selectedRowData?.employee_id;

    const personalValid = await personalForm.trigger();
    const officialValid = await officialForm.trigger();
    const flagsValid = await flagsForm.trigger();
    const credentialsValid = isEdit ? true : await credentialsForm.trigger();

    const isValid = personalValid && officialValid && flagsValid && credentialsValid;

    if (!isValid) {
      const messages: string[] = [];
      if (!personalValid) messages.push(...extractErrorsFromForm(personalForm, "Personal"));
      if (!officialValid) messages.push(...extractErrorsFromForm(officialForm, "Official"));
      if (!flagsValid) messages.push(...extractErrorsFromForm(flagsForm, "Flags"));
      if (!isEdit && !credentialsValid) messages.push(...extractErrorsFromForm(credentialsForm, "Credentials"));

      const toShow = messages.length ? messages.slice(0, 5).join(" | ") : undefined;
      showToast("error", "validation_error", toShow);
      setLoading(false);
      return;
    }

    const personalData = personalForm.getValues();
    const credentialsData = credentialsForm.getValues();
    const officialData = officialForm.getValues();
    const flagsData = flagsForm.getValues();

    let combined = {
      ...personalData,
      ...credentialsData,
      ...officialData,
      ...flagsData,
    };

    combined = transformDatesForAPI(combined, language);

    if (selectedRowData?.employee_id) {
      const { username, password, ...rest } = combined;

      editMutation.mutate({
        employee_id: selectedRowData.employee_id,
        ...rest,
      });
    } else {
      addMutation.mutate(combined);
    }
  };

  const Pages = [
    {
      title: translations?.modules?.employeeMaster?.personal || "Personal",
      state_route: "personal-form",
      disable: false,
      component: (
        <PersonalForm
          Page={activeStep}
          SetPage={setActiveStep}
          personalFormSchema={personalSchema}
          personalForm={personalForm}
        />
      ),
    },
    {
      title: translations?.modules?.employeeMaster?.credentials || "Credentials",
      state_route: "credentials-form",
      disable: false,
      component: (
        <CredentialsForm
          Page={activeStep}
          SetPage={setActiveStep}
          credentialsFormSchema={credentialsSchema}
          credentialsForm={credentialsForm}
          selectedRowData={selectedRowData}
        />
      ),
    },
    {
      title: translations?.modules?.employeeMaster?.official || "Official",
      state_route: "official-form",
      disable: false,
      component: (
        <OfficialForm
          Page={activeStep}
          SetPage={setActiveStep}
          officialFormSchema={officialSchema}
          officialForm={officialForm}
        />
      ),
    },
    {
      title: translations?.modules?.employeeMaster?.flags || "Flags",
      state_route: "flags-form",
      disable: false,
      component: (
        <FlagsForm
          flagForm={flagsForm}
          flagsFormSchema={flagsSchema}
          handleFinalSubmit={handleFinalSubmit}
          loading={loading}
          selectedRowData={selectedRowData}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.employeeMaster.items} disableFeatures modal_title="Employee" />

      <PowerMultiStepCard
        SetPage={setActiveStep}
        Page={activeStep}
        validateCurrentForm={validateCurrentForm}
        Pages={Pages}
      />
    </div>
  );
}