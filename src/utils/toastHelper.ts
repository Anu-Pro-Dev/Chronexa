import toast from "react-hot-toast";
import { useLanguage } from "@/src/providers/LanguageProvider";

type ToastType = "success" | "error" | "loading" | "default";

export function useShowToast() {
  const { translations, language } = useLanguage();
  const toastT = translations?.toastNotifications || {};
  const plurals = translations?.plurals || {};

  return (
    type: ToastType,
    keyOrMessage: string,
    params?: Record<string, any> | string,
    useTranslation: boolean = true
  ) => {
    let message = useTranslation ? toastT[keyOrMessage] || keyOrMessage : keyOrMessage;

    if (params !== undefined) {
      if (typeof params === "string") {
        message = message.includes("{value}")
          ? message.replace("{value}", params)
          : `${message}: ${params}`;
      } else {
        const { count, displayText } = params;

        if (language === "ar" && count !== undefined && displayText) {
          const finalDisplay =
            count === 1
              ? displayText
              : plurals[displayText] || displayText + "ات";
          message = message
            .replace("{count}", String(count))
            .replace("{displayText}", finalDisplay);
        } else {
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