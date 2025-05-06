import React, {
  useState,
  ReactNode,
  MemoExoticComponent,
} from "react";
import { cn } from "@/lib/utils";
import { DropDownIcon } from "@/icons/icons";
import toast from "react-hot-toast";

interface PageType {
  state_route: string;
  title: string;
  component: ReactNode | MemoExoticComponent<() => React.JSX.Element>;
  disable?: boolean;
}

interface MultiStepCardProps {
  Pages: PageType[];
  Page: string;
  SetPage: (page: string) => void;
  validateCurrentForm?: () => Promise<boolean>;
}

export default function PowerMultiStepCard({
  Pages,
  Page,
  SetPage,
  validateCurrentForm,
}: MultiStepCardProps) {
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  
  const handleTabChange = async (newPage: string) => {
    // Skip validation if returning to a previous step
    const currentIndex = Pages.findIndex((p) => p.state_route === Page);
    const nextIndex = Pages.findIndex((p) => p.state_route === newPage);
    const goingForward = nextIndex > currentIndex;

    if (goingForward && validateCurrentForm) {
      const isFormValid = await validateCurrentForm();
      if (!isFormValid) {
        toast.error("Please complete this step before moving on.");
        setFormErrors((prev) => ({ ...prev, [Page]: true }));
        return;
      } else {
        setFormErrors((prev) => ({ ...prev, [Page]: false }));
      }
    }

    SetPage(newPage);
  };

  return (
    <div className="flex flex-col gap-6">
      {Pages.map((page) => {
        const isCurrentPage = Page === page.state_route;
        const hasError = formErrors[page.state_route];

        return (
          <div
            key={page.state_route}
            className={cn(
              "bg-accent transition-all duration-300 rounded-xl",
              isCurrentPage ? "p-6" : "cursor-pointer py-4 px-6",
            )}
            onClick={() => {
              if (!isCurrentPage) handleTabChange(page.state_route);
            }}
          >
            <h1 className="font-bold text-xl text-primary flex items-center justify-between">
              {page.title}
              {!isCurrentPage && <DropDownIcon width="26px" height="36px" />}
            </h1>

            {isCurrentPage &&
              React.cloneElement(page.component as React.ReactElement<any>, {
                handleTabChange,
              })}
          </div>
        );
      })}
    </div>
  );
}
