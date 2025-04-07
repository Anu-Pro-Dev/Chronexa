import {
  LocationsDataType,
  CitizenshipDataType,
  DesignationsDataType,
  GradesDataType,
} from "./types/types";

export const locations_columns = [
  "select",
  "descriptionEng",
  "descriptionArb",
  "actions",
];

export const citizenship_columns = [
  "select",
  "code",
  "name",
  "nameAr",
  "actions",
];

export const designations_columns = [
  "select",
  "code",
  "descriptionEng",
  "descriptionArb",
  "updated",
  "actions",
];

export const grades_columns = [
  "select",
  "code",
  "descriptionEng",
  "descriptionArb",
  "overtime_eligible",
  "senior_employee",
  "updated",
  "actions",
];

export const locations_data: LocationsDataType[] = [
  {
    code: "97",
    descriptionEng: "body ick dreary",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19",
  },
  {
    code: "3056",
    descriptionEng: "consonant carefully boring",
    descriptionArb: "ساكن مملة بعناية",
    updated: "2024-02-01",
  },
  {
    code: "3",
    descriptionEng: "till",
    descriptionArb: "الجسم",
    updated: "2025-12-31",
  },
  {
    code: "51",
    descriptionEng: "harbour regarding afore",
    descriptionArb: "ميناء بخصوص ما سبق",
    updated: "2024-08-09",
  },
  {
    code: "90",
    descriptionEng: "because",
    descriptionArb: "لأن",
    updated: "2024-11-29",
  },
  {
    code: "2922",
    descriptionEng: "oof likewise",
    descriptionArb: "اوف كذلك",
    updated: "2024-10-12",
  },
  {
    code: "545",
    descriptionEng: "shelve",
    descriptionArb: "كذلك",
    updated: "2024-04-07",
  },
  {
    code: "6",
    descriptionEng: "whereas hm upward",
    descriptionArb: "بينما هم إلى أعلى",
    updated: "2024-01-14",
  },
  {
    code: "673",
    descriptionEng: "symptom before",
    descriptionArb: "ينما هم إلى",
    updated: "2024-08-11",
  },
  {
    code: "1435",
    descriptionEng: "noted physically thumb",
    descriptionArb: "وأشار جسديا الإبهام",
    updated: "2024-08-13",
  },
  {
    code: "502",
    descriptionEng: "majestically boastfully absent",
    descriptionArb: "غائبة بشكل مهيب",
    updated: "2024-06-27",
  },
  {
    code: "210",
    descriptionEng: "unfortunately female",
    descriptionArb: "أنثى للأسف",
    updated: "2024-08-20",
  },
  {
    code: "3",
    descriptionEng: "after",
    descriptionArb: "أنثى",
    updated: "2025-02-28",
  },
  {
    code: "3278",
    descriptionEng: "openly tuxedo",
    descriptionArb: "للأسف",
    updated: "2024-08-29",
  },
  {
    code: "1726",
    descriptionEng: "gladly pfft yahoo",
    descriptionArb: "وفي الوقت نفسه على الرغم من",
    updated: "2024-08-10",
  },
  {
    code: "8",
    descriptionEng: "gosh and inasmuch",
    descriptionArb: "وفي الوقت نفسه",
    updated: "2024-08-15",
  },
  {
    code: "1513",
    descriptionEng: "barring as",
    descriptionArb: "وفي الوقتن",
    updated: "2024-11-20",
  },
  {
    code: "7",
    descriptionEng: "cone",
    descriptionArb: "الوقت",
    updated: "2024-01-27",
  },
  {
    code: "658",
    descriptionEng: "aw yuck hungry",
    descriptionArb: "وفي الوقت الرغم ",
    updated: "2024-08-19",
  },
  {
    code: "6290",
    descriptionEng: "aboard judgementally",
    descriptionArb: "وفي الوقت نفسه على الرغم",
    updated: "2024-08-19",
  },
  {
    code: "1131",
    descriptionEng: "wearily",
    descriptionArb: "وفي الوقت نفسهن",
    updated: "2024-08-07",
  },
  {
    code: "4041",
    descriptionEng: "final",
    descriptionArb: "وفي الوقت نفسه على الرغم من",
    updated: "2024-04-16",
  },
  {
    code: "4588",
    descriptionEng: "provided",
    descriptionArb: "الوقت الرغ من",
    updated: "2024-08-19",
  },
  {
    code: "6214",
    descriptionEng: "meanwhile whereas notwithstanding",
    descriptionArb: "وفي الوقت نفسه على الرغم من",
    updated: "2024-08-06",
  },
  // {
  //   code: "1",
  //   descriptionEng: "which eek",
  //   updated: "2024-08-20T04:19:52.447Z",
  // },
  // {
  //   code: "2546",
  //   descriptionEng: "stir accelerate",
  //   updated: "2024-08-20T00:22:23.091Z",
  // },
  // {
  //   code: "74",
  //   descriptionEng: "aw way",
  //   updated: "2024-08-19T22:00:41.969Z",
  // },
  // {
  //   code: "712",
  //   descriptionEng: "upon fondly",
  //   updated: "2024-08-20T00:56:46.367Z",
  // },
  // {
  //   code: "5588",
  //   descriptionEng: "whenever",
  //   updated: "2024-08-20T07:39:13.287Z",
  // },
  // {
  //   code: "148",
  //   descriptionEng: "detain surname",
  //   updated: "2024-08-20T06:21:44.627Z",
  // },
  // {
  //   code: "651",
  //   descriptionEng: "to",
  //   updated: "2024-08-19T17:53:49.975Z",
  // },
  // {
  //   code: "3195",
  //   descriptionEng: "now hence supposing",
  //   updated: "2024-08-20T02:30:33.888Z",
  // },
  // {
  //   code: "18",
  //   descriptionEng: "ram rider",
  //   updated: "2024-08-20T04:38:41.172Z",
  // },
  // {
  //   code: "1",
  //   descriptionEng: "jubilantly which",
  //   updated: "2024-08-19T17:07:34.959Z",
  // },
  // {
  //   code: "2868",
  //   descriptionEng: "notwithstanding",
  //   updated: "2024-08-19T22:21:58.123Z",
  // },
  // {
  //   code: "7057",
  //   descriptionEng: "bah of consequently",
  //   updated: "2024-08-19T23:29:16.757Z",
  // },
  // {
  //   code: "5549",
  //   descriptionEng: "melodic aw frame",
  //   updated: "2024-08-19T14:41:24.773Z",
  // },
  // {
  //   code: "8646",
  //   descriptionEng: "um pendant",
  //   updated: "2024-08-19T14:06:48.262Z",
  // },
  // {
  //   code: "5208",
  //   descriptionEng: "given considering",
  //   updated: "2024-08-19T20:02:44.011Z",
  // },
  // {
  //   code: "859",
  //   descriptionEng: "nobble geez",
  //   updated: "2024-08-19T19:58:48.168Z",
  // },
  // {
  //   code: "70",
  //   descriptionEng: "the vaguely",
  //   updated: "2024-08-19T11:49:01.685Z",
  // },
  // {
  //   code: "48",
  //   descriptionEng: "properly amid joyfully",
  //   updated: "2024-08-19T14:11:27.669Z",
  // },
  // {
  //   code: "5945",
  //   descriptionEng: "successfully commonly",
  //   updated: "2024-08-19T14:51:33.806Z",
  // },
  // {
  //   code: "706",
  //   descriptionEng: "unlike deceivingly",
  //   updated: "2024-08-19T17:21:00.738Z",
  // },
  // {
  //   code: "8",
  //   descriptionEng: "shocking exemplary",
  //   updated: "2024-08-19T16:46:48.352Z",
  // },
  // {
  //   code: "5",
  //   descriptionEng: "readily",
  //   updated: "2024-08-19T12:27:33.922Z",
  // },
  // {
  //   code: "329",
  //   descriptionEng: "zowie astride pish",
  //   updated: "2024-08-19T16:30:58.428Z",
  // },
  // {
  //   code: "2",
  //   descriptionEng: "married eliminate",
  //   updated: "2024-08-20T00:06:53.589Z",
  // },
  // {
  //   code: "9",
  //   descriptionEng: "medical truck",
  //   updated: "2024-08-19T10:50:29.739Z",
  // },
  // {
  //   code: "6839",
  //   descriptionEng: "yum via",
  //   updated: "2024-08-19T12:31:30.454Z",
  // },
  // {
  //   code: "2",
  //   descriptionEng: "incidentally cinch",
  //   updated: "2024-08-19T20:11:00.498Z",
  // },
  // {
  //   code: "5115",
  //   descriptionEng: "chip anchored",
  //   updated: "2024-08-19T15:03:04.483Z",
  // },
  // {
  //   code: "2",
  //   descriptionEng: "next",
  //   updated: "2024-08-20T04:05:08.820Z",
  // },
  // {
  //   code: "9471",
  //   descriptionEng: "extend what excommunicate",
  //   updated: "2024-08-20T07:51:21.633Z",
  // },
  // {
  //   code: "7",
  //   descriptionEng: "hourly",
  //   updated: "2024-08-19T16:51:54.361Z",
  // },
  // {
  //   code: "172",
  //   descriptionEng: "unless alter",
  //   updated: "2024-08-19T11:24:27.698Z",
  // },
  // {
  //   code: "984",
  //   descriptionEng: "perfectly",
  //   updated: "2024-08-19T10:09:45.580Z",
  // },
  // {
  //   code: "6",
  //   descriptionEng: "till exalted grim",
  //   updated: "2024-08-20T02:10:36.362Z",
  // },
  // {
  //   code: "1127",
  //   descriptionEng: "steel",
  //   updated: "2024-08-19T22:59:28.734Z",
  // },
  // {
  //   code: "12",
  //   descriptionEng: "rest how buddy",
  //   updated: "2024-08-19T10:01:15.078Z",
  // },
  // {
  //   code: "676",
  //   descriptionEng: "photodiode",
  //   updated: "2024-08-19T15:02:45.545Z",
  // },
  // {
  //   code: "503",
  //   descriptionEng: "sedately phew",
  //   updated: "2024-08-20T04:16:52.941Z",
  // },
  // {
  //   code: "29",
  //   descriptionEng: "filly as",
  //   updated: "2024-08-19T10:57:47.867Z",
  // },
  // {
  //   code: "879",
  //   descriptionEng: "forecast bleakly",
  //   updated: "2024-08-19T13:08:02.513Z",
  // },
  // {
  //   code: "7143",
  //   descriptionEng: "yahoo",
  //   updated: "2024-08-19T14:48:51.204Z",
  // },
  // {
  //   code: "545",
  //   descriptionEng: "mitten",
  //   updated: "2024-08-20T01:50:24.789Z",
  // },
  // {
  //   code: "491",
  //   descriptionEng: "coin basics cobble",
  //   updated: "2024-08-20T01:50:49.774Z",
  // },
  // {
  //   code: "525",
  //   descriptionEng: "yet gybe woeful",
  //   updated: "2024-08-20T01:26:36.138Z",
  // },
  // {
  //   code: "10",
  //   descriptionEng: "melodic whenever behind",
  //   updated: "2024-08-19T15:22:55.692Z",
  // },
  // {
  //   code: "1",
  //   descriptionEng: "whoa convey eagle",
  //   updated: "2024-08-19T17:00:19.427Z",
  // },
  // {
  //   code: "930",
  //   descriptionEng: "next integrity",
  //   updated: "2024-08-19T10:23:59.081Z",
  // },
  // {
  //   code: "46",
  //   descriptionEng: "following coolly including",
  //   updated: "2024-08-19T09:35:06.763Z",
  // },
  // {
  //   code: "48",
  //   descriptionEng: "marinate vice",
  //   updated: "2024-08-19T15:18:00.379Z",
  // },
  // {
  //   code: "599",
  //   descriptionEng: "yet strawman lightly",
  //   updated: "2024-08-19T18:01:06.043Z",
  // },
  // {
  //   code: "88",
  //   descriptionEng: "tenet notwithstanding",
  //   updated: "2024-08-19T15:42:51.724Z",
  // },
  // {
  //   code: "4",
  //   descriptionEng: "ectodermal regenerate",
  //   updated: "2024-08-19T14:56:05.415Z",
  // },
  // {
  //   code: "6",
  //   descriptionEng: "ha",
  //   updated: "2024-08-20T06:35:55.816Z",
  // },
  // {
  //   code: "3416",
  //   descriptionEng: "lest bubbly",
  //   updated: "2024-08-20T00:25:47.138Z",
  // },
  // {
  //   code: "9",
  //   descriptionEng: "of acknowledgment",
  //   updated: "2024-08-19T23:32:13.801Z",
  // },
  // {
  //   code: "306",
  //   descriptionEng: "like",
  //   updated: "2024-08-19T11:27:09.141Z",
  // },
  // {
  //   code: "18",
  //   descriptionEng: "while",
  //   updated: "2024-08-19T18:48:29.358Z",
  // },
  // {
  //   code: "69",
  //   descriptionEng: "dent beneath",
  //   updated: "2024-08-19T23:53:05.123Z",
  // },
  // {
  //   code: "871",
  //   descriptionEng: "scarily kip by",
  //   updated: "2024-08-19T16:48:13.140Z",
  // },
  // {
  //   code: "3",
  //   descriptionEng: "damaged which",
  //   updated: "2024-08-19T13:30:32.773Z",
  // },
  // {
  //   code: "9",
  //   descriptionEng: "gadzooks stark",
  //   updated: "2024-08-19T15:57:34.606Z",
  // },
  // {
  //   code: "56",
  //   descriptionEng: "stonewall",
  //   updated: "2024-08-19T11:27:04.948Z",
  // },
  // {
  //   code: "867",
  //   descriptionEng: "offer",
  //   updated: "2024-08-19T16:38:07.654Z",
  // },
  // {
  //   code: "2",
  //   descriptionEng: "inconsequential once",
  //   updated: "2024-08-19T18:12:46.237Z",
  // },
  // {
  //   code: "93",
  //   descriptionEng: "wearily",
  //   updated: "2024-08-19T21:58:17.001Z",
  // },
  // {
  //   code: "1165",
  //   descriptionEng: "crowd",
  //   updated: "2024-08-19T16:04:28.463Z",
  // },
  // {
  //   code: "4",
  //   descriptionEng: "where",
  //   updated: "2024-08-19T13:45:32.957Z",
  // },
  // {
  //   code: "55",
  //   descriptionEng: "furthermore eek",
  //   updated: "2024-08-19T08:36:36.035Z",
  // },
  // {
  //   code: "47",
  //   descriptionEng: "faithfully ick user",
  //   updated: "2024-08-20T06:42:59.944Z",
  // },
  // {
  //   code: "5608",
  //   descriptionEng: "boo strictly",
  //   updated: "2024-08-20T02:55:23.251Z",
  // },
  // {
  //   code: "55",
  //   descriptionEng: "receipt",
  //   updated: "2024-08-20T06:24:22.204Z",
  // },
  // {
  //   code: "44",
  //   descriptionEng: "before tent",
  //   updated: "2024-08-20T01:07:47.009Z",
  // },
  // {
  //   code: "54",
  //   descriptionEng: "accelerant lest incidentally",
  //   updated: "2024-08-20T01:09:00.961Z",
  // },
  // {
  //   code: "260",
  //   descriptionEng: "beware hide",
  //   updated: "2024-08-19T16:28:28.476Z",
  // },
  // {
  //   code: "4835",
  //   descriptionEng: "zealous forenenst",
  //   updated: "2024-08-20T00:55:10.853Z",
  // },
  // {
  //   code: "89",
  //   descriptionEng: "index aha",
  //   updated: "2024-08-20T00:14:12.323Z",
  // },
];

