"use client";
import * as React from "react";

// ── KPI Card data shape ─────────────────────────────────────────────────────

export interface KpiCardData {
  label: string;
  value: number | string;
  subLabel: string;
  progress: number;
  color: string;
  icon: React.ReactNode;
}

// ── KPI Card component ──────────────────────────────────────────────────────

export function KpiCard({
  data,
  isActive,
  onClick,
}: {
  data: KpiCardData;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const isClickable = !!onClick;

  return (
    <div
      // role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={[
        "bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-2 select-none",
        "transition-all duration-150",
        isClickable
          ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:brightness-95 hover:shadow-popup active:scale-[0.98]"
          : "",
        isActive ? "ring-2 ring-offset-1" : "",
      ].join(" ")}
      style={{ "--tw-ring-color": data.color } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary leading-tight">
          {data.label}
        </p>
        {data.icon && (
          <div
            className="bg-background w-[32px] h-[32px] shrink-0 flex items-center justify-center rounded-[8px]"
            style={{
              color: data.color,
              boxShadow: `0 0 16px 6px ${data.color}22`,
            }}
          >
            {data.icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-medium text-text-primary leading-none">
        {data.value}
      </p>

      <p className="text-xs text-text-secondary">{data.subLabel}</p>

      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${data.progress}%`, backgroundColor: data.color }}
        />
      </div>
    </div>
  );
}
