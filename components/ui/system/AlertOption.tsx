"use client";

type AlertOptionProps = {
    value: string;
    title: string;
    description: string;
    selected?: boolean;
    variant?: "success" | "warning" | "error" | "neutral";
    hasInput?: boolean;
    onSelect?: (value: string) => void;
    children?: React.ReactNode;
};

const variants = {
    success: {
        optionSelected: "bg-[var(--color-success-text)] text-[var(--color-success-bg)] outline-[var(--color-success-text)]",
        notSelected: "bg-[var(--color-success-bg)] text-[var(--color-success-text)] outline-[var(--color-success-text)]",
    },
    warning: {
        optionSelected: "bg-[var(--color-warning-text)] text-[var(--color-warning-bg)] outline-[var(--color-warning-text)]",
        notSelected: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] outline-[var(--color-warning-text)]",
    },
    error: {
        optionSelected: "bg-[var(--color-error-text)] text-[var(--color-error-bg)] outline-[var(--color-error-text)]",
        notSelected: "bg-[var(--color-error-bg)] text-[var(--color-error-text)] outline-[var(--color-error-text)]",   
    },
    neutral: {
        optionSelected: "bg-black text-white outline-[var(--text-black)]",
        notSelected: "bg-[var(--text-white)] text-[var(--text-black)] outline-[var(--text-black)]",
    },
};

export function AlertOption({
    value,
    title,
    description,
    selected = false,
    variant = "neutral",
    hasInput = false,
    onSelect,
    children,
}: AlertOptionProps) {
    const v = variants[variant];

    const isSelected = selected;

    const bgClass = isSelected ? v.optionSelected : v.notSelected;
    const textClass = isSelected ? v.optionSelected : v.notSelected;
    const outlineClass = isSelected ? v.optionSelected : v.notSelected;

    return (
        <div
            onClick={() => onSelect?.(value)}
            className={`
    w-full max-w-[690px] p-4 rounded-2xl
    outline outline-1
    flex flex-col gap-1 cursor-pointer

    ${bgClass}
    ${outlineClass}
  `}
        >
            <span className={`text-base font-semibold ${textClass}`}>
                {title}
            </span>

            {description && (
                <span className={`text-sm font-medium ${textClass}`}>
                    {description}
                </span>
            )}

            {children && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 text-white"
                >
                    {children}
                </div>
            )}
        </div>
    );
}