"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StudentRow = {
  id: string;
  email: string;
  created_at: string | null;
  role: "user";
};

type StudentProgressRow = {
  student_id: string;
  latest_score: number | null;
  progress_percent: number | null;
  speaking_attempts: number | null;
  last_activity_at: string | null;
  updated_at: string | null;
  notes: string | null;
};

type StudentInsight = StudentRow & {
  name: string;
  latest_score: number | null;
  progress_percent: number | null;
  speaking_attempts: number;
  last_activity_at: string | null;
  updated_at: string | null;
  notes: string | null;
};

const getStudentNameFromEmail = (email: string) => {
  const left = email.split("@")[0] ?? "student";
  return left
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const isActiveToday = (value: string | null) => {
  if (!value) return false;
  const target = new Date(value);
  const now = new Date();
  return target.toDateString() === now.toDateString();
};

export default function CoachStudentsInsightTable() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [students, setStudents] = useState<StudentInsight[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState<5 | 10>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailStudent, setDetailStudent] = useState<StudentInsight | null>(null);

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

      const { data: me, error: meError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (meError) {
        setNotice(meError.message);
        setLoading(false);
        return;
      }

      if (me?.role !== "guru" && me?.role !== "admin") {
        setNotice("Coach access only.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .eq("role", "user")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setNotice(`${error.message}. If coach_id is not created yet, run supabase/profiles_setup.sql.`);
      }

      const studentRows = (data as StudentRow[] | null) ?? [];
      if (studentRows.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = studentRows.map((row) => row.id);

      const { data: progressRows, error: progressError } = await supabase
        .from("student_progress")
        .select("student_id, latest_score, progress_percent, speaking_attempts, last_activity_at, updated_at, notes")
        .in("student_id", studentIds);

      if (progressError) {
        setNotice(
          `${progressError.message}. Jika table student_progress belum dibuat, jalankan ulang supabase/profiles_setup.sql.`
        );
      }

      const progressMap = new Map(
        ((progressRows as StudentProgressRow[] | null) ?? []).map((row) => [row.student_id, row])
      );

      const mergedRows: StudentInsight[] = studentRows.map((row) => {
        const progress = progressMap.get(row.id);
        return {
          ...row,
          name: getStudentNameFromEmail(row.email),
          latest_score: progress?.latest_score ?? null,
          progress_percent: progress?.progress_percent ?? null,
          speaking_attempts: progress?.speaking_attempts ?? 0,
          last_activity_at: progress?.last_activity_at ?? null,
          updated_at: progress?.updated_at ?? null,
          notes: progress?.notes ?? null,
        };
      });

      setStudents(mergedRows);
      setLoading(false);
    };

    void load();
  }, [router]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return students.filter((row) => {
      if (!query) return true;
      return row.email.toLowerCase().includes(query) || row.name.toLowerCase().includes(query);
    });
  }, [searchTerm, students]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const totalRows = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = filteredRows.slice(startIndex, startIndex + pageSize);
  const startLabel = totalRows === 0 ? 0 : startIndex + 1;
  const endLabel = Math.min(startIndex + pageSize, totalRows);

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Students Insight</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Halaman ini fokus ke tabel monitoring siswa. Action Detail menampilkan ringkasan progress per siswa.
        </p>
        {notice ? <p className="mt-3 text-sm text-error-600">{notice}</p> : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Students Monitoring</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Core monitoring table for your assigned students.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search nama/email..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 sm:w-64 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
            <select
              value={pageSize}
              onChange={(event) => setPageSize(parseInt(event.target.value) as 5 | 10)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Nama</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Last Activity</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Avg Score</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Progress (%)</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-4 text-sm text-gray-500" colSpan={6}>Loading students...</td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-4 text-sm text-gray-500" colSpan={6}>No assigned students found.</td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const active = isActiveToday(row.last_activity_at);
                  return (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{row.name}</td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            active
                              ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(row.last_activity_at)}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.latest_score !== null ? row.latest_score.toFixed(1) : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.progress_percent !== null ? `${row.progress_percent.toFixed(1)}%` : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() => setDetailStudent(row)}
                          className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-300 dark:hover:bg-brand-500/10"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading ? (
          <div className="space-y-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalRows === 0 ? "No students assigned" : `Showing ${startLabel} to ${endLabel} of ${totalRows} students`}
            </p>
            {totalRows > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  ‹
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      safePage === page
                        ? "bg-brand-500 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= pageCount}
                  onClick={() => setCurrentPage((value) => Math.min(pageCount, value + 1))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {detailStudent ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Student Detail</h3>
            <button
              type="button"
              onClick={() => setDetailStudent(null)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Nama</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{detailStudent.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Avg Score</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {detailStudent.latest_score !== null ? detailStudent.latest_score.toFixed(1) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Progress</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {detailStudent.progress_percent !== null ? `${detailStudent.progress_percent.toFixed(1)}%` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Last Activity</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">{formatDate(detailStudent.last_activity_at)}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Notes</p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{detailStudent.notes ?? "No notes yet."}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
