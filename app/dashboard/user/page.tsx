"use client";

import RoleOverviewPanel from "../_components/RoleOverviewPanel";

export default function UserDashboardPage() {
  return (
    <RoleOverviewPanel
      expectedRole="user"
      title="Student Dashboard"
      description="Overview akun student kamu dengan data profile yang sudah login."
    />
  );
}
