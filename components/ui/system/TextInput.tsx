"use client";

type TextInputProps = {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
};

export function TextInput({
    value,
    onChange,
    placeholder = "Type here...",
    className = "",
}: TextInputProps) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`
        w-full bg-transparent outline-none text-base
        font-medium
        placeholder:font-medium
        placeholder:text-base
        ${className}
      `}
        />
    );
}