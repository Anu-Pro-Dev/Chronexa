// "use client";

// import React from "react";

// interface TranslatedErrorProps {
//   fieldName: string;
//   errors: Record<string, any>;
//   translations: Record<string, string>;
// }

// const TranslatedError: React.FC<TranslatedErrorProps> = ({
//   fieldName,
//   errors,
//   translations,
// }) => {
//   const key = errors[fieldName]?.message as string | undefined;
//   if (!key) return null;

//   return (
//     <p className="text-destructive text-sm mt-1 px-2 cursor-default">
//       {translations[key] || key}
//     </p>
//   );
// };

// export default TranslatedError;

// src/utils/TranslatedError.tsx
import React from "react";

interface TranslatedErrorProps {
  fieldError?: { message?: string };
  translations?: Record<string, string>;
}

export default function TranslatedError({
  fieldError,
  translations,
}: TranslatedErrorProps) {
  if (!fieldError?.message) return null;
  const key = fieldError.message;
  const translated = translations?.[key] || key;
  return (
    <p className="text-[0.8rem] font-medium text-destructive px-2 cursor-default mt-1">
      {translated}
    </p>
  );
}