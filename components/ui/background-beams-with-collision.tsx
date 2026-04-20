"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type BackgroundBeamsWithCollisionProps = {
  children: React.ReactNode;
  className?: string;
};

export function BackgroundBeamsWithCollision({ children, className }: BackgroundBeamsWithCollisionProps) {
  return (
    <div className={cn("relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,197,196,0.25),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(201,91,91,0.16),transparent_24%),linear-gradient(180deg,#fffdfd_0%,#fff6f5_100%)]", className)}>
      <div className="pointer-events-none absolute inset-0 beam-grid opacity-55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.9),transparent_26%),radial-gradient(circle_at_20%_85%,rgba(201,91,91,0.12),transparent_30%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="beam-line absolute left-[-15%] top-[10%] h-px w-[130%] rotate-[-14deg] bg-gradient-to-r from-transparent via-[rgba(201,91,91,0.22)] to-transparent blur-[1px]" />
        <div className="beam-line-reverse absolute left-[-10%] top-[22%] h-px w-[120%] rotate-[18deg] bg-gradient-to-r from-transparent via-[rgba(255,197,196,0.24)] to-transparent blur-[1px]" />
        <div className="beam-line absolute left-[-20%] top-[62%] h-px w-[150%] rotate-[-9deg] bg-gradient-to-r from-transparent via-[rgba(201,91,91,0.16)] to-transparent blur-[1px]" />
        <div className="beam-line-reverse absolute left-[-12%] top-[78%] h-px w-[130%] rotate-[10deg] bg-gradient-to-r from-transparent via-[rgba(255,197,196,0.18)] to-transparent blur-[1px]" />

        <div className="beam-glow absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-[rgba(201,91,91,0.14)] blur-3xl" />
        <div className="beam-glow absolute right-[10%] top-[30%] h-52 w-52 rounded-full bg-[rgba(255,197,196,0.22)] blur-3xl" />
        <div className="beam-glow absolute left-[38%] top-[62%] h-44 w-44 rounded-full bg-[rgba(201,91,91,0.1)] blur-3xl" />

        <div className="beam-particle absolute left-[16%] top-[30%] h-4 w-4 rounded-full bg-[var(--primary)] shadow-[0_0_24px_rgba(201,91,91,0.45)]" />
        <div className="beam-particle-fast absolute left-[28%] top-[58%] h-3 w-3 rounded-full bg-[var(--secondary)] shadow-[0_0_18px_rgba(255,197,196,0.55)]" />
        <div className="beam-particle absolute right-[22%] top-[20%] h-5 w-5 rounded-full bg-[var(--primary)] shadow-[0_0_22px_rgba(201,91,91,0.42)]" />
        <div className="beam-particle-fast absolute right-[34%] top-[68%] h-3.5 w-3.5 rounded-full bg-[#f59b9b] shadow-[0_0_20px_rgba(201,91,91,0.35)]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
