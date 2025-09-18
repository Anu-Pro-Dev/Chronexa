import toast from "react-hot-toast";
import { useLanguage } from "@/src/providers/LanguageProvider";

export function useShowToast() {
  const { translations } = useLanguage();
  const toastT = translations?.toastNotifications || {};

  return (
    type: "success" | "error" | "loading" | "default",
    keyOrMessage: string,
    useTranslation: boolean = true // default = true
  ) => {
    // if useTranslation = true → look inside translations
    // else → just show raw static message
    const message = useTranslation
      ? toastT[keyOrMessage] || keyOrMessage
      : keyOrMessage;

    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "loading":
        toast.loading(message);
        break;
      default:
        toast(message);
    }
  };
}
