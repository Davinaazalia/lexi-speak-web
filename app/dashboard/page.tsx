"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AppRole = "user" | "guru" | "admin";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const routeByRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const metadataRole = user.user_metadata?.role as AppRole | undefined;
      const role = (data?.role as AppRole | undefined) ?? metadataRole ?? "user";
      const target =
        role === "admin"
          ? "/dashboard/admin"
          : role === "guru"
            ? "/dashboard/coach"
            : "/dashboard/user";

      router.replace(target);
    };

    void routeByRole();
  }, [router]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">Preparing your dashboard...</p>
    </div>
  );
}
