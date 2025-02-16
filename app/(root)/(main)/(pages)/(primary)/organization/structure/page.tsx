"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
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
          title: "01-01 - Chairman Office",
        },
        {
          title: "01-02 - Internal Audit Office",
        },
        {
          title: "01-03 - Legal Affairs Office",
        },
        {
          title: "01-04 - Strategic Affairs Office",
        },
      ],
    },
    {
      sl_no: 2,
      title: "Undersecretary",
      items: [
        {
          title: "02-01 - Corporate Communication office",
        },
        {
          title: "02-02 - Under Secretary Office",
        },
        {
          title: "02-03 - Operations and follow-up Office",
        },
      ],
    },
    {
      sl_no: 3,
      title: "Corporate Support Service Centre",
      items: [
        {
          title: "03-01 - Finance & Accounting Department",
        },
        {
          title: "03-02 - General Services and Facilities Management Department",
        },
        {
          title: "03-03 - Human Capital Department",
        },
        {
          title: "03-04 - Information Technology Department",
        },
        {
          title: "03-05 - Contracts and Procurement",
        },
      ],
    },
    {
      sl_no: 4,
      title: "Government Procurement Office",
      items: [
        {
          title: "04-01 - Entity Services",
        },
        {
          title: "04-02 - Planning & Standards",
        },
        {
          title: "04-03 - Supplier Services",
        },
      ],
    },
    {
      sl_no: 5,
      title: "Innovation and Future Foresight Sector",
      items: [
        {
          title: "05-01 - Future Foresight and Research",
        },
        {
          title: "05-02 - Innovation lab & Partnerships",
        },
      ],
    },
    {
      sl_no: 6,
      title: "Policies Sector",
      items: [
        {
          title: "06-01 - Data & Statistics",
        },
        {
          title: "06-02 - Human Capital",
        },
        {
          title: "06-03 - Technology",
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
      <div className="bg-white p-10 rounded-2xl">
        <div className="flex bg-primary p-3 w-96 rounded-md justify-center">
          <h1 className="text-white font-lg font-bold uppercase">Chronologix Structure - Demo</h1>
        </div>
        <Accordion
          type="multiple"
          className="lg:w-8/12 flex flex-col gap-3 py-4 px-12"
        >
          {content?.map((item: any, index: number) => (
            <AccordionItem value={item?.sl_no} key={index}>
              <AccordionTrigger className="text-large px-10 py-3 font-lg text-text-content font-bold bg-backdrop border border-tablebackdrop w-full rounded-lg">
                0{index + 1} - {item.title}
              </AccordionTrigger>
              <AccordionContent className="">
                {item.items?.map((subItem: any, subIndex: number) => (
                  <div key={subIndex} className="mx-10 my-2.5 px-10 py-2.5 bg-success border border-success rounded-lg text-white font-lg font-medium">
                    <p>{subItem.title}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
