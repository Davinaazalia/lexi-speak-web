"use client";

import { MicrophoneIcon, ReceiptIcon } from "@phosphor-icons/react";
import AudioPlayButton from "@/components/ui/system/AudioPlayButton";
import { Waveform } from "@/components/ui/waveform";

import { ElementType, useMemo, useState } from "react";

type UserChatBubbleProps = {
    variant: "subtitle" | "speaking" | "done";
    message?: string;
    src?: string;
    transcription?: string;
    duration?: string;
    icon?: ElementType;
    className?: string;
};

export function UserChatBubble({
    variant,
    message,
    src,
    transcription,
    icon: Icon,
    className = "",
}: UserChatBubbleProps) {
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
        "w-fit max-w-[690px] p-6 bg-primary rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-1 outline-white/50 flex flex-col gap-2.5";

    return (
        <div className={`${base} ${className}`}>
            {/* ===== SUBTITLE / DONE WITH TEXT ===== */}
            {variant === "subtitle" && message && (
                <p className="text-white text-base font-medium">
                    {message}
                </p>
            )}

            {/* ===== SPEAKING ===== */}
            {variant === "speaking" && (
                <>
                    <div className="flex items-center gap-2">
                        <div className="p-3 bg-white/50 rounded-[99px] outline outline-1 outline-white shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)]">
                            {Icon && (
                                <MicrophoneIcon
                                    size={24}
                                    weight="fill"
                                    className="text-primary animate-pulse"
                                />
                            )}
                        </div>

                        <span className="text-white text-base font-bold">
                            Listening...
                        </span>
                    </div>

                    {/* transcription preview */}
                    <div className="w-full p-6 bg-white rounded-2xl outline-1 outline-[text-primary] flex gap-2">
                        <ReceiptIcon size={24} weight="regular" className="text-primary" />

                        <div className="flex-1 flex flex-col gap-2">
                            <span className="text-primary text-base font-bold">
                                Audio Transcription
                            </span>

                            <span className="text-black text-base font-medium">
                                {transcription}
                            </span>
                        </div>
                    </div>
                </>
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

                    <span className="inline-flex w-14 justify-center text-white text-sm font-medium">
                        {format(current)}
                    </span>

                    <div className="flex-1 w-60">

                        <Waveform
                            data={data}
                            height={64}
                            barWidth={4}
                            barGap={2}
                            barColor="rgba(255,255,255,0.3)"
                            progress={progress}
                            progressColor="#FFFFFF"
                        />
                    </div>



                    <span className="inline-flex w-14 justify-center text-white text-sm font-medium">
                        {format(duration)}
                    </span>
                </div>
            )}
        </div>
    );
}