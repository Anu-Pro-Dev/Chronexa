import React from "react";
import { cn } from "@/src/utils/utils";

interface PageType {
  state_route: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  disable?: boolean;
}

interface MultiStepFormProps {
  Pages: PageType[];
  Page: string;
  SetPage: (page: string) => void;
  validateCurrentForm?: () => Promise<boolean>
  onSubmit?: () => void;
}

export default function PowerMultiStepForm({ Pages, Page, SetPage, validateCurrentForm, onSubmit }: MultiStepFormProps) {

  const handleTabChange = async (newPage: string) => {
    if (validateCurrentForm) {
      const isFormValid = await validateCurrentForm()
      if (!isFormValid) {
        return
      }
    }
    SetPage(newPage)
  }

  return (
    <div className="flex flex-col gap-6 bg-accent p-6 rounded-2xl">
      {/* {Pages.filter((page) => page.state_route === Page).map((page) => (
        <div key={page.state_route}>
          <h1 className="font-bold text-xl text-primary">{page.title}</h1>
          {page.description && (
            <h1 className="font-semibold text-sm text-text-secondary">{page.description}</h1>
          )}
        </div>
      ))} */}

      <div className="flex gap-40 border-b border-border-accent">
        {Pages.map((page) => (
          <div
            key={page.state_route}
            className={cn(
              "cursor-pointer text-text-secondary font-medium text-base py-2",
              page.state_route === Page && "border-b-[2px] border-primary text-primary font-bold",
              page.disable && "cursor-not-allowed"
            )}
            onClick={async () => {
              if (!page.disable) {
                await handleTabChange(page.state_route); // Use the validation function if provided
              }
            }}
          >
            {page.title}
          </div>
        ))}
      </div>

      {Pages.filter((page) => page.state_route === Page).map((page) => (
        <div key={page.state_route} className="">
          {page.component}
        </div>
      ))}
    </div>
  );
}