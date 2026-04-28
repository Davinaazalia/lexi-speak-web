"use client";

import { useState, useMemo, type CSSProperties } from "react";
import AudioPlayButton from "@/components/ui/system/AudioPlayButton";
import { Waveform } from "@/components/ui/waveform";
import { ElementType } from "react";

type AIChatBubbleProps = {
    variant: "subtitle" | "speaking" | "done";
    title?: string;
    message?: string;
    src?: string;
    icon?: ElementType;
    className?: string;
};

export function AIChatBubble({
    variant,
    title,
    message,
    src,
    icon: Icon,
    className = "",
}: AIChatBubbleProps) {
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);

    const format = (s: number) => {
        if (!s || isNaN(s)) return "00:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const data = useMemo(() => Array.from({ length: 50 }, () => Math.random()), []);
    const progress = duration > 0 ? current / duration : 0;

    const base =
        "w-fit max-w-[690px] p-6 bg-white/50 backdrop-blur-sm rounded-tl-2xl rounded-tr-2xl rounded-bl rounded-br-2xl shadow outline outline-1 outline-white flex flex-col items-start gap-2.5";

    return (
        <div className={`${base} ${className}`}>
            {/* ===== SUBTITLE ===== */}
            {variant === "subtitle" && (
                <p className="text-black text-base">
                    {title && <span className="font-bold">{title} </span>}
                    <span className="font-medium">{message}</span>
                </p>
            )}

            {/* ===== SPEAKING ===== */}
            {variant === "speaking" && (
                <div className="flex items-center gap-2">
                    <div className="p-3 bg-white/50 rounded-[99px] outline outline-1 outline-white shadow">
                        {Icon && (
                            <Icon
                                size={24}
                                weight="fill"
                                className="text-primary animate-pulse"
                            />
                        )}
                    </div>

                    <span className="text-black text-base font-bold">
                        Speaking...
                    </span>
                </div>
            )}

            {/* ===== DONE ===== */}
            {variant === "done" && src && (
                <div className="flex items-center gap-2.5">

                    <AudioPlayButton
                        src={src}
                        onTimeUpdate={(c, d) => {
                            setCurrent(c);
                            setDuration(d);
                        }}
                        className="shrink-0"
                    />

                    <span className="inline-flex w-14 justify-center text-black text-sm font-medium">
                        {format(current)}
                    </span>

                    <div className="flex-1 w-60">

                        <Waveform
                            data={data}
                            height={64}
                            barWidth={4}
                            barGap={2}
                            barColor="rgba(0,0,0,0.3)"
                            progress={progress}
                            progressColor="#C95B5B"
                        />
                    </div>



                    <span className="inline-flex w-14 justify-center text-black text-sm font-medium">
                        {format(duration)}
                    </span>
                </div>
            )}
        </div>
    );
}