export const grades_data: GradesDataType[] = [
  {
    code: "97",
    descriptionEng: "body ick dreary",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T00:52:14.982Z",
    overtime_eligible: "✡️",
    senior_employee: "😱",
  },
  {
    code: "944",
    descriptionEng: "release pish",
    descriptionArb: "الجسم مريض",
    updated: "2024-08-19T14:45:11.984Z",
    overtime_eligible: "㊗️",
    senior_employee: "❣️",
  },
  {
    code: "3",
    descriptionEng: "till",
    descriptionArb: "الجسم",
    updated: "2024-08-19T12:31:28.171Z",
    overtime_eligible: "🍱",
    senior_employee: "🤲🏼",
  },
  {
    code: "31",
    descriptionEng: "ozone septicaemia bootie",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T04:28:00.901Z",
    overtime_eligible: "🇪🇬",
    senior_employee: "👌🏻",
  },
  {
    code: "106",
    descriptionEng: "authorized dill reciprocate",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T23:40:49.014Z",
    overtime_eligible: "🍘",
    senior_employee: "💋",
  },
  {
    code: "161",
    descriptionEng: "maracas justly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T22:35:29.515Z",
    overtime_eligible: "🙌🏾",
    senior_employee: "🇬🇱",
  },
  {
    code: "67",
    descriptionEng: "ritualize silly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T01:14:22.219Z",
    overtime_eligible: "🔸",
    senior_employee: "👻",
  },
  {
    code: "60",
    descriptionEng: "underweight",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T01:43:06.258Z",
    overtime_eligible: "🐏",
    senior_employee: "🛋️",
  },
  {
    code: "6307",
    descriptionEng: "ha abaft",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T05:03:27.449Z",
    overtime_eligible: "🇸🇸",
    senior_employee: "⛳",
  },
  {
    code: "1141",
    descriptionEng: "robotics or oh",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T23:16:41.772Z",
    overtime_eligible: "🙍🏾‍♀️",
    senior_employee: "♌",
  },
  {
    code: "359",
    descriptionEng: "so shore howl",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T14:47:19.717Z",
    overtime_eligible: "⚒️",
    senior_employee: "🍚",
  },
  {
    code: "23",
    descriptionEng: "sedate",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T06:05:47.809Z",
    overtime_eligible: "🪄",
    senior_employee: "😓",
  },
  {
    code: "110",
    descriptionEng: "pfft",
    descriptionArb: "الجسمكئيب مريض",
    updated: "2024-08-20T07:51:44.372Z",
    overtime_eligible: "⛑️",
    senior_employee: "🦻🏿",
  },
  {
    code: "490",
    descriptionEng: "yet as inspect",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T03:53:49.076Z",
    overtime_eligible: "🔥",
    senior_employee: "🤛🏾",
  },
  {
    code: "4",
    descriptionEng: "barring as",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T06:28:10.046Z",
    overtime_eligible: "🙉",
    senior_employee: "🖐🏾",
  },
  {
    code: "30",
    descriptionEng: "teeming what unless",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T11:10:43.469Z",
    overtime_eligible: "🧅",
    senior_employee: "💼",
  },
  {
    code: "9399",
    descriptionEng: "emigrate whoever",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T16:06:49.211Z",
    overtime_eligible: "🇬🇲",
    senior_employee: "🦎",
  },
  {
    code: "1131",
    descriptionEng: "wearily",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T12:26:32.020Z",
    overtime_eligible: "🔁",
    senior_employee: "😲",
  },
  {
    code: "1",
    descriptionEng: "however",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T12:57:04.523Z",
    overtime_eligible: "🦜",
    senior_employee: "⚫",
  },
  {
    code: "8",
    descriptionEng: "shock",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T21:39:50.804Z",
    overtime_eligible: "🙆‍♂️",
    senior_employee: "🧊",
  },
  {
    code: "309",
    descriptionEng: "daffodil suspiciously",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T21:22:53.688Z",
    overtime_eligible: "🧨",
    senior_employee: "😄",
  },
  {
    code: "16",
    descriptionEng: "gasp fooey",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T21:43:14.370Z",
    overtime_eligible: "🍡",
    senior_employee: "🦒",
  },
  {
    code: "667",
    descriptionEng: "towards",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T11:24:05.965Z",
    overtime_eligible: "🐪",
    senior_employee: "🏒",
  },
  {
    code: "43",
    descriptionEng: "questioningly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T22:02:19.377Z",
    overtime_eligible: "🥔",
    senior_employee: "🇭🇺",
  },
  {
    code: "712",
    descriptionEng: "upon fondly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T04:20:32.830Z",
    overtime_eligible: "🔰",
    senior_employee: "🪐",
  },
  {
    code: "2507",
    descriptionEng: "for",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T16:01:52.623Z",
    overtime_eligible: "🦕",
    senior_employee: "💌",
  },
  {
    code: "70",
    descriptionEng: "surname",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T09:45:31.089Z",
    overtime_eligible: "🪀",
    senior_employee: "💒",
  },
  {
    code: "5",
    descriptionEng: "gosh foolishly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T06:15:54.886Z",
    overtime_eligible: "☝️",
    senior_employee: "👍🏾",
  },
  {
    code: "37",
    descriptionEng: "haste",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T07:43:54.148Z",
    overtime_eligible: "🎽",
    senior_employee: "👨🏿‍🎨",
  },
  {
    code: "9",
    descriptionEng: "ram rider",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T08:02:27.634Z",
    overtime_eligible: "👩🏽",
    senior_employee: "🌥️",
  },
  {
    code: "7033",
    descriptionEng: "which functional",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T09:08:37.539Z",
    overtime_eligible: "👹",
    senior_employee: "🗄️",
  },
  {
    code: "6477",
    descriptionEng: "happily",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T05:20:38.340Z",
    overtime_eligible: "💃",
    senior_employee: "🥎",
  },
  {
    code: "8546",
    descriptionEng: "hm popular strident",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T08:15:48.035Z",
    overtime_eligible: "🥩",
    senior_employee: "🚺",
  },
  {
    code: "257",
    descriptionEng: "recall openly pfft",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T06:06:15.359Z",
    overtime_eligible: "🧖🏿",
    senior_employee: "🛁",
  },
  {
    code: "20",
    descriptionEng: "egghead condition moist",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T06:14:42.209Z",
    overtime_eligible: "🇵🇸",
    senior_employee: "☮️",
  },
  {
    code: "6",
    descriptionEng: "legging before influence",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T17:07:28.974Z",
    overtime_eligible: "🖲️",
    senior_employee: "🇸🇽",
  },
  {
    code: "48",
    descriptionEng: "properly amid joyfully",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T17:35:14.132Z",
    overtime_eligible: "✖️",
    senior_employee: "🇮🇴",
  },
  {
    code: "564",
    descriptionEng: "annual",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T19:49:30.730Z",
    overtime_eligible: "🧤",
    senior_employee: "🙏🏻",
  },
  {
    code: "706",
    descriptionEng: "unlike deceivingly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T20:44:47.201Z",
    overtime_eligible: "🦿",
    senior_employee: "🔮",
  },
  {
    code: "5987",
    descriptionEng: "exemplary pish friendly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T04:45:20.400Z",
    overtime_eligible: "🇿🇦",
    senior_employee: "🧘🏿‍♂️",
  },
  {
    code: "537",
    descriptionEng: "astride pish upwardly",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T14:53:09.853Z",
    overtime_eligible: "✔️",
    senior_employee: "🕑",
  },
  {
    code: "58",
    descriptionEng: "dash incompatible",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T07:37:37.599Z",
    overtime_eligible: "👩🏾‍❤️‍👨🏼",
    senior_employee: "🐩",
  },
  {
    code: "8958",
    descriptionEng: "cuckoo boo",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T01:35:15.419Z",
    overtime_eligible: "🇸🇲",
    senior_employee: "🤏🏽",
  },
  {
    code: "71",
    descriptionEng: "domain",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T06:01:19.599Z",
    overtime_eligible: "👻",
    senior_employee: "👎🏼",
  },
  {
    code: "5115",
    descriptionEng: "chip anchored",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-19T18:26:50.946Z",
    overtime_eligible: "🤫",
    senior_employee: "😉",
  },
  {
    code: "83",
    descriptionEng: "speedily",
    descriptionArb: "الجسم مريض كئيب",
    updated: "2024-08-20T06:48:44.036Z",
    overtime_eligible: "↩️",
    senior_employee: "🛷",
  },
];

