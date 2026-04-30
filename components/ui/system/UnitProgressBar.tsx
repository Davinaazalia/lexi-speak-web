"use client";

type UnitProgressBarProps = {
  progress: number;
};

export function UnitProgressBar({ progress }: UnitProgressBarProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-white rounded-full outline outline-white/50 shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="w-12 text-right text-sm text-[--text-secondary]">
        {progress}%
      </span>
    </div>
  );
}