import {
  RegionsDataType,
  NationalitiesDataType,
  DesignationsDataType,
  GradesDataType,
} from "./types/types";

export const regions_columns = [
  "select",
  "code",
  "description_en",
  "description_ar",
  "updated",
  "actions",
];

export const nationalities_columns = [
  "select",
  "code",
  "name",
  "nameAr",
  "actions",
];

export const designations_columns = [
  "select",
  "code",
  "description_en",
  "description_ar",
  "updated",
  "actions",
];

export const grades_columns = [
  "select",
  "code",
  "description_en",
  "description_ar",
  "overtime_eligible",
  "senior_employee",
  "updated",
  "actions",
];

export const regions_data: RegionsDataType[] = [
  {
    code: "97",
    description_en: "body ick dreary",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19",
  },
  {
    code: "3056",
    description_en: "consonant carefully boring",
    description_ar: "ساكن مملة بعناية",
    updated: "2024-02-01",
  },
  {
    code: "3",
    description_en: "till",
    description_ar: "الجسم",
    updated: "2025-12-31",
  },
  {
    code: "51",
    description_en: "harbour regarding afore",
    description_ar: "ميناء بخصوص ما سبق",
    updated: "2024-08-09",
  },
  {
    code: "90",
    description_en: "because",
    description_ar: "لأن",
    updated: "2024-11-29",
  },
  {
    code: "2922",
    description_en: "oof likewise",
    description_ar: "اوف كذلك",
    updated: "2024-10-12",
  },
  {
    code: "545",
    description_en: "shelve",
    description_ar: "كذلك",
    updated: "2024-04-07",
  },
  {
    code: "6",
    description_en: "whereas hm upward",
    description_ar: "بينما هم إلى أعلى",
    updated: "2024-01-14",
  },
  {
    code: "673",
    description_en: "symptom before",
    description_ar: "ينما هم إلى",
    updated: "2024-08-11",
  },
  {
    code: "1435",
    description_en: "noted physically thumb",
    description_ar: "وأشار جسديا الإبهام",
    updated: "2024-08-13",
  },
  {
    code: "502",
    description_en: "majestically boastfully absent",
    description_ar: "غائبة بشكل مهيب",
    updated: "2024-06-27",
  },
  {
    code: "210",
    description_en: "unfortunately female",
    description_ar: "أنثى للأسف",
    updated: "2024-08-20",
  },
  {
    code: "3",
    description_en: "after",
    description_ar: "أنثى",
    updated: "2025-02-28",
  },
  {
    code: "3278",
    description_en: "openly tuxedo",
    description_ar: "للأسف",
    updated: "2024-08-29",
  },
  {
    code: "1726",
    description_en: "gladly pfft yahoo",
    description_ar: "وفي الوقت نفسه على الرغم من",
    updated: "2024-08-10",
  },
  {
    code: "8",
    description_en: "gosh and inasmuch",
    description_ar: "وفي الوقت نفسه",
    updated: "2024-08-15",
  },
  {
    code: "1513",
    description_en: "barring as",
    description_ar: "وفي الوقتن",
    updated: "2024-11-20",
  },
  {
    code: "7",
    description_en: "cone",
    description_ar: "الوقت",
    updated: "2024-01-27",
  },
  {
    code: "658",
    description_en: "aw yuck hungry",
    description_ar: "وفي الوقت الرغم ",
    updated: "2024-08-19",
  },
  {
    code: "6290",
    description_en: "aboard judgementally",
    description_ar: "وفي الوقت نفسه على الرغم",
    updated: "2024-08-19",
  },
  {
    code: "1131",
    description_en: "wearily",
    description_ar: "وفي الوقت نفسهن",
    updated: "2024-08-07",
  },
  {
    code: "4041",
    description_en: "final",
    description_ar: "وفي الوقت نفسه على الرغم من",
    updated: "2024-04-16",
  },
  {
    code: "4588",
    description_en: "provided",
    description_ar: "الوقت الرغ من",
    updated: "2024-08-19",
  },
  {
    code: "6214",
    description_en: "meanwhile whereas notwithstanding",
    description_ar: "وفي الوقت نفسه على الرغم من",
    updated: "2024-08-06",
  },
  // {
  //   code: "1",
  //   description_en: "which eek",
  //   updated: "2024-08-20T04:19:52.447Z",
  // },
  // {
  //   code: "2546",
  //   description_en: "stir accelerate",
  //   updated: "2024-08-20T00:22:23.091Z",
  // },
  // {
  //   code: "74",
  //   description_en: "aw way",
  //   updated: "2024-08-19T22:00:41.969Z",
  // },
  // {
  //   code: "712",
  //   description_en: "upon fondly",
  //   updated: "2024-08-20T00:56:46.367Z",
  // },
  // {
  //   code: "5588",
  //   description_en: "whenever",
  //   updated: "2024-08-20T07:39:13.287Z",
  // },
  // {
  //   code: "148",
  //   description_en: "detain surname",
  //   updated: "2024-08-20T06:21:44.627Z",
  // },
  // {
  //   code: "651",
  //   description_en: "to",
  //   updated: "2024-08-19T17:53:49.975Z",
  // },
  // {
  //   code: "3195",
  //   description_en: "now hence supposing",
  //   updated: "2024-08-20T02:30:33.888Z",
  // },
  // {
  //   code: "18",
  //   description_en: "ram rider",
  //   updated: "2024-08-20T04:38:41.172Z",
  // },
  // {
  //   code: "1",
  //   description_en: "jubilantly which",
  //   updated: "2024-08-19T17:07:34.959Z",
  // },
  // {
  //   code: "2868",
  //   description_en: "notwithstanding",
  //   updated: "2024-08-19T22:21:58.123Z",
  // },
  // {
  //   code: "7057",
  //   description_en: "bah of consequently",
  //   updated: "2024-08-19T23:29:16.757Z",
  // },
  // {
  //   code: "5549",
  //   description_en: "melodic aw frame",
  //   updated: "2024-08-19T14:41:24.773Z",
  // },
  // {
  //   code: "8646",
  //   description_en: "um pendant",
  //   updated: "2024-08-19T14:06:48.262Z",
  // },
  // {
  //   code: "5208",
  //   description_en: "given considering",
  //   updated: "2024-08-19T20:02:44.011Z",
  // },
  // {
  //   code: "859",
  //   description_en: "nobble geez",
  //   updated: "2024-08-19T19:58:48.168Z",
  // },
  // {
  //   code: "70",
  //   description_en: "the vaguely",
  //   updated: "2024-08-19T11:49:01.685Z",
  // },
  // {
  //   code: "48",
  //   description_en: "properly amid joyfully",
  //   updated: "2024-08-19T14:11:27.669Z",
  // },
  // {
  //   code: "5945",
  //   description_en: "successfully commonly",
  //   updated: "2024-08-19T14:51:33.806Z",
  // },
  // {
  //   code: "706",
  //   description_en: "unlike deceivingly",
  //   updated: "2024-08-19T17:21:00.738Z",
  // },
  // {
  //   code: "8",
  //   description_en: "shocking exemplary",
  //   updated: "2024-08-19T16:46:48.352Z",
  // },
  // {
  //   code: "5",
  //   description_en: "readily",
  //   updated: "2024-08-19T12:27:33.922Z",
  // },
  // {
  //   code: "329",
  //   description_en: "zowie astride pish",
  //   updated: "2024-08-19T16:30:58.428Z",
  // },
  // {
  //   code: "2",
  //   description_en: "married eliminate",
  //   updated: "2024-08-20T00:06:53.589Z",
  // },
  // {
  //   code: "9",
  //   description_en: "medical truck",
  //   updated: "2024-08-19T10:50:29.739Z",
  // },
  // {
  //   code: "6839",
  //   description_en: "yum via",
  //   updated: "2024-08-19T12:31:30.454Z",
  // },
  // {
  //   code: "2",
  //   description_en: "incidentally cinch",
  //   updated: "2024-08-19T20:11:00.498Z",
  // },
  // {
  //   code: "5115",
  //   description_en: "chip anchored",
  //   updated: "2024-08-19T15:03:04.483Z",
  // },
  // {
  //   code: "2",
  //   description_en: "next",
  //   updated: "2024-08-20T04:05:08.820Z",
  // },
  // {
  //   code: "9471",
  //   description_en: "extend what excommunicate",
  //   updated: "2024-08-20T07:51:21.633Z",
  // },
  // {
  //   code: "7",
  //   description_en: "hourly",
  //   updated: "2024-08-19T16:51:54.361Z",
  // },
  // {
  //   code: "172",
  //   description_en: "unless alter",
  //   updated: "2024-08-19T11:24:27.698Z",
  // },
  // {
  //   code: "984",
  //   description_en: "perfectly",
  //   updated: "2024-08-19T10:09:45.580Z",
  // },
  // {
  //   code: "6",
  //   description_en: "till exalted grim",
  //   updated: "2024-08-20T02:10:36.362Z",
  // },
  // {
  //   code: "1127",
  //   description_en: "steel",
  //   updated: "2024-08-19T22:59:28.734Z",
  // },
  // {
  //   code: "12",
  //   description_en: "rest how buddy",
  //   updated: "2024-08-19T10:01:15.078Z",
  // },
  // {
  //   code: "676",
  //   description_en: "photodiode",
  //   updated: "2024-08-19T15:02:45.545Z",
  // },
  // {
  //   code: "503",
  //   description_en: "sedately phew",
  //   updated: "2024-08-20T04:16:52.941Z",
  // },
  // {
  //   code: "29",
  //   description_en: "filly as",
  //   updated: "2024-08-19T10:57:47.867Z",
  // },
  // {
  //   code: "879",
  //   description_en: "forecast bleakly",
  //   updated: "2024-08-19T13:08:02.513Z",
  // },
  // {
  //   code: "7143",
  //   description_en: "yahoo",
  //   updated: "2024-08-19T14:48:51.204Z",
  // },
  // {
  //   code: "545",
  //   description_en: "mitten",
  //   updated: "2024-08-20T01:50:24.789Z",
  // },
  // {
  //   code: "491",
  //   description_en: "coin basics cobble",
  //   updated: "2024-08-20T01:50:49.774Z",
  // },
  // {
  //   code: "525",
  //   description_en: "yet gybe woeful",
  //   updated: "2024-08-20T01:26:36.138Z",
  // },
  // {
  //   code: "10",
  //   description_en: "melodic whenever behind",
  //   updated: "2024-08-19T15:22:55.692Z",
  // },
  // {
  //   code: "1",
  //   description_en: "whoa convey eagle",
  //   updated: "2024-08-19T17:00:19.427Z",
  // },
  // {
  //   code: "930",
  //   description_en: "next integrity",
  //   updated: "2024-08-19T10:23:59.081Z",
  // },
  // {
  //   code: "46",
  //   description_en: "following coolly including",
  //   updated: "2024-08-19T09:35:06.763Z",
  // },
  // {
  //   code: "48",
  //   description_en: "marinate vice",
  //   updated: "2024-08-19T15:18:00.379Z",
  // },
  // {
  //   code: "599",
  //   description_en: "yet strawman lightly",
  //   updated: "2024-08-19T18:01:06.043Z",
  // },
  // {
  //   code: "88",
  //   description_en: "tenet notwithstanding",
  //   updated: "2024-08-19T15:42:51.724Z",
  // },
  // {
  //   code: "4",
  //   description_en: "ectodermal regenerate",
  //   updated: "2024-08-19T14:56:05.415Z",
  // },
  // {
  //   code: "6",
  //   description_en: "ha",
  //   updated: "2024-08-20T06:35:55.816Z",
  // },
  // {
  //   code: "3416",
  //   description_en: "lest bubbly",
  //   updated: "2024-08-20T00:25:47.138Z",
  // },
  // {
  //   code: "9",
  //   description_en: "of acknowledgment",
  //   updated: "2024-08-19T23:32:13.801Z",
  // },
  // {
  //   code: "306",
  //   description_en: "like",
  //   updated: "2024-08-19T11:27:09.141Z",
  // },
  // {
  //   code: "18",
  //   description_en: "while",
  //   updated: "2024-08-19T18:48:29.358Z",
  // },
  // {
  //   code: "69",
  //   description_en: "dent beneath",
  //   updated: "2024-08-19T23:53:05.123Z",
  // },
  // {
  //   code: "871",
  //   description_en: "scarily kip by",
  //   updated: "2024-08-19T16:48:13.140Z",
  // },
  // {
  //   code: "3",
  //   description_en: "damaged which",
  //   updated: "2024-08-19T13:30:32.773Z",
  // },
  // {
  //   code: "9",
  //   description_en: "gadzooks stark",
  //   updated: "2024-08-19T15:57:34.606Z",
  // },
  // {
  //   code: "56",
  //   description_en: "stonewall",
  //   updated: "2024-08-19T11:27:04.948Z",
  // },
  // {
  //   code: "867",
  //   description_en: "offer",
  //   updated: "2024-08-19T16:38:07.654Z",
  // },
  // {
  //   code: "2",
  //   description_en: "inconsequential once",
  //   updated: "2024-08-19T18:12:46.237Z",
  // },
  // {
  //   code: "93",
  //   description_en: "wearily",
  //   updated: "2024-08-19T21:58:17.001Z",
  // },
  // {
  //   code: "1165",
  //   description_en: "crowd",
  //   updated: "2024-08-19T16:04:28.463Z",
  // },
  // {
  //   code: "4",
  //   description_en: "where",
  //   updated: "2024-08-19T13:45:32.957Z",
  // },
  // {
  //   code: "55",
  //   description_en: "furthermore eek",
  //   updated: "2024-08-19T08:36:36.035Z",
  // },
  // {
  //   code: "47",
  //   description_en: "faithfully ick user",
  //   updated: "2024-08-20T06:42:59.944Z",
  // },
  // {
  //   code: "5608",
  //   description_en: "boo strictly",
  //   updated: "2024-08-20T02:55:23.251Z",
  // },
  // {
  //   code: "55",
  //   description_en: "receipt",
  //   updated: "2024-08-20T06:24:22.204Z",
  // },
  // {
  //   code: "44",
  //   description_en: "before tent",
  //   updated: "2024-08-20T01:07:47.009Z",
  // },
  // {
  //   code: "54",
  //   description_en: "accelerant lest incidentally",
  //   updated: "2024-08-20T01:09:00.961Z",
  // },
  // {
  //   code: "260",
  //   description_en: "beware hide",
  //   updated: "2024-08-19T16:28:28.476Z",
  // },
  // {
  //   code: "4835",
  //   description_en: "zealous forenenst",
  //   updated: "2024-08-20T00:55:10.853Z",
  // },
  // {
  //   code: "89",
  //   description_en: "index aha",
  //   updated: "2024-08-20T00:14:12.323Z",
  // },
];

