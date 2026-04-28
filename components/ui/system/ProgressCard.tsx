"use client";

import { ElementType } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type ProgressCardProps = {
    title: string;
    progress: number;
    band?: string;
    icon?: ElementType;
    className?: string;
};

export function ProgressCard({
    title,
    progress,
    band,
    icon: Icon,
    className = "",
}: ProgressCardProps) {
    const isFinished = progress >= 100;

    return (
        <div
            className={`
        w-full p-4 rounded-2xl outline inline-flex justify-between items-center
        ${isFinished
                    ? "success outline-white/50"
                    : "bg-white outline-[--text-tertiary]"
                }
        ${className}
      `}
        >
            {/* LEFT */}
            <div className="flex items-center gap-2">
                {/* Icon */}
                <div className="w-6 h-6 flex items-center justify-center">
                    {Icon && (
                        <Icon
                            size={24}
                            weight={isFinished ? "fill" : "regular"}
                            className={
                                isFinished
                                    ? "text-[var(--color-success-text)]"
                                    : "text-[var(--color-text-secondary)]"
                            }
                        />
                    )}
                </div>

                {/* Text */}
                <div className="flex flex-col">
                    <span
                        className={`
              text-base font-semibold
              ${isFinished
                                ? "text-[var(--color-success-text)]"
                                : "text-[var(--color-text-secondary)]"
                            }
            `}
                    >
                        {title}
                    </span>

                    {isFinished && band && (
                        <span className="text-base font-extrabold text-[var(--color-success-text)]">
                            Band {band}
                        </span>
                    )}
                </div>
            </div>

            {/* RIGHT (Progress Circle) */}
            <div className="w-12 h-12 text-base font-bold">
                <CircularProgressbar
                    value={progress}
                    text={`${progress}%`}
                    styles={buildStyles({
                        pathColor: isFinished
                            ? "var(--color-success-text)"
                            : "var(--color-primary)",
                        trailColor: isFinished
                            ? "rgba(0,0,0,0.1)"
                            : "var(--text-tertiary)",
                        textColor: isFinished
                            ? "var(--color-success-text)"
                            : "var(--text-secondary)",
                    })}
                />
            </div>
        </div>
    );
}