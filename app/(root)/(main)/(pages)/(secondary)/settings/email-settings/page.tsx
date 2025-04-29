// "use client";

// import PowerHeader from "@/components/custom/power-comps/power-header";


// import React from "react";

// import { useLanguage } from "@/providers/LanguageProvider";
// import AddAnnoucement from "@/forms/settings/AddAnnoucement";
// export default function Page() {
//   const { modules } = useLanguage();
//   return (
//     <div>
//       <PowerHeader items={modules?.settings?.items} disableFeatures />

//       <div className="py-5">
//         <AddAnnoucement />
//       </div>
//     </div>
//   );
// }

"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";

import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();

  const [Columns, setColumns] = useState([
    { field: "number", headerName: "Email" },
    { field: "name" },
  ]);

  const [Data, SetData] = useState<any>([]);
  const [CurrentPage, SetCurrentPage] = useState<number>(1);
  const [SortField, SetSortField] = useState<string>("");
  const [SortDirection, SetSortDirection] = useState<string>("asc");
  const [SearchValue, SetSearchValue] = useState<string>("");
  const [open, on_open_change] = useState<boolean>(false);
  const props = {
    Data,
    SetData,
    Columns,
    SortField,
    CurrentPage,
    SetCurrentPage,
    SetSortField,
    SortDirection,
    SetSortDirection,
    open,
    on_open_change,
    SearchValue,
    SetSearchValue,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader props={props} items={modules?.settings?.items} />
      <PowerTable props={props} Data={Data} />
    </div>
  );
}
