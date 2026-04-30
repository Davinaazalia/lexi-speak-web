"use client";

type TopicCardProps = {
    value: string;
    title: string;
    description: string;
    className?: string;
    selected?: boolean;
    onSelect?: (value: string) => void;
};

export function TopicCard({
    value,
    title,
    description,
    className = "",
    selected = false,
    onSelect,
}: TopicCardProps) {
    return (
        <div 
            className={`p-4 bg-white/50 rounded-2xl shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-offset-1 flex flex-col text-primary justify-start items-start gap-2.5 ${className}
            ${selected ? " outline-[var(--primary)]" : "outline-white/50"}`}
            onClick={() => onSelect?.(value)}
        >
            <h3 className="w-fit bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent text-base font-bold">
                {title}
            </h3>
            <p className="text-base font-medium text-black">
                {description}
            </p>
        </div>
    );
}