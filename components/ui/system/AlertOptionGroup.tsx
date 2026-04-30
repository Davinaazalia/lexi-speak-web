"use client";

import { useState } from "react";
import { AlertOption } from "./AlertOption";

type Option = {
  value: string;
  title: string;
  description?: string;
  variant?: "success" | "warning" | "error" | "neutral";
  renderInput?: (props: {
    value: string;
    onChange: (v: string) => void;
  }) => React.ReactNode;
};

type AlertOptionGroupProps = {
  options: Option[];
  onChange?: (value: string, extra?: string) => void;
};

export function AlertOptionGroup({
  options,
  onChange,
}: AlertOptionGroupProps) {
  const [selected, setSelected] = useState<string>("");

  const [extraMap, setExtraMap] = useState<Record<string, string>>({});

  const handleSelect = (value: string) => {
    setSelected(value);

    const extra = extraMap[value] || "";
    onChange?.(value, extra);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((opt) => (
        <AlertOption
          key={opt.value}
          value={opt.value}
          title={opt.title}
          description={opt.description || ""}
          variant={opt.variant}
          selected={selected === opt.value}
          hasInput={!!opt.renderInput}
          onSelect={handleSelect}
        >
          {opt.renderInput && selected === opt.value && (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()} // 🔥 keep input stable
              className="mt-2"
            >
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
        </AlertOption>
      ))}
    </div>
  );
}