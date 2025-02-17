import React, { useState } from "react";
import { cn } from "@/lib/utils";

export default function PowerMultiStepForm({
  Pages,
  Page,
  SetPage,
}: {
  Pages: any;
  Page: any;
  SetPage: any;
}) {
  return (
    <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl">
      {Pages?.map((page: any, index: number) => (
        <div key={index}>
          {page?.state_route === Page && (
            <>
              <h1 className="font-bold text-xl text-primary">{page?.title}</h1>
              <h1 className="font-semibold text-sm text-text-secondary">{page?.description}</h1>
            </>
          )}
        </div>
      ))}

      <div className="flex gap-14 border-b border-border-accent">
        {Pages?.map((page: any, index: number) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => page.disable === false && SetPage(page?.state_route)}
          >
            <h1
              className={cn(
                "text-text-secondary font-medium text-base py-2",
                page?.state_route === Page && "border-b-[2px] border-primary text-primary font-bold py-2",
                page.disable && "cursor-not-allowed"
              )}
            >
              {page.title}
            </h1>
          </div>
        ))}
      </div>

      <div className="p-5 flex flex-col">
        {Pages?.map((page: any, index: number) => (
          <div key={index}>
            {page?.state_route === Page && (
              <div>
                <div>{page.component}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
