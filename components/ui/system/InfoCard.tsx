"use client";

import { ElementType } from "react";

type InfoCardProps = {
    icon?: ElementType;
    description: string;
    className?: string;
};

export function InfoCard({ 
    icon: Icon, 
    description, 
    className = "" 
}: InfoCardProps) {
    return (
        <div 
        className={`p-3 inline-flex  bg-tertiary rounded-2xl shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline-dashed outline-offset-1 outline-[var(--primary)] text-primary justify-start items-start gap-2.5 ${className}`}>
            {Icon  && <Icon size={24} weight="fill" />}
            <p className="text-base font-medium text-primary">
                {description}
            </p>
        </div>
    );
}
