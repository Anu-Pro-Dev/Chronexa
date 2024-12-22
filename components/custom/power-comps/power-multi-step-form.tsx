import React, { useState } from "react";

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
    <div className="flex flex-col gap-1 bg-white p-6 rounded-md">
      {Pages?.map((page: any, index: number) => (
        <div key={index}>
          {page?.state_route === Page && (
            <div className="cursor-pointer">
              <h1 className="text-primary font-bold">{page?.title}</h1>
              <h1 className="text-secondary">{page?.description}</h1>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-10 mt-2">
        {Pages?.map((page: any, index: number) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => page.disable === false && SetPage(page?.state_route)}
          >
            <h1
              className={`${
                page?.state_route === Page &&
                "border-b  border-primary text-primary font-bold"
              }
              ${page.disable === true && "cursor-not-allowed"}
              `}
            >
              {page.title}
            </h1>
          </div>
        ))}
      </div>

      <div className="pt-4 w-10/12 mx-auto">
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
