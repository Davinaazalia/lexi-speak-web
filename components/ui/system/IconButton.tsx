"use client";

import { ElementType } from "react";

type IconButtonProps = {
    icon?: ElementType;
    onClick?: () => void;
    variant?: "base" | "toggled";
    disabled?: boolean;
    className?: string;
};

export default function IconButton({
    icon: Icon,
    onClick,
    variant = "base",
    disabled = false,
    className = "",
}: IconButtonProps) {
    const base =
    "p-3 bg-white/50 backdrop-blur-sm rounded-[99px] shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-start items-center gap-2.5";

    const variants = {
        base: "text-black hover:bg-white/80 active:bg-white/90",
        toggled: "text-primary hover:bg-white/80 active:bg-white/90",
    };

    const iconWeight = {
        base: "regular",
        toggled: "fill",
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
        >
            {Icon && <Icon size={24} weight={iconWeight[variant]} />}
        </button>
    );
}