export const citizenship_data: CitizenshipDataType[] = [
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
//     descriptionEng: "Afghan",
//   },
//   {
//     updated: "24-08-2023",
//     code: "\u00c5land Islands",
//     descriptionEng: "\u00c5land Island",
//   },
//   {
//     updated: "08-12-2021",
//     code: "Albania",
//     descriptionEng: "Albanian",
//   },
//   {
//     updated: "12-04-2014",
//     code: "Algeria",
//     descriptionEng: "Algerian",
//   },
//   {
//     updated: "16-09-2018",
//     code: "American Samoa",
//     descriptionEng: "American Samoan",
//   },
//   {
//     updated: "20-02-2011",
//     code: "Andorra",
//     descriptionEng: "Andorran",
//   },
//   {
//     updated: "24-06-2024",
//     code: "Angola",
//     descriptionEng: "Angolan",
//   },
//   {
//     updated: "06-10-2016",
//     code: "Anguilla",
//     descriptionEng: "Anguillan",
//   },
//   {
//     updated: "10-10-2020",
//     code: "Antarctica",
//     descriptionEng: "Antarctic",
//   },
//   {
//     updated: "28-11-2022",
//     code: "Antigua and Barbuda",
//     descriptionEng: "Antiguan or Barbudan",
//   },
//   {
//     updated: "03-02-2023",
//     code: "Argentina",
//     descriptionEng: "Argentine",
//   },
//   {
//     updated: "05=01-2013",
//     code: "Armenia",
//     descriptionEng: "Armenian",
//   },
//   {
//     updated: "05-03-2003",
//     code: "Aruba",
//     descriptionEng: "Aruban",
//   },
//   {
//     updated: "03-06-2023",
//     code: "Australia",
//     descriptionEng: "Australian",
//   },
//   {
//     updated: "04-10-2020",
//     code: "Austria",
//     descriptionEng: "Austrian",
//   },
//   {
//     updated: "31-08-2024",
//     code: "Azerbaijan",
//     descriptionEng: "Azerbaijani, Azeri",
//   },
//   {
//     updated: "04-04-2004",
//     code: "Bahamas",
//     descriptionEng: "Bahamian",
//   },
//   {
//     updated: "14-08-2023",
//     code: "Bahrain",
//     descriptionEng: "Bahraini",
//   },
//   {
//     updated: "05-10-2021",
//     code: "Bangladesh",
//     descriptionEng: "Bangladeshi",
//   },
//   {
//     updated: "25-02-2014",
//     code: "Barbados",
//     descriptionEng: "Barbadian",
//   },
//   {
//     updated: "11-02-2021",
//     code: "Belarus",
//     descriptionEng: "Belarusian",
//   },
//   {
//     updated: "05-06-2012",
//     code: "Belgium",
//     descriptionEng: "Belgian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Belize",
//     descriptionEng: "Belizean",
//   },
//   {
//     updated: "20-04-2012",
//     code: "Benin",
//     descriptionEng: "Beninese, Beninois",
//   },
//   {
//     updated: "10-07-2021",
//     code: "Bermuda",
//     descriptionEng: "Bermudian, Bermudan",
//   },
//   {
//     updated: "16-04-2024",
//     code: "Bhutan",
//     descriptionEng: "Bhutanese",
//   },
//   {
//     updated: "26-08-2023",
//     code: "Bolivia (Plurinational State of)",
//     descriptionEng: "Bolivian",
//   },
//   {
//     updated: "12-08-2012",
//     code: "Bonaire, Sint Eustatius and Saba",
//     descriptionEng: "Bonaire",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Bosnia and Herzegovina",
//     descriptionEng: "Bosnian or Herzegovinian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Botswana",
//     descriptionEng: "Motswana, Botswanan",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Bouvet Island",
//     descriptionEng: "Bouvet Island",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Brazil",
//     descriptionEng: "Brazilian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "British Indian Ocean Territory",
//     descriptionEng: "BIOT",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Brunei Darussalam",
//     descriptionEng: "Bruneian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Bulgaria",
//     descriptionEng: "Bulgarian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Burkina Faso",
//     descriptionEng: "Burkinab\u00e9",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Burundi",
//     descriptionEng: "Burundian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cabo Verde",
//     descriptionEng: "Cabo Verdean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cambodia",
//     descriptionEng: "Cambodian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cameroon",
//     descriptionEng: "Cameroonian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Canada",
//     descriptionEng: "Canadian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cayman Islands",
//     descriptionEng: "Caymanian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Central African Republic",
//     descriptionEng: "Central African",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Chad",
//     descriptionEng: "Chadian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Chile",
//     descriptionEng: "Chilean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "China",
//     descriptionEng: "Chinese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Christmas Island",
//     descriptionEng: "Christmas Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cocos (Keeling) Islands",
//     descriptionEng: "Cocos Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Colombia",
//     descriptionEng: "Colombian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Comoros",
//     descriptionEng: "Comoran, Comorian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Congo (Republic of the)",
//     descriptionEng: "Congolese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Congo (Democratic Republic of the)",
//     descriptionEng: "Congolese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cook Islands",
//     descriptionEng: "Cook Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Costa Rica",
//     descriptionEng: "Costa Rican",
//   },
//   {
//     updated: "28-04-2022",
//     code: "C\u00f4te d'Ivoire",
//     descriptionEng: "Ivorian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Croatia",
//     descriptionEng: "Croatian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cuba",
//     descriptionEng: "Cuban",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cura\u00e7ao",
//     descriptionEng: "Cura\u00e7aoan",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Cyprus",
//     descriptionEng: "Cypriot",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Czech Republic",
//     descriptionEng: "Czech",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Denmark",
//     descriptionEng: "Danish",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Djibouti",
//     descriptionEng: "Djiboutian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Dominica",
//     descriptionEng: "Dominican",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Dominican Republic",
//     descriptionEng: "Dominican",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Ecuador",
//     descriptionEng: "Ecuadorian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Egypt",
//     descriptionEng: "Egyptian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "El Salvador",
//     descriptionEng: "Salvadoran",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Equatorial Guinea",
//     descriptionEng: "Equatorial Guinean, Equatoguinean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Eritrea",
//     descriptionEng: "Eritrean",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Estonia",
//     descriptionEng: "Estonian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Ethiopia",
//     descriptionEng: "Ethiopian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Falkland Islands (Malvinas)",
//     descriptionEng: "Falkland Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Faroe Islands",
//     descriptionEng: "Faroese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Fiji",
//     descriptionEng: "Fijian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Finland",
//     descriptionEng: "Finnish",
//   },
//   {
//     updated: "28-04-2022",
//     code: "France",
//     descriptionEng: "French",
//   },
//   {
//     updated: "28-04-2022",
//     code: "French Guiana",
//     descriptionEng: "French Guianese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "French Polynesia",
//     descriptionEng: "French Polynesian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "French Southern Territories",
//     descriptionEng: "French Southern Territories",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Gabon",
//     descriptionEng: "Gabonese",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Gambia",
//     descriptionEng: "Gambian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Georgia",
//     descriptionEng: "Georgian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Germany",
//     descriptionEng: "German",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Ghana",
//     descriptionEng: "Ghanaian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Gibraltar",
//     descriptionEng: "Gibraltar",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Greece",
//     descriptionEng: "Greek, Hellenic",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Greenland",
//     descriptionEng: "Greenlandic",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Grenada",
//     descriptionEng: "Grenadian",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guadeloupe",
//     descriptionEng: "Guadeloupe",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guam",
//     descriptionEng: "Guamanian, Guambat",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guatemala",
//     descriptionEng: "Guatemalan",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Guernsey",
//     descriptionEng: "Channel Island",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Wallis and Futuna",
//     descriptionEng: "Wallis and Futuna, Wallisian or Futunan",
//   },
//   {
//     updated: "28-04-2022",
//     code: "Western Sahara",
//     descriptionEng: "Sahrawi, Sahrawian, Sahraouian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Yemen",
//     descriptionEng: "Yemeni",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Zambia",
//     descriptionEng: "Zambian",
//   },
//   {
//     updated: "15-03-2015",
//     code: "Zimbabwe",
//     descriptionEng: "Zimbabwean",
//   },
// ];

export const designations_data: DesignationsDataType[] = [
  {
    code: "#1",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated1-designation",
  },
  {
    code: "#2",
    descriptionEng: "Designation 1",
    descriptionArb: "مريض كئيب",
    updated: "updated2-designation",
  },
  {
    code: "#3",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated3-designation",
  },
  {
    code: "#4",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated4-designation",
  },
  {
    code: "#5",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated5-designation",
  },
  {
    code: "#6",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated6-designation",
  },
  {
    code: "#7",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated7-designation",
  },
  {
    code: "#8",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated8-designation",
  },
  {
    code: "#9",
    descriptionEng: "CEO-designation",
    descriptionArb: "الجسم مريض كئيب",
    updated: "updated9-designation",
  },
];
