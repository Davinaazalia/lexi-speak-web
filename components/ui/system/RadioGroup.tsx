"use client";

import { useState } from "react";
import { RadioOption } from "./RadioOption";

type Option = {
  value: string;
  label: string;
  renderInput?: (props: {
    value: string;
    onChange: (v: string) => void;
  }) => React.ReactNode;
};

type RadioGroupProps = {
  options: Option[];
  onChange?: (value: string, extra?: string) => void;
};

export function RadioGroup({ options, onChange }: RadioGroupProps) {
  const [selected, setSelected] = useState<string>("");

  // 🔥 each option has its own input value now
  const [extraMap, setExtraMap] = useState<Record<string, string>>({});

  const handleSelect = (value: string) => {
    setSelected(value);

    const extra = extraMap[value] || "";
    onChange?.(value, extra);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((opt) => (
        <RadioOption
          key={opt.value}
          value={opt.value}
          label={opt.label}
          selected={selected === opt.value}
          hasExtraInput={!!opt.renderInput}
          onSelect={handleSelect}
        >
          {opt.renderInput && selected === opt.value && (
            <div className="ml-2 flex-1 placeholder:text-white/80">
              {opt.renderInput({
                value: extraMap[opt.value] || "",
                onChange: (v) => {
                  setExtraMap((prev) => ({
                    ...prev,
                    [opt.value]: v,
                  }));

                  onChange?.(opt.value, v);
                },
              })}
            </div>
          )}
        </RadioOption>
      ))}
    </div>
  );
}