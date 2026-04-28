"use client";

import { AlertCard } from "@/components/ui/system/AlertCard";
import { InfoIcon} from "@phosphor-icons/react";
import { ElementType } from "react";

type Metric = {
    label: string;
    score: string;
    description: string;
    icon?: ElementType;
};

type AnalysisCardProps = {
    title: string;
    overallScore: string;
    level: string;
    metrics: Metric[];
    recommendation?: string;
    className?: string;
};

export function AnalysisCard({
    title,
    overallScore,
    level,
    metrics,
    recommendation,
    className = "",
}: AnalysisCardProps) {
    return (
        <div
            className={`w-full max-w-[800px] p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-1 outline-white flex flex-col gap-6 ${className}`}
        >
            {/* Header */}
            <div className="w-full inline-flex justify-between items-center">
                <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent text-base font-bold">
                    {title}
                </span>
                <InfoIcon size={24} weight="regular" className="text-primary" />
            </div>

            {/* Score */}
            <h1 className="w-fit bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent text-5xl font-bold">
                {overallScore} - {level}
            </h1>

            {/* Metrics */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {metrics.map((item, index) => (
                        <AlertCard
                            key={index}
                            icon={item.icon}
                            title={`${item.label} ${item.score}`}
                            description={item.description}
                            variant="success"
                            className="w-full"
                        />
                    ))}
                </div>
            </div>

            {/* Recommendation */}
            {recommendation && (
                <div className="w-fit">
                    <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent text-base font-bold">
                        Recommendation
                    </span>

                    <p className="text-black text-base font-medium">
                        {recommendation}
                    </p>
                </div>
            )}
        </div>
    );
}