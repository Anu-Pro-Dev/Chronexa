"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import React, { useState, useRef, useEffect } from "react";
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
          subitems: [
            { title: "01-01-01 - Executive Assistant" },
            {
              title: "01-01-02 - Secretary",
              subitems: [
                { title: "01-01-02-01 - Assistant Secretary" },
                { title: "01-01-02-02 - Scheduler" },
              ],
            },
          ],
        },
        { title: "01-02 - Internal Audit Office" },
        { title: "01-03 - Legal Affairs Office" },
        { title: "01-04 - Strategic Affairs Office" },
      ],
    },
    {
      sl_no: 2,
      title: "Undersecretary",
      items: [
        { title: "02-01 - Corporate Communication Office" },
        { title: "02-02 - Under Secretary Office" },
        { title: "02-03 - Operations and Follow-up Office" },
      ],
    },
    {
      sl_no: 3,
      title: "Corporate Support Service Centre",
      items: [
        { title: "03-01 - Finance & Accounting Department" },
        { title: "03-02 - General Services & Facilities Management" },
        { title: "03-03 - Human Capital Department" },
        { title: "03-04 - Information Technology Department" },
        { title: "03-05 - Contracts and Procurement" },
      ],
    },
    {
      sl_no: 4,
      title: "Government Procurement Office",
      items: [
        { title: "04-01 - Entity Services" },
        { title: "04-02 - Planning & Standards" },
        { title: "04-03 - Supplier Services" },
      ],
    },
    {
      sl_no: 5,
      title: "Innovation and Future Foresight Sector",
      items: [
        { title: "05-01 - Future Foresight and Research" },
        { title: "05-02 - Innovation Lab & Partnerships" },
      ],
    },
    {
      sl_no: 6,
      title: "Policies Sector",
      items: [
        { title: "06-01 - Data & Statistics" },
        { title: "06-02 - Human Capital" },
        { title: "06-03 - Technology" },
      ],
    },
  ];

  const [openItem, setOpenItem] = useState<number | null>(null);
  const [showOrgTree, setShowOrgTree] = useState<boolean>(false);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const SubItemTree = ({
    items,
    parentKey = "",
  }: {
    items: any[];
    parentKey?: string;
  }) => {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const itemKey = `${parentKey}-${index}`;
          const hasChildren = item.subitems && item.subitems.length > 0;
          const isOpen = expandedMap[itemKey] || false;

          return (
            <div key={itemKey} className="flex flex-col">
              <div className="flex items-center">
                {/* Horizontal Line */}
                <div className="w-12 h-0.5 bg-secondary"></div>

                <div
                  className={`p-4 shadow-button rounded-lg text-base font-semibold cursor-pointer w-full transition flex justify-between items-center ${
                    isOpen
                      ? "bg-gradient-to-tl from-[#0078D4] to-[#003E6E] text-accent"
                      : "bg-accent text-text-content"
                  }`}
                  onClick={() => {
                    if (hasChildren) {
                      setExpandedMap((prev) => ({
                        ...prev,
                        [itemKey]: !prev[itemKey],
                      }));
                    }
                  }}
                >
                  <span>{item.title}</span>
                  {hasChildren && (
                    <span
                      className={`px-2 py-1 text-sm font-bold z-0 rounded ${
                        isOpen
                          ? "bg-accent bg-opacity-15"
                          : "bg-backdrop text-primary"
                      }`}
                    >
                      0{item.subitems.length}
                    </span>
                  )}
                </div>
              </div>

              {hasChildren && isOpen && (
                <div className="flex relative">
                  {/* Vertical Line for ONLY immediate subitems */}
                  <div
                    className="absolute left-[4rem] w-[2px] bg-secondary"
                    style={{
                      height: `${item.subitems?.length * 66}px`, // Approx height per subitem
                      top: "0",
                    }}
                  />
              
                  <div className="flex-1 mt-3 ml-[4rem]">
                    <SubItemTree items={item.subitems} parentKey={itemKey}  />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const subTreeRef = useRef<HTMLDivElement | null>(null);
  const [lineHeight, setLineHeight] = useState<number>(0);

  useEffect(() => {
    if (subTreeRef.current) {
      setLineHeight(subTreeRef.current.offsetHeight);
    }
  }, [openItem, expandedMap]);

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={modules?.organization.items}
        disableAdd
        disableDelete
        disableSearch
      />

      {/* Company Root Card */}
      <div
        className={`w-[50%] p-4 mx-auto rounded-lg font-bold text-base shadow-button text-center cursor-pointer transition bg-gradient-to-tl from-[#0078D4] to-[#003E6E] text-accent mt-5`}
        onClick={() => {
          setShowOrgTree(!showOrgTree);
          setOpenItem(null);
        }}
      >
        CHRONOLOGIX
      </div>

      {showOrgTree && (
        <div className="py-5">
          {content.map((item, index) => (
            <div key={index} className="relative flex items-start mb-3">
              <div className="relative w-1/2">
                <div
                  className={`relative flex justify-between items-center p-4 rounded-lg font-semibold text-base shadow-button cursor-pointer transition w-[85%] ${
                    openItem === item.sl_no
                      ? "bg-gradient-to-tl from-[#0078D4] to-[#003E6E] text-accent"
                      : "bg-accent text-text-content"
                  }`}
                  onClick={() =>
                    setOpenItem(openItem === item.sl_no ? null : item.sl_no)
                  }
                >
                  <div>
                    0{index + 1} - {item.title}
                  </div>
                  <div
                    className={`px-1.5 py-1 font-bold text-sm rounded-[5px] ${
                      openItem === item.sl_no
                        ? "bg-accent text-accent shadow-sm bg-opacity-15"
                        : "bg-backdrop text-primary"
                    }`}
                  >
                    0{item.items.length}
                  </div>
                </div>
                {openItem === item.sl_no && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[15%] h-0.5 bg-secondary"></div>
                )}
              </div>

              {openItem === item.sl_no && (
                <div ref={subTreeRef}  className="absolute left-1/2 top-0 max-w-[400px] flex flex-col gap-3 py-5">
                  {/* Vertical Line */}
                  <div
                    className="absolute left-0 top-[28px] w-[2px] bg-secondary"
                    style={{ height: `${lineHeight - 75}px` }}
                  ></div>

                  {item.items.map((subItem, subIndex) => {
                    const itemKey = `section-${item.sl_no}-${subIndex}`;
                    const hasChildren = subItem.subitems && subItem.subitems.length > 0;
                    const isOpen = expandedMap[itemKey] || false;

                    return (
                      <div key={itemKey} className="flex flex-col">
                        <div className="flex items-center">
                          {/* Horizontal Line */}
                          <div className="w-12 h-0.5 bg-secondary"></div>

                          <div
                            className={`p-4 shadow-button rounded-lg text-base font-semibold cursor-pointer w-full transition flex justify-between items-center ${
                              isOpen
                                ? "bg-gradient-to-tl from-[#0078D4] to-[#003E6E] text-accent"
                                : "bg-accent text-text-content"
                            }`}
                            onClick={() => {
                              if (hasChildren) {
                                setExpandedMap((prev) => ({
                                  ...prev,
                                  [itemKey]: !prev[itemKey],
                                }));
                              }
                            }}
                          >
                            <span>{subItem.title}</span>
                            {hasChildren && (
                              <span
                                className={`px-2 py-1 text-sm font-bold rounded ${
                                  isOpen
                                    ? "bg-accent bg-opacity-15"
                                    : "bg-backdrop text-primary"
                                }`}
                              >
                                0{subItem.subitems.length}
                              </span>
                            )}
                          </div>
                        </div>

                        {hasChildren && isOpen && (
                          <div className="flex relative">
                            {/* Vertical Line for ONLY immediate subitems */}
                            <div
                              className="absolute left-[4rem] w-[2px] bg-secondary"
                              style={{
                                height: `${subItem.subitems?.length * 55}px`, // Approx height per subitem
                                top: "0",
                              }}
                            />
                        
                            <div className="flex-1 mt-3 ml-[4rem]">
                              <SubItemTree items={subItem.subitems} parentKey={itemKey} />
                            </div>
                          </div>
                        )}
                        
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}