"use client";

import QuestionBank from "../_components/QuestionBank";

export default function AdminGuruInsightPage() {
  return (
    <QuestionBank
      title="Questions Bank"
      description="Lists all questions with search. Only admin can see and manage this page."
      emptyLabel="Question List"
      summaryLabel="Questions"
    />
  );
}
