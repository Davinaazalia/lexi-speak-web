import RoleInsightTable from "../_components/RoleInsightTable";

export default function StudentInsightPage() {
  return (
    <RoleInsightTable
      role="user"
      title="Students Insight (Admin View)"
      description="Review student accounts with search, pagination, and page-size controls."
      emptyLabel="Student Accounts"
      summaryLabel="Students"
    />
  );
}
