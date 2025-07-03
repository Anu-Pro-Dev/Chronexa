"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/providers/LanguageProvider";
import { z } from "zod";
import toast from "react-hot-toast";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerMultiStepCard from "@/components/custom/power-comps/power-multi-step-card";

import { usePersonalForm, personalFormSchema } from "@/forms/employee-master/hooks/usePersonalForm";
import { useCredentialsForm, credentialsFormSchema } from "@/forms/employee-master/hooks/useCredentialsForm";
import { useOfficialForm, officialFormSchema } from "@/forms/employee-master/hooks/useOfficialForm";
import { useFlagsForm, flagsFormSchema } from "@/forms/employee-master/hooks/useFlagsForm";

import PersonalForm from "@/forms/employee-master/PersonalForm";
import CredentialsForm from "@/forms/employee-master/CredentialsForm";
import OfficialForm from "@/forms/employee-master/OfficialForm";
import FlagsForm from "@/forms/employee-master/FlagsForm";

import {
  addEmployeeRequest,
  editEmployeeRequest,
  addSecUserRequest,
  getSecUserByEmployeeId,
} from "@/lib/apiHandler";

import { useEmployeeEditStore } from "@/stores/employeeEditStore";

type EmployeeData =
  z.infer<typeof personalFormSchema> &
  z.infer<typeof credentialsFormSchema> &
  z.infer<typeof officialFormSchema> &
  z.infer<typeof flagsFormSchema>;

const transformDatesForAPI = (data: any, language: any) => {
  const transformed = { ...data };

  // Handle name localization
  if (language === "en") {
    transformed.firstname_eng = data.firstname;
    transformed.lastname_eng = data.lastname;
  } else {
    transformed.firstname_arb = data.firstname;
    transformed.lastname_arb = data.lastname;
  }

  delete transformed.firstname;
  delete transformed.lastname;

  return transformed;
};

export default function EmployeeOnboardingPage() {
  const router = useRouter();
  const { modules, language } = useLanguage();
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

  // Prefill or reset forms based on selectedRowData (edit vs add)
  useEffect(() => {
    if (selectedRowData) {
      const convertToDate = (val: any) =>
        val && typeof val === "string" ? new Date(val) : val;

      personalForm.reset({
        emp_no: selectedRowData.emp_no ?? "",
        firstname: selectedRowData.firstname_eng || selectedRowData.firstname_arb || "",
        lastname: selectedRowData.lastname_eng || selectedRowData.lastname_arb || "",
        mobile: selectedRowData.mobile ?? "",
        email: selectedRowData.email ?? "",
        card_number: selectedRowData.card_number ?? "",
        pin: selectedRowData.pin ?? "",
        gender: selectedRowData.gender ?? "",
        passport_number: selectedRowData.passport_number ?? "",
        passport_issue_country_Id: selectedRowData.passport_issue_country_Id ?? undefined,
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
        active_flag: selectedRowData.active_flag ?? false,
        punch_flag: selectedRowData.punch_flag ?? false,
        overtime_flag: selectedRowData.overtime_flag ?? false,
        inpayroll_flag: selectedRowData.inpayroll_flag ?? false,
        email_notification_flag: selectedRowData.email_notification_flag ?? false,
        open_shift_flag: selectedRowData.open_shift_flag ?? false,
        calculate_monthly_missed_hrs_flag: selectedRowData.calculate_monthly_missed_hrs_flag ?? false,
        exclude_from_integration_flag: selectedRowData.exclude_from_integration_flag ?? false,
        shift_flag: selectedRowData.shift_flag ?? false,
        on_report_flag: selectedRowData.on_report_flag ?? false,
        share_roster_flag: selectedRowData.share_roster_flag ?? false,
        include_email_flag: selectedRowData.include_email_flag ?? false,
        web_punch_flag: selectedRowData.web_punch_flag ?? false,
        check_inout_selfie_flag: selectedRowData.check_inout_selfie_flag ?? false,
        geofench_flag: selectedRowData.geofench_flag ?? false,
      });

      if (selectedRowData.employee_id) {
        getSecUserByEmployeeId(selectedRowData.employee_id)
          .then((res) => {
            credentialsForm.reset({
              username: res.data.login || "",
              password: res.data.password || "p@ssw0rd", // don't reset password for security
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
  }, [selectedRowData]);

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

  // React Query mutation for adding employee + credentials
  const addMutation = useMutation({
    mutationFn: createEmployeeWithCredentials,
    onSuccess: () => {
      setLoading(false);
      toast.success("Employee and user credentials created!");
      clearSelectedRowData();
      resetAllForms();
      router.push("/employee-master/employee");
    },
    onError: (error) => {
      setLoading(false);
      console.error("Submission Error:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });

  // React Query mutation for editing employee (credentials update not handled here)
  const editMutation = useMutation({
    mutationFn: editEmployeeRequest,
    onSuccess: () => {
      setLoading(false);
      toast.success("Employee updated successfully!");
      clearSelectedRowData();
      resetAllForms();
      router.push("/employee-master/employee");
    },
    onError: (error) => {
      setLoading(false);
      clearSelectedRowData();
      console.error("Submission Error:", error);
      toast.error("Failed to update employee.");
    },
  });

  const validateCurrentForm = async () => {
    let isValid = false;
    
    switch (activeStep) {
      case "personal-form":
        isValid = await personalForm.trigger();
        if (!isValid) {
          toast.error("Please fix validation errors in Personal form.");
        }
        break;
      case "credentials-form":
        isValid = await credentialsForm.trigger();
        if (!isValid) {
          toast.error("Please fix validation errors in Credentials form.");
        }
        break;
      case "official-form":
        isValid = await officialForm.trigger();
        if (!isValid) {
          toast.error("Please fix validation errors in Official form.");
        }
        break;
      case "flags-form":
        isValid = await flagsForm.trigger();
        if (!isValid) {
          toast.error("Please fix validation errors in Flags form.");
        }
        break;
      default:
        isValid = true;
    }
    
    return isValid;
  };

  const handleFinalSubmit = async () => {
    setLoading(true);

    // Step 1: Validate all forms
    const isValid =
      (await personalForm.trigger()) &&
      (await credentialsForm.trigger()) &&
      (await officialForm.trigger()) &&
      (await flagsForm.trigger());

    if (!isValid) {
      toast.error("Please fix the validation errors.");
      setLoading(false);
      return;
    }

    // Step 2: Get all form data
    const personalData = personalForm.getValues();
    const credentialsData = credentialsForm.getValues();
    const officialData = officialForm.getValues();
    const flagsData = flagsForm.getValues();

    // Step 3: Merge all into one object
    let combined = {
      ...personalData,
      ...credentialsData,
      ...officialData,
      ...flagsData,
    };

    // Step 4: Transform names and dates
    combined = transformDatesForAPI(combined, language);

    if (selectedRowData?.employee_id) {
      // Step 5a: On edit — remove credentials
      const { username, password, ...rest } = combined;

      editMutation.mutate({
        employee_id: selectedRowData.employee_id,
        ...rest,
      });
    } else {
      // Step 5b: On add — send credentials too
      addMutation.mutate(combined);
    }
  };

  const Pages = [
    {
      title: "Personal",
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
      title: "Credentials",
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
      title: "Official",
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
      title: "Flags",
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
