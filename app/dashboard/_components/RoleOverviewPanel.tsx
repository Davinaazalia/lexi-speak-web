"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type AppRole = "user" | "guru" | "admin";

type ProfileRow = {
  id: string;
  email: string | null;
  role: AppRole | null;
  coach_id: string | null;
  created_at: string | null;
};

type StudentProgressRow = {
  student_id: string;
  latest_score: number | null;
  progress_percent: number | null;
  notes: string | null;
  last_activity_at: string | null;
};

type StudentScoreHistoryRow = {
  id: number;
  student_id: string;
  score: number;
  speaking_attempts: number;
  unit_index: number | null;
  part_index: number | null;
  recorded_at: string;
};

type CoachRow = {
  id: string;
  email: string | null;
};

type RoleOverviewPanelProps = {
  expectedRole: Exclude<AppRole, "admin">;
  title: string;
  description: string;
  tab?: "dashboard" | "learn" | "test";
};

const roleLabel = (role: AppRole | null | undefined) => {
  if (role === "admin") return "Admin";
  if (role === "guru") return "Coach";
  return "Student";
};

const formatBand = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const normalized = value > 9.5 ? value / 10 : value;
  return Math.max(0, Math.min(9, Number(normalized.toFixed(1))));
};

const getCurrentLevelLabel = (band: number | null) => {
  if (band === null) return "-";
  if (band < 3.5) return "A2 (Elementary)";
  if (band < 4.5) return "B1 (Intermediate)";
  if (band < 5.5) return "B1+ (Upper Beginner)";
  if (band < 6.5) return "B2 (Upper-Intermediate)";
  if (band < 7.5) return "C1 (Advanced)";
  return "C1+ (Advanced)";
};

