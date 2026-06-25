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
        "transition-all duration-200 border border-transparent",
        isClickable
          ? "cursor-pointer hover:scale-[1.02] hover:shadow-popup active:scale-[0.98]"
          : "",
        isActive ? "ring-2 ring-offset-1" : "",
      ].join(" ")}
      style={{
        "--tw-ring-color": data.color,
        borderColor: `${data.color}22`,
      } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider leading-tight"
          style={{ color: data.color }}
        >
          {data.label}
        </p>
        {data.icon && (
          <div
            className="w-[34px] h-[34px] shrink-0 flex items-center justify-center rounded-[10px]"
            style={{
              backgroundColor: `${data.color}15`,
              color: data.color,
              border: `1.5px solid ${data.color}30`,
              boxShadow: `0 0 20px 4px ${data.color}18`,
            }}
          >
            {React.cloneElement(data.icon as React.ReactElement, {
              style: { width: '18px', height: '18px', color: data.color },
            })}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-text-primary leading-none mt-1">
        {data.value}
      </p>

      <p className="text-[11px] font-medium text-text-secondary">{data.subLabel}</p>

      <div className="h-2 w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${data.progress}%`,
            background: `linear-gradient(90deg, ${data.color}cc, ${data.color})`,
          }}
        />
      </div>
    </div>
  );
}
