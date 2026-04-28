"use client";

import { BookOpenIcon, ExamIcon } from "@phosphor-icons/react";
import { ProgressCard } from "./ProgressCard";
import { IconBadge } from "./IconBadge";
import { UnitProgressBar } from "./UnitProgressBar";


type Part = {
  icon: React.ElementType;
  title: string;
  progress: number;
  band?: string;
};

type UnitCardProps = {
  title: string;
  description: string;
  parts: Part[];
  variant?: "practice" | "test";
};

export function UnitCard({
  title,
  description,
  parts,
  variant = "practice",
}: UnitCardProps) {

  const total =
    parts.reduce((acc, p) => acc + p.progress, 0) / parts.length;

  return (
    <div className="p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow outline outline-1 outline-white flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="w-fit">
          <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent font-bold">
            {title}
          </span>
        </div>

        <IconBadge
          label={variant === "practice" ? "Practice" : "Test"}
          icon={variant === "practice" ? BookOpenIcon : ExamIcon}
          variant={variant === "practice" ? "success" : "warning"}
        />
      </div>

      {/* DESCRIPTION */}
      <p className="text-black text-base font-medium">
        {description}
      </p>

      {/* PROGRESS */}
      <div className="flex flex-col gap-2 w-full">
        <span className="text-sm text-[--text-secondary] font-medium">
          Unit Progress
        </span>

        <UnitProgressBar progress={Math.round(total)} />
      </div>

      {/* PARTS */}
      <div className="flex flex-col gap-3 w-full">
        {parts.map((part, i) => (
          <ProgressCard
            key={i}
            icon={part.icon}
            title={part.title}
            progress={part.progress}
            band={part.band}
          />
        ))}
      </div>
    </div>
  );
}