import { supabase } from "@/lib/supabase";
import { CATEGORY_MAP, CategoryName } from "./categoryMap";

type Params = {
  session: "practice" | "test";
  category: CategoryName;
};

export async function generateTopicCode({ session, category }: Params) {
  const categoryCode = CATEGORY_MAP[category];

  if (!categoryCode) {
    throw new Error("Invalid category");
  }

  const mode = session === "test" ? "TS" : "PT";

  const { data } = await supabase
    .from("topics")
    .select("seq")
    .eq("session", session)
    .eq("category_code", categoryCode)
    .order("seq", { ascending: false })
    .limit(1);

  const nextSeq = (data?.[0]?.seq || 0) + 1;

  const seqFormatted = String(nextSeq).padStart(4, "0");

  const topicCode = `${mode}${categoryCode}-${seqFormatted}`;

  return {
    topicCode,
    seq: nextSeq,
    categoryCode,
  };
}