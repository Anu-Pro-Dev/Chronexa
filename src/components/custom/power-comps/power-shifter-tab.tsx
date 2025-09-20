"use client";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePathname, useRouter } from "next/navigation";

export default function PowerShifterTab({ items }: { items: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const normalizePath = (path: string) => path.replace(/\/+$/, "");

  const { translations } = useLanguage();
  const isSingleItem = items?.length === 1;
  
  return (
    <div className="flex gap-2">
      {items?.map((item: any, index: number) => {
        if (item?.hide) return null;
        
        const isActive =
          normalizePath(pathname) === normalizePath(item?.path) ||
          normalizePath(pathname).startsWith(normalizePath(item?.path) + "/");

        return (
          <button
            key={index}
            onClick={() => router.push(item?.path)}
            className={`px-4 py-2 rounded-md text-sm
              ${isActive ? 'bg-backdrop text-primary font-bold' : 'bg-accent text-text-secondary font-medium'}
            `}
          >
            {item?.label}
          </button>
        );
      })}
    </div>
  );
}