export const grades_data: GradesDataType[] = [
  {
    code: "97",
    description_en: "body ick dreary",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T00:52:14.982Z",
    overtime_eligible: "✡️",
    senior_employee: "😱",
  },
  {
    code: "944",
    description_en: "release pish",
    description_ar: "الجسم مريض",
    updated: "2024-08-19T14:45:11.984Z",
    overtime_eligible: "㊗️",
    senior_employee: "❣️",
  },
  {
    code: "3",
    description_en: "till",
    description_ar: "الجسم",
    updated: "2024-08-19T12:31:28.171Z",
    overtime_eligible: "🍱",
    senior_employee: "🤲🏼",
  },
  {
    code: "31",
    description_en: "ozone septicaemia bootie",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T04:28:00.901Z",
    overtime_eligible: "🇪🇬",
    senior_employee: "👌🏻",
  },
  {
    code: "106",
    description_en: "authorized dill reciprocate",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T23:40:49.014Z",
    overtime_eligible: "🍘",
    senior_employee: "💋",
  },
  {
    code: "161",
    description_en: "maracas justly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T22:35:29.515Z",
    overtime_eligible: "🙌🏾",
    senior_employee: "🇬🇱",
  },
  {
    code: "67",
    description_en: "ritualize silly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T01:14:22.219Z",
    overtime_eligible: "🔸",
    senior_employee: "👻",
  },
  {
    code: "60",
    description_en: "underweight",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T01:43:06.258Z",
    overtime_eligible: "🐏",
    senior_employee: "🛋️",
  },
  {
    code: "6307",
    description_en: "ha abaft",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T05:03:27.449Z",
    overtime_eligible: "🇸🇸",
    senior_employee: "⛳",
  },
  {
    code: "1141",
    description_en: "robotics or oh",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T23:16:41.772Z",
    overtime_eligible: "🙍🏾‍♀️",
    senior_employee: "♌",
  },
  {
    code: "359",
    description_en: "so shore howl",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T14:47:19.717Z",
    overtime_eligible: "⚒️",
    senior_employee: "🍚",
  },
  {
    code: "23",
    description_en: "sedate",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T06:05:47.809Z",
    overtime_eligible: "🪄",
    senior_employee: "😓",
  },
  {
    code: "110",
    description_en: "pfft",
    description_ar: "الجسمكئيب مريض",
    updated: "2024-08-20T07:51:44.372Z",
    overtime_eligible: "⛑️",
    senior_employee: "🦻🏿",
  },
  {
    code: "490",
    description_en: "yet as inspect",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T03:53:49.076Z",
    overtime_eligible: "🔥",
    senior_employee: "🤛🏾",
  },
  {
    code: "4",
    description_en: "barring as",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T06:28:10.046Z",
    overtime_eligible: "🙉",
    senior_employee: "🖐🏾",
  },
  {
    code: "30",
    description_en: "teeming what unless",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T11:10:43.469Z",
    overtime_eligible: "🧅",
    senior_employee: "💼",
  },
  {
    code: "9399",
    description_en: "emigrate whoever",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T16:06:49.211Z",
    overtime_eligible: "🇬🇲",
    senior_employee: "🦎",
  },
  {
    code: "1131",
    description_en: "wearily",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T12:26:32.020Z",
    overtime_eligible: "🔁",
    senior_employee: "😲",
  },
  {
    code: "1",
    description_en: "however",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T12:57:04.523Z",
    overtime_eligible: "🦜",
    senior_employee: "⚫",
  },
  {
    code: "8",
    description_en: "shock",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T21:39:50.804Z",
    overtime_eligible: "🙆‍♂️",
    senior_employee: "🧊",
  },
  {
    code: "309",
    description_en: "daffodil suspiciously",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T21:22:53.688Z",
    overtime_eligible: "🧨",
    senior_employee: "😄",
  },
  {
    code: "16",
    description_en: "gasp fooey",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T21:43:14.370Z",
    overtime_eligible: "🍡",
    senior_employee: "🦒",
  },
  {
    code: "667",
    description_en: "towards",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T11:24:05.965Z",
    overtime_eligible: "🐪",
    senior_employee: "🏒",
  },
  {
    code: "43",
    description_en: "questioningly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T22:02:19.377Z",
    overtime_eligible: "🥔",
    senior_employee: "🇭🇺",
  },
  {
    code: "712",
    description_en: "upon fondly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T04:20:32.830Z",
    overtime_eligible: "🔰",
    senior_employee: "🪐",
  },
  {
    code: "2507",
    description_en: "for",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T16:01:52.623Z",
    overtime_eligible: "🦕",
    senior_employee: "💌",
  },
  {
    code: "70",
    description_en: "surname",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T09:45:31.089Z",
    overtime_eligible: "🪀",
    senior_employee: "💒",
  },
  {
    code: "5",
    description_en: "gosh foolishly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T06:15:54.886Z",
    overtime_eligible: "☝️",
    senior_employee: "👍🏾",
  },
  {
    code: "37",
    description_en: "haste",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T07:43:54.148Z",
    overtime_eligible: "🎽",
    senior_employee: "👨🏿‍🎨",
  },
  {
    code: "9",
    description_en: "ram rider",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T08:02:27.634Z",
    overtime_eligible: "👩🏽",
    senior_employee: "🌥️",
  },
  {
    code: "7033",
    description_en: "which functional",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T09:08:37.539Z",
    overtime_eligible: "👹",
    senior_employee: "🗄️",
  },
  {
    code: "6477",
    description_en: "happily",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T05:20:38.340Z",
    overtime_eligible: "💃",
    senior_employee: "🥎",
  },
  {
    code: "8546",
    description_en: "hm popular strident",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T08:15:48.035Z",
    overtime_eligible: "🥩",
    senior_employee: "🚺",
  },
  {
    code: "257",
    description_en: "recall openly pfft",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T06:06:15.359Z",
    overtime_eligible: "🧖🏿",
    senior_employee: "🛁",
  },
  {
    code: "20",
    description_en: "egghead condition moist",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T06:14:42.209Z",
    overtime_eligible: "🇵🇸",
    senior_employee: "☮️",
  },
  {
    code: "6",
    description_en: "legging before influence",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T17:07:28.974Z",
    overtime_eligible: "🖲️",
    senior_employee: "🇸🇽",
  },
  {
    code: "48",
    description_en: "properly amid joyfully",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T17:35:14.132Z",
    overtime_eligible: "✖️",
    senior_employee: "🇮🇴",
  },
  {
    code: "564",
    description_en: "annual",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T19:49:30.730Z",
    overtime_eligible: "🧤",
    senior_employee: "🙏🏻",
  },
  {
    code: "706",
    description_en: "unlike deceivingly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T20:44:47.201Z",
    overtime_eligible: "🦿",
    senior_employee: "🔮",
  },
  {
    code: "5987",
    description_en: "exemplary pish friendly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T04:45:20.400Z",
    overtime_eligible: "🇿🇦",
    senior_employee: "🧘🏿‍♂️",
  },
  {
    code: "537",
    description_en: "astride pish upwardly",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T14:53:09.853Z",
    overtime_eligible: "✔️",
    senior_employee: "🕑",
  },
  {
    code: "58",
    description_en: "dash incompatible",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T07:37:37.599Z",
    overtime_eligible: "👩🏾‍❤️‍👨🏼",
    senior_employee: "🐩",
  },
  {
    code: "8958",
    description_en: "cuckoo boo",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T01:35:15.419Z",
    overtime_eligible: "🇸🇲",
    senior_employee: "🤏🏽",
  },
  {
    code: "71",
    description_en: "domain",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T06:01:19.599Z",
    overtime_eligible: "👻",
    senior_employee: "👎🏼",
  },
  {
    code: "5115",
    description_en: "chip anchored",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-19T18:26:50.946Z",
    overtime_eligible: "🤫",
    senior_employee: "😉",
  },
  {
    code: "83",
    description_en: "speedily",
    description_ar: "الجسم مريض كئيب",
    updated: "2024-08-20T06:48:44.036Z",
    overtime_eligible: "↩️",
    senior_employee: "🛷",
  },
];

