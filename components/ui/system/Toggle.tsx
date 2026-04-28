"use client";

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
};

export function Toggle({ checked, onChange, className = "" }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-12 h-7 p-1 rounded-full
        inline-flex items-center
        transition-all duration-200
        ${checked ? "bg-[var(--primary)] justify-end" : "bg-gray-300 justify-start"}
        ${className}
      `}
    >
      <div
        className="
          w-5 h-5 bg-gray-100 rounded-full
          shadow-[0px_0px_8px_rgba(0,0,0,0.30)]
          transition-all duration-200
        "
      />
    </button>
  );
}