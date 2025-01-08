"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/providers/LanguageProvider";
import { SelectIcon } from "@radix-ui/react-select";
import { DropDownIcon } from "@/icons/icons"
import { usePathname, useRouter } from "next/navigation";

export default function PowerShifter({ items }: { items: any }) {
  const router = useRouter();
  const pathname = usePathname();
  // const { dir } = useLanguage();
  return (
    <div>
      <Select
        // dir={dir}
        onValueChange={(value) => {
          router.push(value);
        }}
        value={pathname}
      >
        <SelectTrigger className="min-w-20 w-fit gap-2 ps-0 border-none shadow-none text-2xl font-bold text-text-primary">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent className="bg-white rounded-xl">
          {items?.map((item: any, index: number) => (
            <SelectItem
              className={item?.hide === true ? "hidden" : ""}
              onClick={() => {
                router.push(item?.path);
              }}
              key={index}
              value={item?.path}
            >
              {item?.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