export const nationalities_data: NationalitiesDataType[] = [
  {
    "code": "AF",
    "name": "Afghanistan",
    "nameAr": "أفغانستان",
    "flag": "https://flagcdn.com/w40/af.png"
  },
  {
    "code": "AL",
    "name": "Albania",
    "nameAr": "ألبانيا",
    "flag": "https://flagcdn.com/w40/al.png"
  },
  {
    "code": "DZ",
    "name": "Algeria",
    "nameAr": "الجزائر",
    "flag": "https://flagcdn.com/w40/dz.png"
  },
  {
    "code": "AD",
    "name": "Andorra",
    "nameAr": "أندورا",
    "flag": "https://flagcdn.com/w40/ad.png"
  },
  {
    "code": "AO",
    "name": "Angola",
    "nameAr": "أنغولا",
    "flag": "https://flagcdn.com/w40/ao.png"
  },
  {
    "code": "AG",
    "name": "Antigua and Barbuda",
    "nameAr": "أنتيغوا وباربودا",
    "flag": "https://flagcdn.com/w40/ag.png"
  },
  {
    "code": "AR",
    "name": "Argentina",
    "nameAr": "الأرجنتين",
    "flag": "https://flagcdn.com/w40/ar.png"
  },
  {
    "code": "AM",
    "name": "Armenia",
    "nameAr": "أرمينيا",
    "flag": "https://flagcdn.com/w40/am.png"
  },
  {
    "code": "AU",
    "name": "Australia",
    "nameAr": "أستراليا",
    "flag": "https://flagcdn.com/w40/au.png"
  },
  {
    "code": "AT",
    "name": "Austria",
    "nameAr": "النمسا",
    "flag": "https://flagcdn.com/w40/at.png"
  },
  {
    "code": "AZ",
    "name": "Azerbaijan",
    "nameAr": "أذربيجان",
    "flag": "https://flagcdn.com/w40/az.png"
  },
  {
    "code": "BS",
    "name": "Bahamas",
    "nameAr": "الباهاماس",
    "flag": "https://flagcdn.com/w40/bs.png"
  },
  {
    "code": "BH",
    "name": "Bahrain",
    "nameAr": "البحرين",
    "flag": "https://flagcdn.com/w40/bh.png"
  },
  {
    "code": "BD",
    "name": "Bangladesh",
    "nameAr": "بنغلاديش",
    "flag": "https://flagcdn.com/w40/bd.png"
  },
  {
    "code": "BB",
    "name": "Barbados",
    "nameAr": "بربادوس",
    "flag": "https://flagcdn.com/w40/bb.png"
  },
  {
    "code": "BY",
    "name": "Belarus",
    "nameAr": "بيلاروس",
    "flag": "https://flagcdn.com/w40/by.png"
  },
  {
    "code": "BE",
    "name": "Belgium",
    "nameAr": "بلجيكا",
    "flag": "https://flagcdn.com/w40/be.png"
  },
  {
    "code": "BZ",
    "name": "Belize",
    "nameAr": "بليز",
    "flag": "https://flagcdn.com/w40/bz.png"
  },
  {
    "code": "BJ",
    "name": "Benin",
    "nameAr": "بنين",
    "flag": "https://flagcdn.com/w40/bj.png"
  },
  {
    "code": "BT",
    "name": "Bhutan",
    "nameAr": "بوتان",
    "flag": "https://flagcdn.com/w40/bt.png"
  },
  {
    "code": "BO",
    "name": "Bolivia",
    "nameAr": "بوليفيا",
    "flag": "https://flagcdn.com/w40/bo.png"
  },
  {
    "code": "BA",
    "name": "Bosnia and Herzegovina",
    "nameAr": "البوسنة والهرسك",
    "flag": "https://flagcdn.com/w40/ba.png"
  },
  {
    "code": "BW",
    "name": "Botswana",
    "nameAr": "بوتسوانا",
    "flag": "https://flagcdn.com/w40/bw.png"
  },
  {
    "code": "BR",
    "name": "Brazil",
    "nameAr": "البرازيل",
    "flag": "https://flagcdn.com/w40/br.png"
  },
  {
    "code": "BN",
    "name": "Brunei",
    "nameAr": "بروناي",
    "flag": "https://flagcdn.com/w40/bn.png"
  },
  {
    "code": "BG",
    "name": "Bulgaria",
    "nameAr": "بلغاريا",
    "flag": "https://flagcdn.com/w40/bg.png"
  },
  {
    "code": "BF",
    "name": "Burkina Faso",
    "nameAr": "بوركينا فاسو",
    "flag": "https://flagcdn.com/w40/bf.png"
  },
  {
    "code": "BI",
    "name": "Burundi",
    "nameAr": "بوروندي",
    "flag": "https://flagcdn.com/w40/bi.png"
  },
  {
    "code": "KH",
    "name": "Cambodia",
    "nameAr": "كمبوديا",
    "flag": "https://flagcdn.com/w40/kh.png"
  },
  {
    "code": "CM",
    "name": "Cameroon",
    "nameAr": "الكاميرون",
    "flag": "https://flagcdn.com/w40/cm.png"
  },
  {
    "code": "CA",
    "name": "Canada",
    "nameAr": "كندا",
    "flag": "https://flagcdn.com/w40/ca.png"
  },
  {
    "code": "CV",
    "name": "Cape Verde",
    "nameAr": "الرأس الأخضر",
    "flag": "https://flagcdn.com/w40/cv.png"
  },
  {
    "code": "CF",
    "name": "Central African Republic",
    "nameAr": "جمهورية أفريقيا الوسطى",
    "flag": "https://flagcdn.com/w40/cf.png"
  },
  {
    "code": "TD",
    "name": "Chad",
    "nameAr": "تشاد",
    "flag": "https://flagcdn.com/w40/td.png"
  },
  {
    "code": "CL",
    "name": "Chile",
    "nameAr": "تشيلي",
    "flag": "https://flagcdn.com/w40/cl.png"
  },
  {
    "code": "CN",
    "name": "China",
    "nameAr": "الصين",
    "flag": "https://flagcdn.com/w40/cn.png"
  },
  {
    "code": "CO",
    "name": "Colombia",
    "nameAr": "كولومبيا",
    "flag": "https://flagcdn.com/w40/co.png"
  },
  {
    "code": "KM",
    "name": "Comoros",
    "nameAr": "جزر القمر",
    "flag": "https://flagcdn.com/w40/km.png"
  },
  {
    "code": "CD",
    "name": "Congo (DRC)",
    "nameAr": "جمهورية الكونغو الديمقراطية",
    "flag": "https://flagcdn.com/w40/cd.png"
  },
  {
    "code": "CG",
    "name": "Congo (Republic)",
    "nameAr": "جمهورية الكونغو",
    "flag": "https://flagcdn.com/w40/cg.png"
  },
  {
    "code": "CR",
    "name": "Costa Rica",
    "nameAr": "كوستاريكا",
    "flag": "https://flagcdn.com/w40/cr.png"
  },
  {
    "code": "HR",
    "name": "Croatia",
    "nameAr": "كرواتيا",
    "flag": "https://flagcdn.com/w40/hr.png"
  },
  {
    "code": "CU",
    "name": "Cuba",
    "nameAr": "كوبا",
    "flag": "https://flagcdn.com/w40/cu.png"
  },
  {
    "code": "CY",
    "name": "Cyprus",
    "nameAr": "قبرص",
    "flag": "https://flagcdn.com/w40/cy.png"
  },
  {
    "code": "CZ",
    "name": "Czech Republic",
    "nameAr": "جمهورية التشيك",
    "flag": "https://flagcdn.com/w40/cz.png"
  },
  {
    "code": "DK",
    "name": "Denmark",
    "nameAr": "الدنمارك",
    "flag": "https://flagcdn.com/w40/dk.png"
  },
  {
    "code": "DJ",
    "name": "Djibouti",
    "nameAr": "جيبوتي",
    "flag": "https://flagcdn.com/w40/dj.png"
  },
  {
    "code": "DM",
    "name": "Dominica",
    "nameAr": "دومينيكا",
    "flag": "https://flagcdn.com/w40/dm.png"
  },
  {
    "code": "DO",
    "name": "Dominican Republic",
    "nameAr": "جمهورية الدومينيكان",
    "flag": "https://flagcdn.com/w40/do.png"
  },
  {
    "code": "EC",
    "name": "Ecuador",
    "nameAr": "الإكوادور",
    "flag": "https://flagcdn.com/w40/ec.png"
  },
  {
    "code": "EG",
    "name": "Egypt",
    "nameAr": "مصر",
    "flag": "https://flagcdn.com/w40/eg.png"
  },
  {
    "code": "SV",
    "name": "El Salvador",
    "nameAr": "السلفادور",
    "flag": "https://flagcdn.com/w40/sv.png"
  },
  {
    "code": "GQ",
    "name": "Equatorial Guinea",
    "nameAr": "غينيا الاستوائية",
    "flag": "https://flagcdn.com/w40/gq.png"
  },
  {
    "code": "ER",
    "name": "Eritrea",
    "nameAr": "إريتريا",
    "flag": "https://flagcdn.com/w40/er.png"
  },
  {
    "code": "EE",
    "name": "Estonia",
    "nameAr": "إستونيا",
    "flag": "https://flagcdn.com/w40/ee.png"
  },
  {
    "code": "SZ",
    "name": "Eswatini",
    "nameAr": "إسواتيني",
    "flag": "https://flagcdn.com/w40/sz.png"
  },
  {
    "code": "ET",
    "name": "Ethiopia",
    "nameAr": "إثيوبيا",
    "flag": "https://flagcdn.com/w40/et.png"
  },
  {
    "code": "FJ",
    "name": "Fiji",
    "nameAr": "فيجي",
    "flag": "https://flagcdn.com/w40/fj.png"
  },
  {
    "code": "FI",
    "name": "Finland",
    "nameAr": "فنلندا",
    "flag": "https://flagcdn.com/w40/fi.png"
  },
  {
    "code": "FR",
    "name": "France",
    "nameAr": "فرنسا",
    "flag": "https://flagcdn.com/w40/fr.png"
  },
  {
    "code": "GA",
    "name": "Gabon",
    "nameAr": "الغابون",
    "flag": "https://flagcdn.com/w40/ga.png"
  },
  {
    "code": "GM",
    "name": "Gambia",
    "nameAr": "غامبيا",
    "flag": "https://flagcdn.com/w40/gm.png"
  },
  {
    "code": "GE",
    "name": "Georgia",
    "nameAr": "جورجيا",
    "flag": "https://flagcdn.com/w40/ge.png"
  },
  {
    "code": "DE",
    "name": "Germany",
    "nameAr": "ألمانيا",
    "flag": "https://flagcdn.com/w40/de.png"
  },
  {
    "code": "GH",
    "name": "Ghana",
    "nameAr": "غانا",
    "flag": "https://flagcdn.com/w40/gh.png"
  },
  {
    "code": "GR",
    "name": "Greece",
    "nameAr": "اليونان",
    "flag": "https://flagcdn.com/w40/gr.png"
  },
  {
    "code": "GD",
    "name": "Grenada",
    "nameAr": "غرينادا",
    "flag": "https://flagcdn.com/w40/gd.png"
  },
  {
    "code": "GT",
    "name": "Guatemala",
    "nameAr": "غواتيمالا",
    "flag": "https://flagcdn.com/w40/gt.png"
  },
  {
    "code": "GN",
    "name": "Guinea",
    "nameAr": "غينيا",
    "flag": "https://flagcdn.com/w40/gn.png"
  },
  {
    "code": "GW",
    "name": "Guinea-Bissau",
    "nameAr": "غينيا بيساو",
    "flag": "https://flagcdn.com/w40/gw.png"
  },
  {
    "code": "GY",
    "name": "Guyana",
    "nameAr": "غيانا",
    "flag": "https://flagcdn.com/w40/gy.png"
  },
  {
    "code": "HT",
    "name": "Haiti",
    "nameAr": "هايتي",
    "flag": "https://flagcdn.com/w40/ht.png"
  },
  {
    "code": "HN",
    "name": "Honduras",
    "nameAr": "هندوراس",
    "flag": "https://flagcdn.com/w40/hn.png"
  },
  {
    "code": "HU",
    "name": "Hungary",
    "nameAr": "المجر",
    "flag": "https://flagcdn.com/w40/hu.png"
  },
  {
    "code": "IS",
    "name": "Iceland",
    "nameAr": "آيسلندا",
    "flag": "https://flagcdn.com/w40/is.png"
  },
  {
    "code": "IN",
    "name": "India",
    "nameAr": "الهند",
    "flag": "https://flagcdn.com/w40/in.png"
  },
  {
    "code": "ID",
    "name": "Indonesia",
    "nameAr": "إندونيسيا",
    "flag": "https://flagcdn.com/w40/id.png"
  },
  {
    "code": "IR",
    "name": "Iran",
    "nameAr": "إيران",
    "flag": "https://flagcdn.com/w40/ir.png"
  },
  {
    "code": "IQ",
    "name": "Iraq",
    "nameAr": "العراق",
    "flag": "https://flagcdn.com/w40/iq.png"
  },
  {
    "code": "IE",
    "name": "Ireland",
    "nameAr": "أيرلندا",
    "flag": "https://flagcdn.com/w40/ie.png"
  },
  {
    "code": "IL",
    "name": "Israel",
    "nameAr": "إسرائيل",
    "flag": "https://flagcdn.com/w40/il.png"
  },
  {
    "code": "IT",
    "name": "Italy",
    "nameAr": "إيطاليا",
    "flag": "https://flagcdn.com/w40/it.png"
  },
  {
    "code": "CI",
    "name": "Ivory Coast",
    "nameAr": "ساحل العاج",
    "flag": "https://flagcdn.com/w40/ci.png"
  },
  {
    "code": "JM",
    "name": "Jamaica",
    "nameAr": "جامايكا",
    "flag": "https://flagcdn.com/w40/jm.png"
  },
  {
    "code": "JP",
    "name": "Japan",
    "nameAr": "اليابان",
    "flag": "https://flagcdn.com/w40/jp.png"
  },
  {
    "code": "JO",
    "name": "Jordan",
    "nameAr": "الأردن",
    "flag": "https://flagcdn.com/w40/jo.png"
  },
  {
    "code": "KZ",
    "name": "Kazakhstan",
    "nameAr": "كازاخستان",
    "flag": "https://flagcdn.com/w40/kz.png"
  },
  {
    "code": "KE",
    "name": "Kenya",
    "nameAr": "كينيا",
    "flag": "https://flagcdn.com/w40/ke.png"
  },
  {
    "code": "KW",
    "name": "Kuwait",
    "nameAr": "الكويت",
    "flag": "https://flagcdn.com/w40/kw.png"
  },
  {
    "code": "KG",
    "name": "Kyrgyzstan",
    "nameAr": "قيرغيزستان",
    "flag": "https://flagcdn.com/w40/kg.png"
  },
  {
    "code": "LA",
    "name": "Laos",
    "nameAr": "لاوس",
    "flag": "https://flagcdn.com/w40/la.png"
  },
  {
    "code": "LV",
    "name": "Latvia",
    "nameAr": "لاتفيا",
    "flag": "https://flagcdn.com/w40/lv.png"
  },
  {
    "code": "LB",
    "name": "Lebanon",
    "nameAr": "لبنان",
    "flag": "https://flagcdn.com/w40/lb.png"
  },
  {
    "code": "LY",
    "name": "Libya",
    "nameAr": "ليبيا",
    "flag": "https://flagcdn.com/w40/ly.png"
  },
  {
    "code": "LT",
    "name": "Lithuania",
    "nameAr": "ليتوانيا",
    "flag": "https://flagcdn.com/w40/lt.png"
  },
  {
    "code": "LU",
    "name": "Luxembourg",
    "nameAr": "لوكسمبورغ",
    "flag": "https://flagcdn.com/w40/lu.png"
  },
  {
    "code": "MG",
    "name": "Madagascar",
    "nameAr": "مدغشقر",
    "flag": "https://flagcdn.com/w40/mg.png"
  },
  {
    "code": "MY",
    "name": "Malaysia",
    "nameAr": "ماليزيا",
    "flag": "https://flagcdn.com/w40/my.png"
  },
  {
    "code": "MV",
    "name": "Maldives",
    "nameAr": "المالديف",
    "flag": "https://flagcdn.com/w40/mv.png"
  },
  {
    "code": "ML",
    "name": "Mali",
    "nameAr": "مالي",
    "flag": "https://flagcdn.com/w40/ml.png"
  },
  {
    "code": "MT",
    "name": "Malta",
    "nameAr": "مالطا",
    "flag": "https://flagcdn.com/w40/mt.png"
  },
  {
    "code": "MX",
    "name": "Mexico",
    "nameAr": "المكسيك",
    "flag": "https://flagcdn.com/w40/mx.png"
  },
  {
    "code": "MA",
    "name": "Morocco",
    "nameAr": "المغرب",
    "flag": "https://flagcdn.com/w40/ma.png"
  },
  {
    "code": "MZ",
    "name": "Mozambique",
    "nameAr": "موزمبيق",
    "flag": "https://flagcdn.com/w40/mz.png"
  },
  {
    "code": "NA",
    "name": "Namibia",
    "nameAr": "ناميبيا",
    "flag": "https://flagcdn.com/w40/na.png"
  },
  {
    "code": "NP",
    "name": "Nepal",
    "nameAr": "نيبال",
    "flag": "https://flagcdn.com/w40/np.png"
  },
  {
    "code": "NL",
    "name": "Netherlands",
    "nameAr": "هولندا",
    "flag": "https://flagcdn.com/w40/nl.png"
  },
  {
    "code": "NZ",
    "name": "New Zealand",
    "nameAr": "نيوزيلندا",
    "flag": "https://flagcdn.com/w40/nz.png"
  },
  {
    "code": "NG",
    "name": "Nigeria",
    "nameAr": "نيجيريا",
    "flag": "https://flagcdn.com/w40/ng.png"
  },
  {
    "code": "NO",
    "name": "Norway",
    "nameAr": "النرويج",
    "flag": "https://flagcdn.com/w40/no.png"
  },
  {
    "code": "OM",
    "name": "Oman",
    "nameAr": "عمان",
    "flag": "https://flagcdn.com/w40/om.png"
  },
  {
    "code": "PK",
    "name": "Pakistan",
    "nameAr": "باكستان",
    "flag": "https://flagcdn.com/w40/pk.png"
  },
  {
    "code": "PS",
    "name": "Palestine",
    "nameAr": "فلسطين",
    "flag": "https://flagcdn.com/w40/ps.png"
  },
  {
    "code": "PH",
    "name": "Philippines",
    "nameAr": "الفلبين",
    "flag": "https://flagcdn.com/w40/ph.png"
  },
  {
    "code": "PL",
    "name": "Poland",
    "nameAr": "بولندا",
    "flag": "https://flagcdn.com/w40/pl.png"
  },
  {
    "code": "PT",
    "name": "Portugal",
    "nameAr": "البرتغال",
    "flag": "https://flagcdn.com/w40/pt.png"
  },
  {
    "code": "QA",
    "name": "Qatar",
    "nameAr": "قطر",
    "flag": "https://flagcdn.com/w40/qa.png"
  },
  {
    "code": "RO",
    "name": "Romania",
    "nameAr": "رومانيا",
    "flag": "https://flagcdn.com/w40/ro.png"
  },
  {
    "code": "RU",
    "name": "Russia",
    "nameAr": "روسيا",
    "flag": "https://flagcdn.com/w40/ru.png"
  },
  {
    "code": "SA",
    "name": "Saudi Arabia",
    "nameAr": "السعودية",
    "flag": "https://flagcdn.com/w40/sa.png"
  },
  {
    "code": "RS",
    "name": "Serbia",
    "nameAr": "صربيا",
    "flag": "https://flagcdn.com/w40/rs.png"
  },
  {
    "code": "SG",
    "name": "Singapore",
    "nameAr": "سنغافورة",
    "flag": "https://flagcdn.com/w40/sg.png"
  },
  {
    "code": "ZA",
    "name": "South Africa",
    "nameAr": "جنوب أفريقيا",
    "flag": "https://flagcdn.com/w40/za.png"
  },
  {
    "code": "ES",
    "name": "Spain",
    "nameAr": "إسبانيا",
    "flag": "https://flagcdn.com/w40/es.png"
  },
  {
    "code": "SE",
    "name": "Sweden",
    "nameAr": "السويد",
    "flag": "https://flagcdn.com/w40/se.png"
  },
  {
    "code": "CH",
    "name": "Switzerland",
    "nameAr": "سويسرا",
    "flag": "https://flagcdn.com/w40/ch.png"
  },
  {
    "code": "TR",
    "name": "Turkey",
    "nameAr": "تركيا",
    "flag": "https://flagcdn.com/w40/tr.png"
  },
  {
    "code": "UA",
    "name": "Ukraine",
    "nameAr": "أوكرانيا",
    "flag": "https://flagcdn.com/w40/ua.png"
  },
  {
    "code": "AE",
    "name": "United Arab Emirates",
    "nameAr": "الإمارات",
    "flag": "https://flagcdn.com/w40/ae.png"
  },
  {
    "code": "GB",
    "name": "United Kingdom",
    "nameAr": "المملكة المتحدة",
    "flag": "https://flagcdn.com/w40/gb.png"
  },
  {
    "code": "US",
    "name": "United States",
    "nameAr": "الولايات المتحدة",
    "flag": "https://flagcdn.com/w40/us.png"
  },
  {
    "code": "VN",
    "name": "Vietnam",
    "nameAr": "فيتنام",
    "flag": "https://flagcdn.com/w40/vn.png"
  }
];

