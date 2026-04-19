"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AppRole = "user" | "guru" | "admin";

type ProfileRow = {
  email: string | null;
  role: AppRole | null;
  created_at: string | null;
};

type RoleOverviewPanelProps = {
  expectedRole: Exclude<AppRole, "admin">;
  title: string;
  description: string;
};

const roleLabel = (role: AppRole | null | undefined) => {
  if (role === "admin") return "Admin";
  if (role === "guru") return "Coach";
  return "Student";
};

export default function RoleOverviewPanel({
  expectedRole,
  title,
  description,
}: RoleOverviewPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [userEmail, setUserEmail] = useState<string>("-");

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
        .select("email, role, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setNotice(error.message);
      }

      const resolved = (data as ProfileRow | null) ?? null;
      setProfile(resolved);

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

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </section>
    );
  }

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
    </section>
  );
}
