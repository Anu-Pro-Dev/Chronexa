import toast from "react-hot-toast";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useLiteLanguage } from "@/src/providers/LiteLanguageProvider";

type ToastType = "success" | "error" | "loading" | "default";

export function useShowToast() {
  let translations: any = null;
  let language: string = "en";
  let isLiteProvider = false;

  try {
    const fullContext = useLanguage();
    translations = fullContext.translations;
    language = fullContext.language;
  } catch (e) {
    try {
      const liteContext = useLiteLanguage();
      translations = liteContext.translations;
      language = liteContext.language;
      isLiteProvider = true;
    } catch (e2) {
      console.warn('No language provider available for toast');
    }
  }

  const toastT = translations?.toastNotifications || {};
  const plurals = translations?.plurals || {};

  return (
    type: ToastType,
    keyOrMessage?: string | null,
    params?: Record<string, any> | string | null,
    useTranslation: boolean = true
  ) => {
    if (!keyOrMessage) {
      const genericMessage = type === "success" 
        ? "Operation completed successfully" 
        : "An error occurred";
      
      switch (type) {
        case "success":
          toast.success(genericMessage);
          break;
        case "error":
          toast.error(genericMessage);
          break;
        case "loading":
          toast.loading(genericMessage);
          break;
        default:
          toast(genericMessage);
      }
      return;
    }

    let message = useTranslation ? toastT[keyOrMessage] || keyOrMessage : keyOrMessage;

    if (params !== undefined && params !== null) {
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