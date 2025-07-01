"use client";

import React, { useState } from "react";
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
import { addEmployeeRequest, editEmployeeRequest, addSecUserRequest } from "@/lib/apiHandler";

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

  const mutation = useMutation({
    mutationFn: createEmployeeWithCredentials,
    onSuccess: () => {
      toast.success("Employee and user credentials created!");
      personalForm.reset();
      credentialsForm.reset();
      officialForm.reset();
      flagsForm.reset();
      setActiveStep("personal-form");
    },
    onError: (error) => {
      console.error("Submission Error:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });

  // const mutation = useMutation<any, Error, EmployeeData>({
  //   mutationFn: (data) => {
  //     const transformedData = transformDatesForAPI(data, language);
  //     return addEmployeeRequest(transformedData);
  //   },
  //   onSuccess: async (response) => {
  //     try {
  //       const employee_id = response?.data?.employee_id;
  //       const login = credentialsForm.getValues("username");
  //       const password = credentialsForm.getValues("password");

  //       if (employee_id && login && password) {
  //         await addSecUserRequest({ employee_id, login, password });
  //         toast.success("Employee and user credentials created!");
  //       } else {
  //         toast.error("Missing employee ID or credentials.");
  //       }

  //       // Reset all forms
  //       personalForm.reset();
  //       credentialsForm.reset();
  //       officialForm.reset();
  //       flagsForm.reset();
  //       setActiveStep("personal-form");
  //     } catch (error) {
  //       console.error("SecUser Creation Error:", error);
  //       toast.error("Employee created, but failed to create user credentials.");
  //     }
  //   },
  //   onError: (error) => {
  //     console.error("Submission Error:", error);
  //     toast.error("Something went wrong. Please try again.");
  //   },
  // });

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

  const handleFinalSubmit = async () => {
    const isValid =
      (await personalForm.trigger()) &&
      (await credentialsForm.trigger()) &&
      (await officialForm.trigger()) &&
      (await flagsForm.trigger());

    if (!isValid) {
      toast.error("Please correct the errors before submitting.");
      return;
    }

    const data: EmployeeData = {
      ...personalForm.getValues(),
      ...credentialsForm.getValues(),
      ...officialForm.getValues(),
      ...flagsForm.getValues(),
    };

    mutation.mutate(data);
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