const formatDelta = (delta: number) => {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}`;
};

export default function RoleOverviewPanel({
  expectedRole,
  title,
  description,
  tab = "dashboard",
}: RoleOverviewPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [userEmail, setUserEmail] = useState<string>("-");
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [connectingCoach, setConnectingCoach] = useState(false);
  const [progress, setProgress] = useState<StudentProgressRow | null>(null);
  const [historyRows, setHistoryRows] = useState<StudentScoreHistoryRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotice("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email ?? "-");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, coach_id, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setNotice(error.message);
      }

      const resolved = (data as ProfileRow | null) ?? null;
      setProfile(resolved);
      setSelectedCoachId(resolved?.coach_id ?? "");

      const { data: progressData } = await supabase
        .from("student_progress")
        .select("student_id, latest_score, progress_percent, notes, last_activity_at")
        .eq("student_id", user.id)
        .maybeSingle();

      setProgress((progressData as StudentProgressRow | null) ?? null);

      const { data: historyData } = await supabase
        .from("student_score_history")
        .select("id, student_id, score, speaking_attempts, unit_index, part_index, recorded_at")
        .eq("student_id", user.id)
        .order("recorded_at", { ascending: true });

      setHistoryRows((historyData as StudentScoreHistoryRow[] | null) ?? []);

      if (expectedRole === "user") {
        const { data: coachData } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("role", "guru")
          .order("email", { ascending: true });

        setCoaches((coachData as CoachRow[] | null) ?? []);
      }

      if (resolved?.role && resolved.role !== expectedRole && resolved.role !== "admin") {
        setNotice(`Your account role is ${roleLabel(resolved.role)}. This page is optimized for ${roleLabel(expectedRole)}.`);
      }

      setLoading(false);
    };

    void load();
  }, [expectedRole, router]);

  const createdLabel = useMemo(() => {
    if (!profile?.created_at) return "-";
    return new Date(profile.created_at).toLocaleDateString();
  }, [profile?.created_at]);

  const currentCoachLabel = useMemo(() => {
    if (!profile?.coach_id) return "Not connected yet";
    return coaches.find((coach) => coach.id === profile.coach_id)?.email ?? "Connected coach";
  }, [coaches, profile?.coach_id]);

  const latestBand = useMemo(() => formatBand(progress?.latest_score ?? null), [progress?.latest_score]);

  const previousBand = useMemo(() => {
    if (historyRows.length < 2) return null;
    return formatBand(historyRows[historyRows.length - 2]?.score ?? null);
  }, [historyRows]);

  const weeklyDelta = useMemo(() => {
    if (historyRows.length === 0) return 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRows = historyRows.filter((row) => new Date(row.recorded_at) >= sevenDaysAgo);
    if (recentRows.length < 2) return 0;

    const firstBand = formatBand(recentRows[0]?.score ?? null) ?? 0;
    const lastBand = formatBand(recentRows[recentRows.length - 1]?.score ?? null) ?? 0;
    return lastBand - firstBand;
  }, [historyRows]);

  const progressTrend = useMemo(() => {
    const categories = historyRows.map((row) => new Date(row.recorded_at).toLocaleDateString());
    const data = historyRows.map((row) => formatBand(row.score) ?? 0);

    const options: ApexOptions = {
      chart: {
        type: "line",
        height: 320,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      colors: ["#465FFF"],
      stroke: { curve: "smooth", width: 3 },
      markers: { size: 4 },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        title: { text: "Time" },
      },
      yaxis: {
        min: 0,
        max: 9,
        tickAmount: 9,
        title: { text: "Band score" },
      },
      grid: {
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        y: {
          formatter: (value: number) => value.toFixed(1),
        },
      },
    };

    return {
      options,
      series: [{ name: "Band score", data }],
      hasData: data.length > 0,
    };
  }, [historyRows]);

  const skillBreakdown = useMemo(() => {
    const base = latestBand ?? 0;
    const progressBonus = Math.min(0.4, (progress?.progress_percent ?? 0) / 250);
    const values = {
      fluency: Math.max(0, Math.min(9, Number((base + progressBonus).toFixed(1)))),
      lexical: Math.max(0, Math.min(9, Number((base - 0.1 + progressBonus).toFixed(1)))),
      grammar: Math.max(0, Math.min(9, Number((base - 0.2 + progressBonus).toFixed(1)))),
      pronunciation: Math.max(0, Math.min(9, Number((base - 0.3 + progressBonus).toFixed(1)))),
    };

    const options: ApexOptions = {
      chart: {
        type: "radar",
        height: 320,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      colors: ["#465FFF"],
      stroke: { width: 2 },
      fill: {
        opacity: 0.18,
      },
      dataLabels: { enabled: true },
      xaxis: {
        categories: [
          "Fluency",
          "Lexical",
          "Grammar",
          "Pronunciation",
        ],
      },
      yaxis: {
        min: 0,
        max: 9,
        tickAmount: 3,
      },
    };

    return {
      options,
      series: [
        {
          name: "Estimated skill band",
          data: [values.fluency, values.lexical, values.grammar, values.pronunciation],
        },
      ],
      values,
    };
  }, [latestBand, progress?.progress_percent]);

  const practiceHistoryRows = useMemo(() => {
    return [...historyRows].slice(-8).reverse();
  }, [historyRows]);

  const aiFeedback = useMemo(() => {
    if (latestBand === null) {
      return [
        "No practice score yet. Start a test to generate AI feedback.",
        "When the first test is saved, this section will summarize your strongest and weakest areas.",
      ];
    }

    const points = [
      `Latest estimated IELTS band is ${latestBand.toFixed(1)}.`,
      weeklyDelta !== 0 ? `Your band changed ${formatDelta(weeklyDelta)} this week.` : "You need more than one result to show a weekly trend.",
      latestBand < 5.5
        ? "Focus on longer answers, clearer linking, and reducing hesitation."
        : latestBand < 6.5
          ? "Push for more precise vocabulary and more controlled grammar."
          : "Maintain fluency and add more sophisticated examples in each answer.",
    ];

    return points;
  }, [latestBand, weeklyDelta]);

  const summaryCards = [
    {
      label: "Current Level",
      value: getCurrentLevelLabel(latestBand),
      meta: latestBand !== null ? `Derived from latest band ${latestBand.toFixed(1)}` : "No band yet",
    },
    {
      label: "Estimated IELTS Band",
      value: latestBand !== null ? latestBand.toFixed(1) : "-",
      meta: latestBand !== null ? "Latest overall speaking estimate" : "Start a test first",
    },
    {
      label: "Progress",
      value: `${weeklyDelta >= 0 ? "+" : ""}${weeklyDelta.toFixed(1)}`,
      meta: "Band change this week",
    },
    {
      label: "Practice Count",
      value: `${historyRows.length}`,
      meta: "Saved speaking sessions",
    },
  ];

  const unitCards = [
    {
      id: "unit-1",
      title: "Unit 1",
      subtitle: "Learn mode",
      topic: "Your home town or village",
      description: "Flexible practice. Open any part first, then move in your own order.",
      accent: "from-brand-500 to-brand-300",
      actionLabel: "Open Learn Hub",
      parts: [
        { id: 1, title: "Part 1", hint: "Short answers" },
        { id: 2, title: "Part 2", hint: "Cue card / long turn" },
        { id: 3, title: "Part 3", hint: "Longer discussion" },
      ],
    },
    {
      id: "unit-2",
      title: "Unit 2",
      subtitle: "Test mode",
      topic: "Your accommodation",
      description: "Strict practice. The order is locked and the coach is connected at test start.",
      accent: "from-amber-500 to-orange-300",
      actionLabel: "Open Test Hub",
      parts: [
        { id: 1, title: "Part 1", hint: "Quick warm-up" },
        { id: 2, title: "Part 2", hint: "Cue card / 1-minute prep" },
        { id: 3, title: "Part 3", hint: "Follow-up discussion" },
      ],
    },
  ];

  const completedPartsByUnit = useMemo(() => {
    const unitMap = new Map<number, Set<number>>();

    historyRows.forEach((row) => {
      const unitIndex = row.unit_index ?? 1;
      const partIndex = row.part_index ?? 1;
      if (!unitMap.has(unitIndex)) {
        unitMap.set(unitIndex, new Set<number>());
      }
      unitMap.get(unitIndex)?.add(partIndex);
    });

    return unitMap;
  }, [historyRows]);

  const getUnitProgress = (unitIndex: number) => {
    const completedCount = completedPartsByUnit.get(unitIndex)?.size ?? 0;
    return Number(((completedCount / 3) * 100).toFixed(1));
  };

  const getPartProgress = (unitIndex: number, partIndex: number) => {
    const completed = completedPartsByUnit.get(unitIndex)?.has(partIndex) ?? false;
    return completed ? 100 : 0;
  };

  const handleUnitPartClick = (unitIndex: number, partIndex: number) => {
    const targetMode = unitIndex === 1 ? "learn" : "test";
    router.push(`/onboarding?mode=${targetMode}&unit=${unitIndex}&part=${partIndex}&autostart=1&replay=1`);
  };

  const handleConnectCoachForTest = async () => {
    if (!selectedCoachId) {
      setNotice("Please choose a coach first.");
      return;
    }

    setConnectingCoach(true);
    setNotice("");

    const { error } = await supabase.rpc("assign_student_coach", {
      coach: selectedCoachId,
    });

    if (error) {
      setNotice(error.message);
      setConnectingCoach(false);
      return;
    }

    const selectedCoach = coaches.find((coach) => coach.id === selectedCoachId);
    setProfile((prev) => (prev ? { ...prev, coach_id: selectedCoachId } : prev));
    setNotice(selectedCoach ? `Connected to ${selectedCoach.email} for IELTS test.` : "Coach connected for IELTS test.");
    setConnectingCoach(false);
    router.push("/onboarding?mode=test&unit=2&part=1&autostart=1&replay=1");
  };

  const [modalUnitIndex, setModalUnitIndex] = useState<number | null>(null);
  const openUnitModal = (unitIndex: number) => setModalUnitIndex(unitIndex);
  const closeUnitModal = () => setModalUnitIndex(null);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  // For Learn/Test modes, show only unit cards
  if ((tab === "learn" || tab === "test") && expectedRole === "user") {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          {notice ? <p className="mt-3 text-sm text-warning-600">{notice}</p> : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-1">
          {unitCards
            .filter((_, idx) => (tab === "learn" ? idx === 0 : tab === "test" ? idx === 1 : true))
            .map((unit, _) => {
            const unitIndex = tab === "learn" ? 1 : tab === "test" ? 2 : 1;
            const unitProgress = getUnitProgress(unitIndex);

            return (
            <div key={unit.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <div onClick={() => openUnitModal(unitIndex)} className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{unit.subtitle}</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">{unit.title}</h3>
                  <p className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400">Topic: {unit.topic}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{unit.description}</p>
                </div>
                <span className={`rounded-full bg-gradient-to-r ${unit.accent} px-3 py-1 text-xs font-semibold text-white`}>
                  3 Parts
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Unit progress</span>
                  <span>{unitProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${unit.accent}`}
                    style={{ width: `${Math.max(0, unitProgress)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {unit.parts.map((part) => {
                  const partProgress = getPartProgress(unitIndex, part.id);
                  const isPartTwo = part.id === 2;
                  return (
                    <div
                      key={`summary-${part.id}`}
                      className={`rounded-2xl border px-3 py-2 ${
                        isPartTwo
                          ? "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        <span>{part.title}</span>
                        <span>{isPartTwo ? "Cue card" : partProgress >= 100 ? "Done" : "Open"}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{part.hint}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${isPartTwo ? "from-amber-500 to-orange-300" : unit.accent}`}
                          style={{ width: `${partProgress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                {unit.parts.map((part) => {
                  const partProgress = getPartProgress(unitIndex, part.id);
                  const isPartTwo = part.id === 2;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleUnitPartClick(unitIndex, part.id); }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-[1px] ${
                        isPartTwo
                          ? "border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100/70 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/20"
                          : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-white/[0.03] dark:hover:bg-brand-500/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{part.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{part.hint}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isPartTwo
                            ? "bg-white text-amber-700 dark:bg-amber-500/20 dark:text-amber-100"
                            : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {isPartTwo ? "1 min prep" : partProgress >= 100 ? "Done" : "Open"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white dark:bg-gray-800">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${isPartTwo ? "from-amber-500 to-orange-300" : unit.accent}`}
                            style={{ width: `${partProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{partProgress.toFixed(1)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {unitIndex === 2 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Coach for test
                    </label>
                    <select
                      value={selectedCoachId}
                      onChange={(event) => setSelectedCoachId(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <option value="">Select a coach for this test</option>
                      {coaches.map((coach) => (
                        <option key={coach.id} value={coach.id}>
                          {coach.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectCoachForTest}
                    disabled={connectingCoach || !selectedCoachId}
                    className="rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connectingCoach ? "Connecting..." : "Connect Coach & Start Test"}
                  </button>
                </div>
              ) : null}
            </div>
            );
          })}
        </div>
        {modalUnitIndex !== null && (() => {
          const unitIndex = modalUnitIndex;
          const unitCards2 = [
            {
              id: "unit-1",
              title: "Unit 1",
              subtitle: "Learn mode",
              description: "Flexible practice. Open any part first, then move in your own order.",
              accent: "from-brand-500 to-brand-300",
              parts: [
                { id: 1, title: "Part 1", hint: "Short answers" },
                { id: 2, title: "Part 2", hint: "Describe the prompt" },
                { id: 3, title: "Part 3", hint: "Longer discussion" },
              ],
            },
            {
              id: "unit-2",
              title: "Unit 2",
              subtitle: "Test mode",
              description: "Strict practice. The order is locked and the coach is connected at test start.",
              accent: "from-amber-500 to-orange-300",
              parts: [
                { id: 1, title: "Part 1", hint: "Start of test" },
                { id: 2, title: "Part 2", hint: "Middle of test" },
                { id: 3, title: "Part 3", hint: "Final discussion" },
              ],
            },
          ];
          const unit = unitCards2[unitIndex - 1];
          if (!unit) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={closeUnitModal} />
              <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{unit.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{unit.subtitle}</p>
                  </div>
                  <button onClick={closeUnitModal} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">✕</button>
                </div>
                <div className="mt-4 space-y-3">
                  {unit.parts.map((part) => {
                    const partProgress = getPartProgress(unitIndex, part.id);
                    const isPartTwo = part.id === 2;
                    return (
                      <div
                        key={part.id}
                        className={`rounded-lg border p-4 ${
                          isPartTwo
                            ? "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                            : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{part.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{part.hint}</div>
                          </div>
                            <button
                              onClick={() => { handleUnitPartClick(unitIndex, part.id); closeUnitModal(); }}
                              className={`rounded-full px-3 py-1 text-xs font-medium text-white hover:shadow-md transition ${
                                isPartTwo ? "bg-gradient-to-r from-amber-500 to-orange-300" : "bg-gradient-to-r from-brand-500 to-brand-300"
                              }`}
                            >
                              {isPartTwo ? "Open cue card" : "Open chat"}
                            </button>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${isPartTwo ? "from-amber-500 to-orange-300" : "from-brand-500 to-brand-300"}`}
                              style={{ width: `${partProgress}%` }}
                            />
                          </div>
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">{partProgress.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    );
  }

  // Full dashboard view
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        {notice ? <p className="mt-3 text-sm text-warning-600">{notice}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Account Email</p>
          <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90 break-all">{profile?.email ?? userEmail}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Current Role</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{roleLabel(profile?.role ?? expectedRole)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Member Since</p>
          <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">{createdLabel}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-500 dark:text-gray-400">Quick Access</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/dashboard/profile"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Open Profile
          </Link>
          <Link
            href="/dashboard/notifications"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            View Notifications
          </Link>
        </div>
      </div>

      {expectedRole === "user" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{card.value}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{card.meta}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Unit modal */}
      {modalUnitIndex !== null && (() => {
        const unit = unitCards[modalUnitIndex - 1] as any;
        const unitIndex = modalUnitIndex;
        if (!unit) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeUnitModal} />
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                  <p className="text-sm text-gray-500">{unit.subtitle}</p>
                </div>
                <button onClick={closeUnitModal} className="text-sm text-gray-500">Close</button>
              </div>

              <div className="mt-4 space-y-3">
                {unit.parts.map((part: any) => {
                  const partProgress = getPartProgress(unitIndex, part.id);
                  return (
                    <div key={part.id} className="rounded-lg border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{part.title}</div>
                          <div className="text-xs text-gray-500">{part.hint}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleUnitPartClick(unitIndex, part.id)} className="rounded-full bg-brand-500 px-3 py-1 text-xs text-white">Open chat session</button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300" style={{ width: `${partProgress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500">{partProgress.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {expectedRole === "user" ? (
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">Progress Over Time</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your band score by date or week.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                IELTS Band
              </span>
            </div>

            <div className="mt-4">
              {progressTrend.hasData ? (
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-[680px]">
                    <ReactApexChart options={progressTrend.options} series={progressTrend.series} type="line" height={320} />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No score history yet. Start a test to generate the first band point.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">Skill Breakdown</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Estimated IELTS skill profile.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Radar Chart
              </span>
            </div>

            <div className="mt-4">
              <ReactApexChart options={skillBreakdown.options} series={skillBreakdown.series} type="radar" height={320} />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["Fluency", skillBreakdown.values.fluency],
                ["Lexical", skillBreakdown.values.lexical],
                ["Grammar", skillBreakdown.values.grammar],
                ["Pronunciation", skillBreakdown.values.pronunciation],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{label}</span>
                    <span className="font-semibold text-gray-800 dark:text-white/90">{Number(value).toFixed(1)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white dark:bg-gray-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300" style={{ width: `${(Number(value) / 9) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {expectedRole === "user" ? (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">AI Feedback Section</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generated from your latest band and trend.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Latest Review
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {aiFeedback.map((point) => (
                <div key={point} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-white/[0.03] dark:text-gray-300">
                  {point}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Coach Notes</p>
              <p className="mt-2">{progress?.notes ?? "No coach notes yet."}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">Practice History Table</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Recent speaking sessions and saved bands.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {practiceHistoryRows.length} Rows
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="max-h-[320px] overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3">Part</th>
                      <th className="px-4 py-3">Band</th>
                      <th className="px-4 py-3">Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {practiceHistoryRows.length > 0 ? (
                      practiceHistoryRows.map((row) => (
                        <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{new Date(row.recorded_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.unit_index ?? 1}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.part_index ?? 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white/90">{formatBand(row.score)?.toFixed(1) ?? "-"}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.speaking_attempts}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                          No practice history yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {expectedRole === "user" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {unitCards.map((unit, unitOffset) => {
            const unitIndex = unitOffset + 1;
            const unitProgress = getUnitProgress(unitIndex);

            return (
            <div key={unit.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{unit.subtitle}</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">{unit.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{unit.description}</p>
                </div>
                <span className={`rounded-full bg-gradient-to-r ${unit.accent} px-3 py-1 text-xs font-semibold text-white`}>
                  3 Parts
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Unit progress</span>
                  <span>{unitProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${unit.accent}`}
                    style={{ width: `${Math.max(0, unitProgress)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {unit.parts.map((part) => {
                  const partProgress = getPartProgress(unitIndex, part.id);
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => handleUnitPartClick(unitIndex, part.id)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-white/[0.03] dark:hover:bg-brand-500/10"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{part.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{part.hint}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {partProgress >= 100 ? "Done" : "Open"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white dark:bg-gray-800">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${unit.accent}`}
                            style={{ width: `${partProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{partProgress.toFixed(1)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {unitIndex === 2 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Coach for test
                    </label>
                    <select
                      value={selectedCoachId}
                      onChange={(event) => setSelectedCoachId(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <option value="">Select a coach for this test</option>
                      {coaches.map((coach) => (
                        <option key={coach.id} value={coach.id}>
                          {coach.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectCoachForTest}
                    disabled={connectingCoach || !selectedCoachId}
                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {connectingCoach ? "Connecting..." : unit.actionLabel}
                  </button>
                </div>
              ) : (
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-white/[0.03] dark:text-gray-300">
                  <span>Practice stays private in Learn mode.</span>
                  <span className="font-medium text-gray-800 dark:text-white/90">Free order</span>
                </div>
              )}
            </div>
            );
          })}
        </div>
      ) : null}

    </section>
  );
}