// export const nationalities_data: NationalitiesDataType[] = [
//   {
//     updated: "04-03-2012",
//     code: "Afghanistan",
//     description_en: "Afghan",
//   },
//   {
//     updated: "24-08-2023",
//     code: "\u00c5land Islands",
//     description_en: "\u00c5land Island",
//   },
//   {
//     updated: "08-12-2021",
//     code: "Albania",
//     description_en: "Albanian",
//   },
//   {
//     updated: "12-04-2014",
//     code: "Algeria",
//     description_en: "Algerian",
//   },
//   {
//     updated: "16-09-2018",
//     code: "American Samoa",
//     description_en: "American Samoan",
//   },
//   {
//     updated: "20-02-2011",
//     code: "Andorra",
//     description_en: "Andorran",
//   },
//   {
//     updated: "24-06-2024",
//     code: "Angola",
//     description_en: "Angolan",
//   },
//   {
//     updated: "06-10-2016",
//     code: "Anguilla",
//     description_en: "Anguillan",
//   },
//   {
//     updated: "10-10-2020",
//     code: "Antarctica",
//     description_en: "Antarctic",
//   },
//   {
//     updated: "28-11-2022",
//     code: "Antigua and Barbuda",
//     description_en: "Antiguan or Barbudan",
//   },
//   {
//     updated: "03-02-2023",
//     code: "Argentina",
//     description_en: "Argentine",
//   },
//   {
//     updated: "05=01-2013",
//     code: "Armenia",
//     description_en: "Armenian",
//   },
//   {
//     updated: "05-03-2003",
//     code: "Aruba",
//     description_en: "Aruban",
//   },
//   {
//     updated: "03-06-2023",
//     code: "Australia",
//     description_en: "Australian",
//   },
//   {
//     updated: "04-10-2020",
//     code: "Austria",
//     description_en: "Austrian",
//   },
//   {
//     updated: "31-08-2024",
//     code: "Azerbaijan",
//     description_en: "Azerbaijani, Azeri",
//   },
//   {
//     updated: "04-04-2004",
//     code: "Bahamas",
//     description_en: "Bahamian",
//   },
//   {
//     updated: "14-08-2023",
//     code: "Bahrain",
//     description_en: "Bahraini",
//   },
//   {
//     updated: "05-10-2021",
//     code: "Bangladesh",
//     description_en: "Bangladeshi",
//   },
//   {
//     updated: "25-02-2014",
//     code: "Barbados",
//     description_en: "Barbadian",
//   },
//   {
//     updated: "11-02-2021",
//     code: "Belarus",
//     description_en: "Belarusian",
//   },
//   {
//     updated: "05-06-2012",
//     code: "Belgium",
//     description_en: "Belgian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Belize",
//     description_en: "Belizean",
//   },
//   {
//     updated: "20-04-2012",
//     code: "Benin",
//     description_en: "Beninese, Beninois",
//   },
//   {
//     updated: "10-07-2021",
//     code: "Bermuda",
//     description_en: "Bermudian, Bermudan",
//   },
//   {
//     updated: "16-04-2024",
//     code: "Bhutan",
//     description_en: "Bhutanese",
//   },
//   {
//     updated: "26-08-2023",
//     code: "Bolivia (Plurinational State of)",
//     description_en: "Bolivian",
//   },
//   {
//     updated: "12-08-2012",
//     code: "Bonaire, Sint Eustatius and Saba",
//     description_en: "Bonaire",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Bosnia and Herzegovina",
//     description_en: "Bosnian or Herzegovinian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Botswana",
//     description_en: "Motswana, Botswanan",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Bouvet Island",
//     description_en: "Bouvet Island",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Brazil",
//     description_en: "Brazilian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "British Indian Ocean Territory",
//     description_en: "BIOT",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Brunei Darussalam",
//     description_en: "Bruneian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Bulgaria",
//     description_en: "Bulgarian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Burkina Faso",
//     description_en: "Burkinab\u00e9",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Burundi",
//     description_en: "Burundian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cabo Verde",
//     description_en: "Cabo Verdean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cambodia",
//     description_en: "Cambodian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cameroon",
//     description_en: "Cameroonian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Canada",
//     description_en: "Canadian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cayman Islands",
//     description_en: "Caymanian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Central African Republic",
//     description_en: "Central African",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Chad",
//     description_en: "Chadian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Chile",
//     description_en: "Chilean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "China",
//     description_en: "Chinese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Christmas Island",
//     description_en: "Christmas Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cocos (Keeling) Islands",
//     description_en: "Cocos Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Colombia",
//     description_en: "Colombian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Comoros",
//     description_en: "Comoran, Comorian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Congo (Republic of the)",
//     description_en: "Congolese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Congo (Democratic Republic of the)",
//     description_en: "Congolese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cook Islands",
//     description_en: "Cook Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Costa Rica",
//     description_en: "Costa Rican",
//   },
//   {
//     updated: "28-04-2022",
//     code: "C\u00f4te d'Ivoire",
//     description_en: "Ivorian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Croatia",
//     description_en: "Croatian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cuba",
//     description_en: "Cuban",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cura\u00e7ao",
//     description_en: "Cura\u00e7aoan",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cyprus",
//     description_en: "Cypriot",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Czech Republic",
//     description_en: "Czech",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Denmark",
//     description_en: "Danish",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Djibouti",
//     description_en: "Djiboutian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Dominica",
//     description_en: "Dominican",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Dominican Republic",
//     description_en: "Dominican",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Ecuador",
//     description_en: "Ecuadorian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Egypt",
//     description_en: "Egyptian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "El Salvador",
//     description_en: "Salvadoran",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Equatorial Guinea",
//     description_en: "Equatorial Guinean, Equatoguinean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Eritrea",
//     description_en: "Eritrean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Estonia",
//     description_en: "Estonian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Ethiopia",
//     description_en: "Ethiopian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Falkland Islands (Malvinas)",
//     description_en: "Falkland Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Faroe Islands",
//     description_en: "Faroese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Fiji",
//     description_en: "Fijian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Finland",
//     description_en: "Finnish",
//   },
//   {
//     updated: "28-04-2022",
//     code: "France",
//     description_en: "French",
//   },
//   {
//     updated: "28-04-2022",
//     code: "French Guiana",
//     description_en: "French Guianese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "French Polynesia",
//     description_en: "French Polynesian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "French Southern Territories",
//     description_en: "French Southern Territories",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Gabon",
//     description_en: "Gabonese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Gambia",
//     description_en: "Gambian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Georgia",
//     description_en: "Georgian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Germany",
//     description_en: "German",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Ghana",
//     description_en: "Ghanaian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Gibraltar",
//     description_en: "Gibraltar",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Greece",
//     description_en: "Greek, Hellenic",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Greenland",
//     description_en: "Greenlandic",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Grenada",
//     description_en: "Grenadian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guadeloupe",
//     description_en: "Guadeloupe",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guam",
//     description_en: "Guamanian, Guambat",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guatemala",
//     description_en: "Guatemalan",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guernsey",
//     description_en: "Channel Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Wallis and Futuna",
//     description_en: "Wallis and Futuna, Wallisian or Futunan",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Western Sahara",
//     description_en: "Sahrawi, Sahrawian, Sahraouian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Yemen",
//     description_en: "Yemeni",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Zambia",
//     description_en: "Zambian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Zimbabwe",
//     description_en: "Zimbabwean",
//   },
// ];

export const designations_data: DesignationsDataType[] = [
  {
    code: "#1",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated1-designation",
  },
  {
    code: "#2",
    description_en: "Designation 1",
    description_ar: "مريض كئيب",
    updated: "updated2-designation",
  },
  {
    code: "#3",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated3-designation",
  },
  {
    code: "#4",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated4-designation",
  },
  {
    code: "#5",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated5-designation",
  },
  {
    code: "#6",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated6-designation",
  },
  {
    code: "#7",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated7-designation",
  },
  {
    code: "#8",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated8-designation",
  },
  {
    code: "#9",
    description_en: "CEO-designation",
    description_ar: "الجسم مريض كئيب",
    updated: "updated9-designation",
  },
];
