"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
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

import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { addEmployeeRequest, editEmployeeRequest, addSecUserRequest, getSecUserByEmployeeId } from "@/lib/apiHandler";

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
  const { modules, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState("personal-form");

  const { form: personalForm, schema: personalSchema } = usePersonalForm();
  const { form: credentialsForm, schema: credentialsSchema } = useCredentialsForm();
  const { form: officialForm, schema: officialSchema } = useOfficialForm();
  const { form: flagsForm, schema: flagsSchema } = useFlagsForm();

  const [editMode, setEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState<any>(null);

  useEffect(() => {
    const isEdit = sessionStorage.getItem("editEmployeeData");

    if (!isEdit) {
      sessionStorage.removeItem("editEmployeeData");
    }
  }, []);

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
  };

  // const mutation = useMutation({
  //   mutationFn: createEmployeeWithCredentials,
  //   onSuccess: () => {
  //     toast.success("Employee and user credentials created!");
  //     personalForm.reset();
  //     credentialsForm.reset();
  //     officialForm.reset();
  //     flagsForm.reset();
  //     setActiveStep("personal-form");
  //   },
  //   onError: (error) => {
  //     console.error("Submission Error:", error);
  //     toast.error("Something went wrong. Please try again.");
  //   },
  // });

  useEffect(() => {
    try{
    const storedData = sessionStorage.getItem("editEmployeeData");

    if (storedData) {
      const parsed = JSON.parse(storedData);
      setEditEmployeeData(parsed);
      setEditMode(true);

      const convertToDate = (val: any) =>
        val && typeof val === "string" ? new Date(val) : val;

      // Prefill all forms with existing values
      personalForm.reset({
        ...parsed,
        firstname: parsed.firstname_eng || parsed.firstname_arb || "",
        lastname: parsed.lastname_eng || parsed.lastname_arb || "",
        join_date: convertToDate(parsed.join_date),
        active_date: convertToDate(parsed.active_date),
        inactive_date: convertToDate(parsed.inactive_date),
        national_id_expiry_date: convertToDate(parsed.national_id_expiry_date),
        passport_expiry_date: convertToDate(parsed.passport_expiry_date),
        passport_issue_country_Id: parsed.passport_issue_country_Id ?? undefined,
      });
      officialForm.reset(parsed);
      flagsForm.reset(parsed);

      if (parsed.employee_id) {
        getSecUserByEmployeeId(parsed.employee_id)
          .then((res) => {
            const secUser = res.data;
            console.log(secUser);
            credentialsForm.reset({
              username: secUser.login,  // adjust keys as per your API response
              password: secUser.password, // usually password won't come plain, so keep empty or mask
            });
          })
          .catch((err) => {
            console.error("Failed to fetch secuser", err);
            // fallback reset without secuser data
            credentialsForm.reset({
              username: "",
              password: "",
            });
          });
      } else {
        // fallback reset without secuser data
        credentialsForm.reset({
          username: "",
          password: "",
        });
      }
    } else {
      // ⚠️ Important: Reset if not editing
      setEditMode(false);
      setEditEmployeeData(null);

      personalForm.reset();
      credentialsForm.reset();
      officialForm.reset();
      flagsForm.reset();
    }
  } catch (err) {
    console.warn("Invalid session data, clearing...");
    sessionStorage.removeItem("editEmployeeData");
  }
}, []);


  // useEffect(() => {
  //   const stored = sessionStorage.getItem("editEmployeeData");
  //   if (stored) {
  //     const employee = JSON.parse(stored);
  //     setEditMode(true);
  //     setEditEmployeeData(employee);

  //     personalForm.reset({
  //       emp_no: employee.emp_no,
  //       firstname: language === "en" ? employee.firstname_eng : employee.firstname_arb,
  //       lastname: language === "en" ? employee.lastname_eng : employee.lastname_arb,
  //       mobile: employee.mobile,
  //       email: employee.email,
  //       join_date: employee.join_date?.split("T")[0] || "",
  //       active_date: employee.active_date?.split("T")[0] || "",
  //       inactive_date: employee.inactive_date?.split("T")[0] || "",
  //       card_number: employee.card_number,
  //       pin: employee.pin,
  //       gender: employee.gender,
  //       national_id: employee.national_id,
  //       national_id_expiry_date: employee.national_id_expiry_date?.split("T")[0] || "",
  //       passport_number: employee.passport_number,
  //       passport_expiry_date: employee.passport_expiry_date?.split("T")[0] || "",
  //       passport_issue_country_Id: employee.passport_issue_country_Id,
  //       remarks: employee.remarks,
  //     });

  //     credentialsForm.reset({
  //       username: employee.email,
  //       password: "",
  //     });

  //     officialForm.reset({
  //       designation_id: employee.designation_id,
  //       grade_id: employee.grade_id,
  //       organization_id: employee.organization_id,
  //       location_id: employee.location_id,
  //       citizenship_id: employee.citizenship_id,
  //       employee_type_id: employee.employee_type_id,
  //       manager_id: employee.manager_id,
  //       manager_flag: employee.manager_flag,
  //     });

  //     flagsForm.reset({
  //       active_flag: employee.active_flag,
  //       punch_flag: employee.punch_flag,
  //       on_report_flag: employee.on_report_flag,
  //       include_email_flag: employee.include_email_flag,
  //       open_shift_flag: employee.open_shift_flag,
  //       overtime_flag: employee.overtime_flag,
  //       web_punch_flag: employee.web_punch_flag,
  //       shift_flag: employee.shift_flag,
  //       check_inout_selfie_flag: employee.check_inout_selfie_flag,
  //       calculate_monthly_missed_hrs_flag: employee.calculate_monthly_missed_hrs_flag,
  //       exclude_from_integration_flag: employee.exclude_from_integration_flag,
  //       inpayroll_flag: employee.inpayroll_flag,
  //       share_roster_flag: employee.share_roster_flag,
  //       geofench_flag: employee.geofench_flag,
  //     });

  //     setActiveStep("personal-form");
  //   }
  // }, []);

  const validateCurrentForm = async () => {
    switch (activeStep) {
      case "personal-form":
        return personalForm.trigger();
      case "credentials-form":
        return credentialsForm.trigger();
      case "official-form":
        return officialForm.trigger();
      case "flags-form":
        return flagsForm.trigger();
      default:
        return true;
    }
  };

  const mutation = useMutation({
    mutationFn: createEmployeeWithCredentials,
    onSuccess: () => {
      toast.success("Employee and user credentials created!");

      // Reset forms
      personalForm.reset();
      credentialsForm.reset();
      officialForm.reset();
      flagsForm.reset();

      // Clear edit mode if lingering
      setEditMode(false);
      setEditEmployeeData(null);
      sessionStorage.removeItem("editEmployeeData");

      setActiveStep("personal-form");
    },
    onError: (error) => {
      console.error("Submission Error:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleFinalSubmit = async () => {
    // Validate all form steps
    const isValid =
      (await personalForm.trigger()) &&
      (await credentialsForm.trigger()) &&
      (await officialForm.trigger()) &&
      (await flagsForm.trigger());

    if (!isValid) {
      toast.error("Please correct the errors before submitting.");
      return;
    }

    // Combine all form values
    const combined: EmployeeData = {
      ...personalForm.getValues(),
      ...credentialsForm.getValues(),
      ...officialForm.getValues(),
      ...flagsForm.getValues(),
    };

    // Transform for API (name and dates)
    const transformed = transformDatesForAPI(combined, language);

    try {
      if (editMode && editEmployeeData?.employee_id) {
        console.log("editEmployeeData:", editEmployeeData);
        await editEmployeeRequest({
          employee_id: editEmployeeData.employee_id,
          ...transformed,
        });

        toast.success("Employee updated successfully!");
        sessionStorage.removeItem("editEmployeeData");
        setEditMode(false);
        setEditEmployeeData(null);
      } else {
        // ➕ Add flow
        mutation.mutate(combined);
      }

      // Reset all forms
      personalForm.reset();
      credentialsForm.reset();
      officialForm.reset();
      flagsForm.reset();
      setActiveStep("personal-form");
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };



  // const handleFinalSubmit = async () => {
  //   const isValid =
  //     (await personalForm.trigger()) &&
  //     (await credentialsForm.trigger()) &&
  //     (await officialForm.trigger()) &&
  //     (await flagsForm.trigger());

  //   if (!isValid) {
  //     toast.error("Please correct the errors before submitting.");
  //     return;
  //   }

  //   const data: EmployeeData = {
  //     ...personalForm.getValues(),
  //     ...credentialsForm.getValues(),
  //     ...officialForm.getValues(),
  //     ...flagsForm.getValues(),
  //   };

  //   mutation.mutate(data);
  // };

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
          editMode={editMode} 
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
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.employeeMaster.items}
        disableFeatures
        modal_title="Employee"
      />

      <PowerMultiStepCard
        SetPage={setActiveStep}
        Page={activeStep}
        validateCurrentForm={validateCurrentForm}
        Pages={Pages}
      />
    </div>
  );
}
