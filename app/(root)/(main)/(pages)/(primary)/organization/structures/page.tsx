"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const content = [
    {
      sl_no: 1,
      title: "Chairman",
      items: [
        {
          title: "CHAIRMAN 1",
        },
        {
          title: "CHAIRMAN 2",
        },
      ],
    },
    {
      sl_no: 2,
      title: "Undersecretary",
      items: [
        {
          title: "Undersecretary 1",
        },
        {
          title: "Undersecretary 2",
        },
      ],
    },
    {
      sl_no: 3,
      title: "Corporate Support Service Centre",
      items: [
        {
          title: "CHAIRMAN 1",
        },
        {
          title: "CHAIRMAN 2",
        },
      ],
    },
    {
      sl_no: 4,
      title: "Government Procurement Office",
      items: [
        {
          title: "CHAIRMAN 1",
        },
        {
          title: "CHAIRMAN 2",
        },
      ],
    },
    {
      sl_no: 5,
      title: "Innovation and Future Foresight Sector",
      items: [
        {
          title: "CHAIRMAN 1",
        },
        {
          title: "CHAIRMAN 2",
        },
      ],
    },
    {
      sl_no: 6,
      title: "Policies Sector",
      items: [
        {
          title: "CHAIRMAN 1",
        },
        {
          title: "CHAIRMAN 2",
        },
      ],
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.organization.items}
        disableAdd
        disableDelete
        disableSearch
      />

      <div className="flex bg-primary p-3 w-96 rounded-md">
        <h1 className="text-primary-50">DEMO - DEMO</h1>
      </div>

      <Accordion
        type="multiple"
        className="lg:w-8/12 mx-auto flex flex-col gap-4 pt-4"
      >
        {content?.map((item: any, index: number) => (
          <AccordionItem value={item?.sl_no} key={index}>
            <AccordionTrigger className="bg-primary-100 p-4 ps-6 text-primary border border-primary-50 rounded-md">
              0{index + 1} - {item.title}
            </AccordionTrigger>
            <AccordionContent>
              {item.items?.map((subItem: any, subIndex: number) => (
                <div key={subIndex} className="bg-green-100 p-3 ">
                  <p>{subItem.title}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
