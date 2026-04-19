"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AppRole = "user" | "guru" | "admin";

type ProfileRow = {
  id: string;
  email: string;
  role: AppRole;
  created_at: string | null;
};

type RoleInsightTableProps = {
  role: Exclude<AppRole, "admin">;
  title: string;
  description: string;
  emptyLabel: string;
  summaryLabel: string;
};

const roleLabel = (role: AppRole) => {
  if (role === "admin") return "admin";
  if (role === "guru") return "coach";
  return "student";
};

export default function RoleInsightTable({
  role,
  title,
  description,
  emptyLabel,
  summaryLabel,
}: RoleInsightTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState<5 | 10>(5);
  const [currentPage, setCurrentPage] = useState(1);

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

      const { data: me } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (me?.role !== "admin") {
        setIsUnauthorized(true);
        setNotice("You are signed in, but your role is not admin.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setNotice(error.message);
      }

      setRows((data as ProfileRow[] | null) ?? []);
      setLoading(false);
    };

    void load();
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize, role]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      if (row.role !== role) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return row.email.toLowerCase().includes(normalizedQuery);
    });
  }, [rows, role, searchTerm]);

  const totalRows = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = filteredRows.slice(startIndex, startIndex + pageSize);
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
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        {notice ? <p className="mt-3 text-sm text-error-600">{notice}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total {summaryLabel}</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{totalRows}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Top Controls Bar */}
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Search...`}
            className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />

          {/* Entries Per Page */}
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

        {/* Table */}
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
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-4 text-sm text-gray-500" colSpan={3}>
                      Loading {emptyLabel.toLowerCase()}...
                    </td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td className="px-5 py-4 text-sm text-gray-500" colSpan={3}>
                      No {emptyLabel.toLowerCase()} found.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{row.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{roleLabel(row.role)}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Info & Pagination */}
        {!loading ? (
          <div className="space-y-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex sm:items-center sm:justify-between sm:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalRows === 0 ? (
                `No ${emptyLabel.toLowerCase()} found`
              ) : (
                `Showing ${startLabel} to ${endLabel} of ${totalRows} entries`
              )}
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
    </section>
  );
}
