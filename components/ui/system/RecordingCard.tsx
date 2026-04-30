"use client";

import { RecordIcon, ReceiptIcon } from "@phosphor-icons/react";

type RecordingCardProps = {
    coachName: string;
    studentName: string;
    coachTranscription?: string;
    studentTranscription?: string;
    className?: string;
};

export function RecordingCard({
    coachName,
    studentName,
    coachTranscription,
    studentTranscription,
    className = "",
}: RecordingCardProps) {
    return (
        <div
            className={`w-full max-w-[800px] p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-1 outline-[var(--color-error-text)] flex flex-col gap-6 ${className}`}
        >
            <div className=" inline-flex justify-start items-center  text-[var(--color-error-text)] gap-2.5 animate-pulse">
                <div className="p-3 bg-white/50 rounded-[99px] shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-1 outline-offset-[-1px] outline-white">
                    <RecordIcon size={24} weight="fill" />
                </div>
                <span className="text-base font-bold">Recording...</span>
            </div>

            <div className="w-full p-6 bg-white rounded-2xl outline-1 outline-[text-secondary] flex gap-2">
                <ReceiptIcon size={24} weight="regular" className="text-secondary" />

                <div className="flex-1 flex flex-col gap-2">
                    <span className="text-secondary text-base font-bold">
                        Audio Transcription
                    </span>

                    <div
                        className={`p-3 flex flex-col bg-tertiary rounded-2xl shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline-dashed outline-offset-1 outline-[var(--primary)] text-primary justify-start items-start gap-x-1 ${className}`}>
                        <span className="text-base font-bold">
                            {coachName}:
                        </span>
                        <p className="text-base font-medium text-primary">
                            {coachTranscription}
                        </p>
                    </div>

                    <div
                        className={`p-3 flex flex-col bg-tertiary rounded-2xl shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline-dashed outline-offset-1 outline-[var(--primary)] text-primary justify-start items-start gap-x-1 ${className}`}>
                        <span className="text-base font-bold">
                            {studentName}:
                        </span>
                        <p className="text-base font-medium text-primary">
                            {studentTranscription}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}