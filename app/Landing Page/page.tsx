import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, MicVocal, Sparkles, Target } from "lucide-react";

import { BackgroundBeamsWithCollision } from "../../components/ui/background-beams-with-collision";

const highlights = [
  {
    title: "Learn mode",
    description: "Flexible topic practice with unit cards, parts, and progress.",
    icon: BookOpen,
  },
  {
    title: "Test mode",
    description: "Ordered speaking rounds linked to coach review at test start.",
    icon: Target,
  },
  {
    title: "Voice practice",
    description: "Record, replay, and get rubric-based feedback instantly.",
    icon: MicVocal,
  },
];

const stats = [
  { value: "2", label: "Practice units" },
  { value: "3", label: "Parts per unit" },
  { value: "20m", label: "Test session" },
];

export default function LandingPage() {
  return (
    <BackgroundBeamsWithCollision className="text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/70 bg-white/70 px-5 py-4 shadow-[0_12px_40px_rgba(14,23,36,0.06)] backdrop-blur-xl">
          <Link href="/" className="text-2xl font-black tracking-tight text-[color:var(--primary)]">
            LexiSpeak
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <Link href="/Landing Page" className="text-neutral-900 transition hover:text-[color:var(--primary)]">
              Home
            </Link>
            <Link href="/dashboard/user?tab=learn" className="transition hover:text-[color:var(--primary)]">
              Learn
            </Link>
            <Link href="/dashboard/user?tab=test" className="transition hover:text-[color:var(--primary)]">
              Test
            </Link>
            <Link href="/dashboard/user" className="transition hover:text-[color:var(--primary)]">
              Dashboard
            </Link>
          </nav>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(201,91,91,0.25)] transition hover:-translate-y-[1px] hover:brightness-105"
          >
            Contact Us
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[color:var(--primary)]" />
              Built for IELTS speaking practice
            </div>

            <h1 className="text-5xl font-black tracking-tight text-[#0b3f34] md:text-6xl lg:text-7xl">
              Build Speaking Skills That Shape Your Future
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600 md:text-xl">
              Practice IELTS speaking with guided onboarding, topic-based Part 1 cards, time-boxed sessions, and rubric-aligned feedback.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard/user?tab=learn"
                className="brand-pill-button inline-flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white"
              >
                Explore Course
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/user?tab=test"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--primary)] bg-white/80 px-6 py-4 text-sm font-semibold text-[color:var(--primary)] shadow-sm backdrop-blur transition hover:-translate-y-[1px] hover:bg-white"
              >
                Start Test
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <div className="text-3xl font-black text-[#0b3f34]">{item.value}</div>
                  <div className="mt-1 text-sm text-neutral-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[720px]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-[0_24px_70px_rgba(14,23,36,0.12)] backdrop-blur-xl md:row-span-2">
                <div className="mb-4 h-[360px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#203f36_0%,#10221d_55%,#081611_100%)] p-5 text-white">
                  <div className="flex h-full flex-col justify-between">
                    <div className="text-xs uppercase tracking-[0.28em] text-white/60">Live Practice</div>
                    <div>
                      <div className="text-3xl font-black leading-tight">Speak naturally, one question at a time.</div>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                        The AI coach listens, responds, and tracks your progress across units.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[24px] bg-[color:var(--primary)] p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-white/90" />
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-white/70" />
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-white/50" />
                    </div>
                    <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Best</div>
                  </div>
                  <p className="mt-6 text-lg leading-8 font-medium">
                    "Hands-on speaking practice helped me answer faster and more naturally."
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[28px] overflow-hidden border border-white/80 bg-white/80 shadow-[0_24px_70px_rgba(14,23,36,0.12)] backdrop-blur-xl">
                  <div className="h-[220px] bg-[linear-gradient(135deg,rgba(12,33,27,0.96),rgba(201,91,91,0.65))] p-5 text-white">
                    <div className="flex h-full flex-col justify-end">
                      <div className="text-2xl font-bold">Interactive Classrooms</div>
                      <div className="mt-2 text-sm text-white/75">Practice with a guided flow built for speaking tests.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_70px_rgba(14,23,36,0.12)] backdrop-blur-xl">
                  <div className="text-6xl font-black tracking-tight text-[#0b3f34]">62+</div>
                  <div className="mt-2 text-sm text-neutral-500">Practice prompts and guided cards</div>
                </div>

                <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_70px_rgba(14,23,36,0.12)] backdrop-blur-xl">
                  <div className="grid gap-4">
                    {highlights.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-neutral-50 p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--primary)] text-white shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{item.title}</div>
                            <div className="mt-1 text-sm leading-6 text-neutral-500">{item.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </BackgroundBeamsWithCollision>
  );
}
