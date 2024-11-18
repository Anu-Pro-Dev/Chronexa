export default function FormatNumber(num: number) {
  if (num >= 1_000_000) {
    // Format numbers in millions
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    // Format numbers in thousands
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num?.toString();
}

export function capitalizeFirstLetter(word: string) {
  if (!word || typeof word !== "string") {
    return "";
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function FORMAT_DATE_TO_STRING(dateString: string): string {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
}

export function FORMAT_DATE_TO_STRING_F2(dateString: string): string {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
}

export function FORMAT_DATE_TO_STRING_F3(dateString: string): string {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];

  return `${day} ${month} ${year}`;
}

export function GetGreeting(): string {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good Morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    return "Good Afternoon";
  } else if (currentHour >= 17 && currentHour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
}
