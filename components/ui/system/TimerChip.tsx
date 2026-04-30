"use client";

import { ElementType } from "react";

type TimerChipProps = {
  icon?: ElementType;
  time: string;
  className?: string;
};

export function TimerChip({
  icon: Icon,
  time,
  className = "",
}: TimerChipProps) {
  const base =
    "px-4 py-3 rounded-[99px] background-blur-md shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-1 outline-offset-[-1px] outline-white/50 inline-flex items-center gap-2.5";

  return (
    <div className={`${base} ${className}`}>
      {Icon && <Icon size={24} weight="regular" />}

      <span className="text-lg font-medium leading-none">
        {time}
      </span>
    </div>
  );
}