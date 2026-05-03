"use client";

import { TextInput } from "./TextInput";

type InputFieldProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function InputField({
  value,
  onChange,
  placeholder = "Type here...",
  className = "",
}: InputFieldProps) {
  return (
    <div
      className={`
        p-3 flex flex-col bg-tertiary rounded-2xl
        shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)]
        outline outline-dashed outline-offset-1 outline-[var(--primary)]
        text-primary gap-2
        ${className}
      `}
    >
      <TextInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}