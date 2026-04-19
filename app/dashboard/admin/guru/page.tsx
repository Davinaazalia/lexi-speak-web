"use client";

import RoleInsightTable from "../_components/RoleInsightTable";

export default function AdminGuruInsightPage() {
  return (
    <RoleInsightTable
      role="guru"
      title="Coach Insight (Admin View)"
      description="Review coach accounts with search, pagination, and page-size controls."
      emptyLabel="Coach Accounts"
      summaryLabel="Coaches"
    />
  );
}
