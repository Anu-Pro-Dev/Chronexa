import toast from "react-hot-toast";
import { useLanguage } from "@/src/providers/LanguageProvider";

type ToastType = "success" | "error" | "loading" | "default";

export function useShowToast() {
  const { translations, language } = useLanguage();
  const toastT = translations?.toastNotifications || {};
  const plurals = translations?.plurals || {}; // map for Arabic plural forms

  return (
    type: ToastType,
    keyOrMessage: string,
    params?: Record<string, any> | string,
    useTranslation: boolean = true
  ) => {
    let message = useTranslation ? toastT[keyOrMessage] || keyOrMessage : keyOrMessage;

    if (params !== undefined) {
      if (typeof params === "string") {
        // If params is just a string, replace placeholder or append
        message = message.includes("{value}")
          ? message.replace("{value}", params)
          : `${message}: ${params}`;
      } else {
        // params as object
        const { count, displayText } = params;

        if (language === "ar" && count !== undefined && displayText) {
          // Arabic pluralization
          const finalDisplay =
            count === 1
              ? displayText
              : plurals[displayText] || displayText + "ات"; // fallback plural
          message = message
            .replace("{count}", String(count))
            .replace("{displayText}", finalDisplay);
        } else {
          // Replace all placeholders for English / default
          Object.entries(params).forEach(([k, v]) => {
            message = message.replace(`{${k}}`, String(v));
          });
        }
      }
    }

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