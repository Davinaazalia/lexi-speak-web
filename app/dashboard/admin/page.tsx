"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AppRole = "user" | "guru" | "admin";

type ProfileRow = {
  id: string;
  email: string;
  role: AppRole;
  coach_id: string | null;
  created_at: string | null;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState<5 | 10>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const counters = useMemo(() => {
    const total = profiles.length;
    const students = profiles.filter((p) => p.role === "user").length;
    const gurus = profiles.filter((p) => p.role === "guru").length;
    const admins = profiles.filter((p) => p.role === "admin").length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newStudents7d = profiles.filter((p) => {
      if (p.role !== "user" || !p.created_at) return false;
      return new Date(p.created_at) >= sevenDaysAgo;
    }).length;

    return { total, students, gurus, admins, newStudents7d };
  }, [profiles]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotice("");
      setIsUnauthorized(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setCurrentUserId(user.id);

      const metadataRole =
        user.user_metadata?.role === "admin" ||
        user.user_metadata?.role === "guru" ||
        user.user_metadata?.role === "user"
          ? (user.user_metadata.role as AppRole)
          : "user";

      const { data: me, error: meError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (meError) {
        setNotice("Failed to validate your admin access. Please refresh this page.");
        setLoading(false);
        return;
      }

      let myRole: AppRole | null = (me?.role as AppRole | null) ?? null;

      if (!me) {
        const { error: bootstrapError } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? "unknown@example.com",
            role: metadataRole,
          },
          { onConflict: "id" }
        );

        if (bootstrapError) {
          setNotice(
            "Profile row is missing and auto-create failed. Check Supabase RLS policy for profiles table."
          );
          setLoading(false);
          return;
        }

        myRole = metadataRole;
      }

      if (myRole !== "admin") {
        setIsUnauthorized(true);
        setNotice("You are signed in, but your role is not admin.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, coach_id, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setNotice(error.message);
      }

      setProfiles((data as ProfileRow[] | null) ?? []);
      setLoading(false);
    };

    void load();
  }, [router]);

  const handleRoleChange = async (id: string, role: AppRole) => {
    setSavingId(id);
    setNotice("");

    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);

    if (error) {
      setNotice(error.message);
      setSavingId(null);
      return;
    }

    setProfiles((prev) => prev.map((row) => (row.id === id ? { ...row, role } : row)));
    setSavingId(null);
  };

  const filteredProfiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return profiles.filter((row) => {
      if (!query) return true;
      return row.email.toLowerCase().includes(query) || row.role.toLowerCase().includes(query);
    });
  }, [profiles, searchTerm]);

  const coaches = useMemo(
    () => profiles.filter((row) => row.role === "guru").map((row) => ({ id: row.id, email: row.email })),
    [profiles]
  );

  const handleCoachAssign = async (studentId: string, coachId: string | null) => {
    setAssigningStudentId(studentId);
    setNotice("");

    const { error } = await supabase
      .from("profiles")
      .update({ coach_id: coachId })
      .eq("id", studentId)
      .eq("role", "user");

    if (error) {
      setNotice(error.message);
      setAssigningStudentId(null);
      return;
    }

    setProfiles((prev) =>
      prev.map((row) => (row.id === studentId ? { ...row, coach_id: coachId } : row))
    );

    setAssigningStudentId(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const totalRows = filteredProfiles.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = filteredProfiles.slice(startIndex, startIndex + pageSize);
  const startLabel = totalRows === 0 ? 0 : startIndex + 1;
  const endLabel = Math.min(startIndex + pageSize, totalRows);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Track students and maintain all role accounts from one admin panel.
        </p>
        {notice ? <p className="mt-3 text-sm text-error-600">{notice}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Accounts</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{counters.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Students</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{counters.students}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Coaches</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{counters.gurus}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Admins</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{counters.admins}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">New Students (7d)</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{counters.newStudents7d}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">All Roles Maintenance</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search account by email/role, change role, and manage test-time coach links with pagination.
          </p>
        </div>

        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 sm:w-72 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => setPageSize(parseInt(event.target.value) as 5 | 10)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">entries per page</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isUnauthorized ? (
            <div className="px-5 py-6 text-sm text-gray-600 dark:text-gray-300">
              Admin access required. Please set your account role to <span className="font-semibold">admin</span> in Supabase table <span className="font-semibold">profiles</span>.
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Test Coach</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-4 text-sm text-gray-500" colSpan={4}>Loading profiles...</td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td className="px-5 py-4 text-sm text-gray-500" colSpan={4}>No profiles found.</td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{row.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <select
                          value={row.role}
                          disabled={savingId === row.id}
                          onChange={(event) => handleRoleChange(row.id, event.target.value as AppRole)}
                          className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <option value="user">student</option>
                          <option value="guru">coach</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.role === "user" ? (
                          <select
                            value={row.coach_id ?? ""}
                            disabled={assigningStudentId === row.id}
                            onChange={(event) =>
                              handleCoachAssign(row.id, event.target.value || null)
                            }
                            className="w-52 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            <option value="">No test coach</option>
                            {coaches.map((coach) => (
                              <option key={coach.id} value={coach.id}>
                                {coach.email}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                        {row.id === currentUserId ? (
                          <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                            You
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading ? (
          <div className="space-y-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalRows === 0 ? "No profiles found" : `Showing ${startLabel} to ${endLabel} of ${totalRows} entries`}
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
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
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
    </section>
  );
}
