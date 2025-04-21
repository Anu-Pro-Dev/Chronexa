"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePathname, useRouter } from "next/navigation";

export default function PowerShifterTab({ items }: { items: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const { translations } = useLanguage();
  const isSingleItem = items?.length === 1;
  return (
    <div>
      {isSingleItem ? (
        <div
          className="min-w-20 w-fit gap-2 ps-0 border-none shadow-none text-2xl font-bold text-text-primary cursor-default"
          onClick={() => router.push(items[0]?.path)}
        >
          {items[0]?.label}
        </div>
      ) : (
        // <Select
        //   onValueChange={(value) => {
        //     router.push(value);
        //   }}
        //   value={pathname}
        // >
        //   <SelectTrigger className="min-w-20 w-fit gap-2 ps-0 border-none shadow-none text-2xl font-bold text-text-primary" iconSize={32}>
        //     <SelectValue placeholder="Theme" />
        //   </SelectTrigger>
        //   <SelectContent className="bg-white rounded-xl">
        //     {items?.map((item: any, index: number) => (
        //       <SelectItem
        //         className={item?.hide === true ? "hidden" : ""}
        //         onClick={() => {
        //           router.push(item?.path)
        //         }}
        //         key={index}
        //         value={item?.path}
        //       >
        //         {item?.label}
        //       </SelectItem>
        //     ))}
        //   </SelectContent>
        // </Select>
        <div className="flex space-x-2">
          {items?.map((item: any, index: number) => {
            if (item?.hide) return null;

            const isActive = pathname === item?.path;

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

      )}
    </div>
  );
}
