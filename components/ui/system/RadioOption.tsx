"use client";

type RadioOptionProps = {
  value: string;
  label: string;
  selected?: boolean;
  hasExtraInput?: boolean;
  children?: React.ReactNode;
  onSelect?: (value: string) => void;
};

export function RadioOption({
  value,
  label,
  selected = false,
  hasExtraInput = false,
  children,
  onSelect,
}: RadioOptionProps) {
  return (
    <div
      onClick={() => onSelect?.(value)}
      className={`
        w-full max-w-[690px] p-4 rounded-2xl outline flex items-center gap-2 cursor-pointer transition
        ${
          selected
            ? "bg-primary outline-white"
            : hasExtraInput
            ? "bg-tertiary outline-dashed outline-[var(--primary)]"
            : "bg-tertiary outline-[var(--primary)]"
        }
      `}
    >
      <span
        className={`
          text-base font-medium
          ${
            selected
              ? "text-[var(--tertiary)]"
              : "text-[var(--primary)]"
          }
        `}
      >
        {label}
      </span>

      {children && (
        <div className="text-white">
          {children}
        </div>
      )}
    </div>
  );
}