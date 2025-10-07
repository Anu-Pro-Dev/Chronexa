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