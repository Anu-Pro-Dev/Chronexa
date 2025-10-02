// "use client";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/src/components/ui/breadcrumb";

// import Link from "next/link";
// import { usePathname, useSearchParams } from "next/navigation";
// import { useLanguage } from "@/src/providers/LanguageProvider";
// import React from "react";

// export default function AutoPathMapper() {
//   const { translations } = useLanguage();
//   const pathname = usePathname();
//   const pathSegments = pathname.split("/").filter(Boolean);
//   const searchParams = useSearchParams();
//   const name = searchParams.get("name") || "";

//   const toTitleCase = (text: string) =>
//     text
//       .split("-")
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");

//   const toSnakeCase = (text: string) => text.replace(/-/g, "_");

//   const formatSegment = (segment: string) => {
//     const lower = segment.toLowerCase();
//     const snake = toSnakeCase(lower);

//     if (translations?.modules?.items?.[snake]) {
//       return translations.modules.items[snake];
//     }

//     if (translations?.sub_modules?.[snake]) {
//       return translations.sub_modules[snake];
//     }

//     if (translations?.navbar?.primary?.[snake]) {
//       return translations.navbar.primary[snake];
//     }

//     if (translations?.navbar?.secondary?.[snake]) {
//       return translations.navbar.secondary[snake];
//     }

//     for (const moduleKey in translations?.modules || {}) {
//       if (moduleKey !== 'items' && translations.modules[moduleKey]?.[snake]) {
//         return translations.modules[moduleKey][snake];
//       }
//     }

//     return toTitleCase(segment);
//   };

//   return (
//     <div className="select-none pt-3">
//       <Breadcrumb>
//         <BreadcrumbList>
//           {pathSegments.map((segment, index) => {
//             const href = "/" + pathSegments.slice(0, index + 1).join("/");
//             const isLast = index === pathSegments.length - 1;

//             return (
//               <React.Fragment key={href}>
//                 <BreadcrumbItem>
//                   {isLast ? (
//                     <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
//                   ) : (
//                     <BreadcrumbLink asChild>
//                       <Link href={href} aria-label={`Navigate to ${formatSegment(segment)}`}>
//                         {formatSegment(segment)}
//                       </Link>
//                     </BreadcrumbLink>
//                   )}
//                 </BreadcrumbItem>

//                 {!isLast && <BreadcrumbSeparator />}
//               </React.Fragment>
//             );
//           })}

//           {name && <BreadcrumbSeparator />}
//           {name && (
//             <BreadcrumbItem>
//               <BreadcrumbPage>{formatSegment(name)}</BreadcrumbPage>
//             </BreadcrumbItem>
//           )}
//         </BreadcrumbList>
//       </Breadcrumb>
//     </div>
//   );
// }
"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/src/providers/LanguageProvider";
import React from "react";

export default function AutoPathMapper() {
  const { translations } = useLanguage();
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const group = searchParams.get("group") || "";

  const toTitleCase = (text: string) =>
    text
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const toSnakeCase = (text: string) => text.replace(/-/g, "_");

  const formatSegment = (segment: string) => {
    const lower = segment.toLowerCase();
    const snake = toSnakeCase(lower);

    // Check in modules.items
    if (translations?.modules?.items?.[snake]) {
      return translations.modules.items[snake];
    }

    // Check in sub_modules
    if (translations?.sub_modules?.[snake]) {
      return translations.sub_modules[snake];
    }

    // Check in navbar.primary
    if (translations?.navbar?.primary?.[snake]) {
      return translations.navbar.primary[snake];
    }

    // Check in navbar.secondary
    if (translations?.navbar?.secondary?.[snake]) {
      return translations.navbar.secondary[snake];
    }

    // Check in each module's translations
    for (const moduleKey in translations?.modules || {}) {
      if (moduleKey !== 'items' && translations.modules[moduleKey]?.[snake]) {
        return translations.modules[moduleKey][snake];
      }
    }

    // Check specifically for employeeMaster module translations
    if (translations?.modules?.employeeMaster?.[snake]) {
      return translations.modules.employeeMaster[snake];
    }

    // Fallback to title case
    return toTitleCase(segment);
  };

  return (
    <div className="select-none pt-3">
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            const isLast = index === pathSegments.length - 1;

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href} aria-label={`Navigate to ${formatSegment(segment)}`}>
                        {formatSegment(segment)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}

          {/* Show group parameter if exists */}
          {group && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{group}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}

          {/* Show name parameter if exists */}
          {name && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{formatSegment(name)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}