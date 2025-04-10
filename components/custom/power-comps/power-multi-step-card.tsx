import React, { useEffect, useState, ReactNode, MemoExoticComponent } from "react";
import { cn } from "@/lib/utils";

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
  const [visiblePages, setVisiblePages] = useState<string[]>([]);

  useEffect(() => {
    if (!visiblePages.includes(Page)) {
      setVisiblePages((prev: string[]) => [...prev, Page]);
    }
  }, [Page, visiblePages]);

  const handleTabChange = async (newPage: string) => {
    if (validateCurrentForm) {
      const isFormValid = await validateCurrentForm();
      if (!isFormValid) return;
    }

    if (!visiblePages.includes(newPage)) {
      setVisiblePages((prev: string[]) => [...prev, newPage]);
    }

    SetPage(newPage);
  };

  return (
    <div className="flex flex-col gap-6">
      {visiblePages.map((route: string) => {
        const page = Pages.find((p) => p.state_route === route);
        if (!page) return null;

        const isCurrentPage = Page === page.state_route;

        return (
          <div
            key={page.state_route}
            className={cn(
              "bg-white p-6 rounded-2xl transition-all duration-300",
              !isCurrentPage && "cursor-pointer"
            )}
            onClick={() => {
              if (!isCurrentPage) SetPage(page.state_route);
            }}
          >
            <h1 className="font-bold text-xl text-primary">{page.title}</h1>
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