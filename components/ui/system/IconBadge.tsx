"use client";

import { ElementType } from "react";

type BadgeProps = {
  label: string;
  icon?: ElementType;
  variant?: "success" | "warning" | "error" | "text";
  className?: string;
};

export function IconBadge({
  label,
  icon: Icon,
  variant = "text",
  className = "",
}: BadgeProps) {
  const variants = {
    success:
      "success outline-[var(--color-success-text)]",
    warning:
      "warning outline-[var(--color-warning-text)]",
    error:
      "error outline-[var(--color-error-text)]",
    text:
      "text-[var(--color-text)] bg-[var(--text-tertiary)] outline-[var(--color-text-secondary)]",
  };

  return (
    <div
      className={`
        px-3 py-1 rounded-full outline outline-1 inline-flex items-center gap-2
        text-sm font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {Icon && <Icon size={16} weight="regular" />}
      <span>{label}</span>
    </div>
  );
}