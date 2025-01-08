export interface ScheduleSlot {
  status: "Nor" | "Nig" | "Day" | "Fri" | null;
}

export interface ScheduleRow {
  id: string;
  number: string;
  name: string;
  version: string;
  status: string;
  hours: string;
  slots: ScheduleSlot[];
}

export interface Subcategory {
  name: string;
  rows: ScheduleRow[];
}

export interface Category {
  name: string;
  subcategories: Subcategory[];
}

export const scheduleData: any = [
  {
    name: "ADMIN - ADMIN",
    subcategories: [
      {
        name: "Advisor - Advisor",
        rows: [
          {
            id: "1",
            number: "DGS131",
            name: "Senior Advisor",
            version: "24.Jan.2021",
            status: "Nor",
            hours: "170:00",
            slots: Array(15)
              .fill(null)
              .map(() => ({
                status: ["Nor", "Nig", "Day", "Fri", null][
                  Math.floor(Math.random() * 5)
                ],
              })),
          },
          {
            id: "2",
            number: "DGS131",
            name: "Junior Advisor",
            version: "24.Jan.2021",
            status: "Nor",
            hours: "170:00",
            slots: Array(15)
              .fill(null)
              .map(() => ({
                status: ["Nor", "Nig", "Day", "Fri", null][
                  Math.floor(Math.random() * 5)
                ],
              })),
          },
        ],
      },
    ],
  },
  {
    name: "Chairman Office",
    subcategories: [
      {
        name: "Management",
        rows: [
          {
            id: "3",
            number: "DGS131",
            name: "Office Manager",
            version: "24.Jan.2021",
            status: "Nor",
            hours: "170:00",
            slots: Array(15)
              .fill(null)
              .map(() => ({
                status: ["Nor", "Nig", "Day", "Fri", null][
                  Math.floor(Math.random() * 5)
                ],
              })),
          },
          {
            id: "4",
            number: "DGS131",
            name: "Assistant Manager",
            version: "24.Jan.2021",
            status: "Nor",
            hours: "170:00",
            slots: Array(15)
              .fill(null)
              .map(() => ({
                status: ["Nor", "Nig", "Day", "Fri", null][
                  Math.floor(Math.random() * 5)
                ],
              })),
          },
        ],
      },
    ],
  },
  {
    name: "Internal Auditor",
    subcategories: [
      {
        name: "Audit Team",
        rows: [
          {
            id: "5",
            number: "DGS131",
            name: "Senior Auditor",
            version: "24.Jan.2021",
            status: "Nor",
            hours: "170:00",
            slots: Array(15)
              .fill(null)
              .map(() => ({
                status: ["Nor", "Nig", "Day", "Fri", null][
                  Math.floor(Math.random() * 5)
                ],
              })),
          },
          {
            id: "6",
            number: "DGS131",
            name: "Junior Auditor",
            version: "24.Jan.2021",
            status: "Nor",
            hours: "170:00",
            slots: Array(15)
              .fill(null)
              .map(() => ({
                status: ["Nor", "Nig", "Day", "Fri", null][
                  Math.floor(Math.random() * 5)
                ],
              })),
          },
        ],
      },
    ],
  },
];
