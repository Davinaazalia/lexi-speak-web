import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, MicVocal, Plus, Sparkles, Target } from "lucide-react";

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

const trustedLogos = [
  "SpeakBridge",
  "CampusOne",
  "GlobalMentor",
  "LinguaLab",
  "EduNation",
  "FutureGuild",
];

const lexispeakImpactStats = [
  { value: "95%", label: "Learner Satisfaction" },
  { value: "120+", label: "Speaking Prompts" },
  { value: "30K+", label: "Practice Responses" },
  { value: "50+", label: "Countries Reached" },
];

const speakingTracks = [
  {
    title: "Part 1 Foundation",
    description: "Build smoother introductions and personal-topic answers with confident pacing.",
    icon: BookOpen,
  },
  {
    title: "Part 2 Story Builder",
    description: "Structure your 2-minute response with stronger detail, transitions, and clarity.",
    icon: MicVocal,
  },
  {
    title: "Part 3 Discussion Mastery",
    description: "Develop deeper ideas, comparisons, and opinions for higher-band discussion rounds.",
    icon: Target,
  },
];

export default function LandingPage() {
  return (
    <BackgroundBeamsWithCollision className="text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-8 pt-4 lg:px-10 lg:pt-5">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/70 bg-white/75 px-5 py-4 shadow-[0_12px_40px_rgba(14,23,36,0.06)] backdrop-blur-xl">
          <Link href="/landing-page" className="flex items-center gap-3 text-[color:var(--primary)]">
            <img src="/logo.png" alt="LexiSpeak logo" className="h-9 w-9 rounded-full object-cover" />
            <span className="text-2xl font-semibold tracking-tight">LexiSpeak</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <Link href="/landing-page" className="text-neutral-900 transition hover:text-[color:var(--primary)]">
              Home
            </Link>
            <Link href="#about-us" className="transition hover:text-[color:var(--primary)]">
              About Us
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

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--primary)] bg-white/90 px-5 py-3 text-sm font-semibold text-[color:var(--primary)] shadow-sm transition hover:-translate-y-[1px] hover:bg-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(201,91,91,0.25)] transition hover:-translate-y-[1px] hover:brightness-105"
            >
              Register
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-start gap-12 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[color:var(--primary)]" />
              Built for IELTS speaking practice
            </div>

            <h1 className="max-w-xl text-5xl font-medium tracking-tight text-neutral-950 md:text-6xl lg:text-7xl">
              Build Speaking Skills That Shape Your Future
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600 md:text-xl">
              Practice IELTS speaking with guided onboarding, topic-based Part 1 cards, time-boxed sessions, and rubric-aligned feedback.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="brand-pill-button inline-flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white"
              >
                Start Course
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <div className="text-3xl font-semibold text-neutral-950">{item.value}</div>
                  <div className="mt-1 text-sm text-neutral-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[720px]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="self-start rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-[0_24px_70px_rgba(14,23,36,0.12)] backdrop-blur-xl">
                <div className="mb-4 h-[360px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#2a0f0f_0%,#140808_55%,#0b0505_100%)] p-5 text-white">
                  <div className="flex h-full flex-col justify-between">
                    <div className="text-xs uppercase tracking-[0.28em] text-white/60">Live Practice</div>
                    <div>
                      <div className="text-3xl font-medium leading-tight">Speak naturally, one question at a time.</div>
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
                  <div className="relative h-[220px] p-5 text-white">
                    <img
                      src="/images/user/ai-female-student.jpg"
                      alt="AI female student"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,9,9,0.62),rgba(201,91,91,0.35))]" />
                    <div className="flex h-full flex-col justify-end">
                      <div className="relative text-2xl font-semibold">Interactive Classrooms</div>
                      <div className="relative mt-2 text-sm text-white/80">Practice with a guided flow built for speaking tests.</div>
                    </div>
                  </div>
                </div>

                {/* <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_70px_rgba(14,23,36,0.12)] backdrop-blur-xl">
                  <div className="text-6xl font-semibold tracking-tight text-neutral-950">62+</div>
                  <div className="mt-2 text-sm text-neutral-500">Practice prompts and guided cards</div>
                </div> */}

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
                            <div className="font-medium text-neutral-900">{item.title}</div>
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

        <section className="mt-8 px-1 py-4 sm:px-2">
          <p className="text-center text-xl font-medium text-neutral-700">Trusted by learners from 50+ countries</p>

          <div className="trusted-marquee mt-7">
            <div className="trusted-marquee-track">
              {[...trustedLogos, ...trustedLogos].map((name, index) => (
                <div key={`${name}-${index}`} className="trusted-logo-item">
                  <div className="trusted-logo-mark" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about-us" className="mt-8 grid gap-8 rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(14,23,36,0.08)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <div className="flex items-start gap-4">
            <img src="/logo.png" alt="LexiSpeak logo" className="h-14 w-14 rounded-2xl object-cover shadow-sm" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">About Us</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Learning built for real speaking progress</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600">
                LexiSpeak gives students a calmer way to train for IELTS speaking. You get structured Learn and Test flows, unit-based
                progress, topic prompts, timing, and rubric-aligned feedback without the clutter.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Flexible Learn", "Practice privately with topics and unit cards."],
                  ["Structured Test", "Coach-linked sessions for timed speaking rounds."],
                  ["Rubric Feedback", "See band-aligned analysis and next steps."],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-3xl border border-white/80 bg-white/85 p-4">
                    <div className="text-sm font-medium text-neutral-900">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-neutral-500">{description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--primary)]/15 bg-[linear-gradient(140deg,#5a1616_0%,#8e3232_52%,#3a0f0f_100%)] p-5 text-white shadow-[0_24px_70px_rgba(14,23,36,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
            <div className="relative flex h-full min-h-[520px] flex-col justify-between gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/60">Personal Coach Space</div>
                  <div className="mt-3 max-w-xs text-3xl font-semibold leading-tight text-white/95">
                    A guided space that still feels human.
                  </div>
                </div>

              </div>

              <div className="relative mx-auto w-full max-w-[360px] rounded-[28px] bg-white/12 p-3 shadow-2xl backdrop-blur-sm">
                <div className="overflow-hidden rounded-[24px] bg-[#4a1515]">
                  <img
                    src="/images/user/owner.jpg"
                    alt="Student practicing IELTS speaking"
                    className="h-[420px] w-full object-cover object-center"
                  />
                </div>

                <div className="floating-rating-card absolute left-[-74px] top-16 w-[184px] rounded-[24px] border border-white/40 bg-white/95 p-3 shadow-[0_16px_36px_rgba(14,23,36,0.16)]">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className={`flex h-8 items-center justify-center rounded-[6px] text-xs font-bold ${
                          idx === 4 ? "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]" : "bg-[color:var(--primary)] text-white"
                        }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <img src="/images/user/user-12.jpg" alt="User" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                      <img src="/images/user/user-05.jpg" alt="User" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                      <img src="/images/user/user-18.jpg" alt="User" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--primary)] text-white shadow-sm">
                      <Plus className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
                    <span className="text-[color:var(--primary)]">★</span>
                    <span>4.9</span>
                    <span className="font-medium text-neutral-600">Average Rating</span>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-14 left-1/2 w-[340px] -translate-x-1/2">
                  <div className="relative h-[132px]">
                    <div className="floating-chip-1 absolute left-1/2 top-0 w-[250px] whitespace-nowrap rounded-full bg-white px-8 py-3 text-center text-sm font-semibold text-[#7a1f1f] shadow-[0_14px_28px_rgba(14,23,36,0.22)]">
                      Speaking
                    </div>
                    <div className="floating-chip-2 absolute left-1/2 top-[44px] w-[250px] whitespace-nowrap rounded-full bg-white px-8 py-3 text-center text-sm font-semibold text-[#7a1f1f] shadow-[0_14px_28px_rgba(14,23,36,0.22)]">
                      IELTS
                    </div>
                    <div className="floating-chip-3 absolute left-1/2 top-[86px] w-[250px] whitespace-nowrap rounded-full bg-white px-8 py-3 text-center text-sm font-semibold text-[#7a1f1f] shadow-[0_14px_28px_rgba(14,23,36,0.22)]">
                      CONFIDENT
                   </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 px-1 py-6 sm:px-2 lg:px-3 lg:py-8">
          <div className="grid gap-4 md:grid-cols-4 md:gap-0">
            {lexispeakImpactStats.map((item, idx) => (
              <div key={item.label} className={`px-4 py-3 text-center md:text-left ${idx > 0 ? "md:border-l md:border-[color:var(--primary)]/28" : ""}`}>
                <p className="text-5xl font-semibold tracking-tight text-[color:var(--secondary-foreground)]">{item.value}</p>
                <p className="mt-2 text-sm leading-7 text-neutral-600">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <h3 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-neutral-950">
              Explore LexiSpeak's Speaking-Focused Practice Tracks
            </h3>
            <p className="max-w-lg text-sm leading-7 text-neutral-600">
              Choose structured IELTS speaking paths designed to improve fluency, confidence, and rubric-aligned response quality.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {speakingTracks.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.title}
                  className="rounded-[28px] border border-[color:var(--primary)]/24 bg-white/80 p-6 shadow-[0_20px_50px_rgba(14,23,36,0.08)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary)] text-white shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mt-5 text-3xl font-semibold tracking-tight text-neutral-900">{track.title}</h4>
                  <p className="mt-3 text-lg leading-8 text-neutral-600">{track.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </BackgroundBeamsWithCollision>
  );
}
