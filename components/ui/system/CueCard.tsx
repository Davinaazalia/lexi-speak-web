"use client";

import { ElementType } from "react";
import { MicrophoneIcon, ReceiptIcon } from "@phosphor-icons/react";


type CueItem = {
    text: string;
    icon?: ElementType;
};

type CueCardProps = {
    variant?: "open" | "closed";
    topic?: string;
    status?: string;
    question?: string;
    items?: CueItem[];

    // closed state
    transcription?: string;
    className?: string;
};

export function CueCard({
    variant = "open",
    topic,
    status,
    question,
    items = [],
    transcription,
    className = "",
}: CueCardProps) {
    const base =
        "max-w-[800px] p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-1 outline-offset-[-1px] flex flex-col gap-6";

    const isOpen = variant === "open";

    return (
        <div
            className={`${base} ${isOpen
                ? "outline-white items-start"
                : "outline-[var(--primary)] items-center"
                } ${className}`}
        >
            {/* Header */}
            <div className="w-full flex justify-between items-start">
                <span
                    className={`bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent text-base font-bold ${isOpen ? "" : "opacity-0"
                        }`}
                >
                    {topic}
                </span>

                <span
                    className={`text-base font-bold ${isOpen
                        ? "text-[var(--color-success-text)]"
                        : "text-[var(--color-error-text)]"
                        }`}
                >
                    {status}
                </span>
            </div>

            {/* ===== OPEN ===== */}
            {isOpen && (
                <>
                    <h2 className="text-black text-4xl font-medium leading-tight">
                        {question}
                    </h2>

                    <span className="text-primary text-base font-bold">
                        YOU SHOULD SAY:
                    </span>

                    <div className="flex flex-col gap-3">
                        {items.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={index}
                                    className="w-fit max-w-[690px] p-4 bg-[var(--color-tertiary)] rounded-2xl outline outline-1 outline-[var(--color-primary)] flex items-center gap-2"
                                >
                                    {Icon && <Icon size={24} weight="regular" color="var(--primary)" />}

                                    <span className="text-[var(--color-primary)] text-base font-medium">
                                        {item.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ===== CLOSED ===== */}
            {!isOpen && (
                <>
                    <div className="w-60 h-60 p-12 bg-white/50 rounded-[999px] outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-center items-center gap-2.5">
                        <MicrophoneIcon size={24} weight="fill" className="text-primary" />
                    </div>

                    {/* Transcription */}
                    <div className="w-full p-6 bg-white rounded-2xl outline-1 outline-[text-secondary] flex gap-2">
                        <ReceiptIcon size={24} weight="regular" className="text-secondary" />

                        <div className="flex-1 flex flex-col gap-2">
                            <span className="text-secondary text-base font-bold">
                                Audio Transcription
                            </span>

                            <span className="text-black text-base font-medium">
                                {transcription}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}