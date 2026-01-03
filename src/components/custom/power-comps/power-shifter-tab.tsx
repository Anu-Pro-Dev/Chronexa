"use client";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePathname, useRouter } from "next/navigation";

export default function PowerShifterTab({ items }: { items: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const { translations } = useLanguage();
  
  const normalizePath = (path: string) => path.replace(/\/+$/, "");

  const getTranslatedLabel = (value: string, label: string) => {
    if (!value && !label) return "";
    
    const normalizedKey = (value || label).toLowerCase().replace(/\s+/g, "_");
    
    if (translations?.sub_modules?.[normalizedKey]) {
      return translations.sub_modules[normalizedKey];
    }
    
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentModule = pathSegments[0]; 
    
    if (translations?.modules?.[currentModule]?.[normalizedKey]) {
      return translations.modules[currentModule][normalizedKey];
    }
    
    const camelCaseModule = currentModule.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    if (translations?.modules?.[camelCaseModule]?.[normalizedKey]) {
      return translations.modules[camelCaseModule][normalizedKey];
    }
    
    return label;
  };

  const isSingleItem = items?.length === 1;
  
  return (
    <div className="flex gap-2">
      {items?.map((item: any, index: number) => {
        if (item?.hide) return null;
        
        const isActive =
          normalizePath(pathname) === normalizePath(item?.path) ||
          normalizePath(pathname).startsWith(normalizePath(item?.path) + "/");

        const displayLabel = getTranslatedLabel(item?.value, item?.label);

        return (
          <button
            key={index}
            onClick={() => router.push(item?.path)}
            className={`px-4 py-2 rounded-md text-sm
              ${isActive ? 'bg-backdrop text-primary font-bold' : 'bg-accent text-text-secondary font-medium'}
            `}
          >
            {displayLabel}
          </button>
        );
      })}
    </div>
  );
}