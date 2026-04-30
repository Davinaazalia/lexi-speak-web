"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TextButton from "@/components/ui/system/TextButton";

type Question = {
    id: string;
    part: number;
    prompt: string | null;
    is_active: boolean;
    created_at: string | null;
};

type QuestionBankProps = {
    title: string;
    description: string;
    emptyLabel: string;
    summaryLabel: string;
};

export default function QuestionBank({
    title,
    description,
    emptyLabel,
    summaryLabel,
}: QuestionBankProps) {
    const router = useRouter();
    const [rows, setRows] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState("");
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageSize, setPageSize] = useState<5 | 10>(5);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [details, setDetails] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editTopic, setEditTopic] = useState<Question | null>(null);
    const [editPrompt, setEditPrompt] = useState("");
    const [editPart, setEditPart] = useState<number>(1);
    const [editActive, setEditActive] = useState(true);

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [newPart, setNewPart] = useState<number>(1);
    const [newTitle, setNewTitle] = useState("");
    const [newPrompt, setNewPrompt] = useState("");
    const [newActive, setNewActive] = useState(true);

    const [newDetails, setNewDetails] = useState<
        { type: "question" | "bullet"; content: string }[]
    >([]);

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
                .from("topics")
                .select("id, part, prompt, is_active, created_at")
                .order("created_at", { ascending: false });

            if (error) {
                setNotice(error.message);
            }

            setRows((data as Question[] | null) ?? []);
            setLoading(false);
        };

        void load();
    }, [router]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, pageSize]);

    const filteredRows = useMemo(() => {
        const q = searchTerm.toLowerCase();

        return rows.filter((row) =>
            row.prompt?.toLowerCase().includes(q)
        );
    }, [rows, searchTerm]);

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

    const handleRowClick = async (topicId: string) => {
        setSelectedTopicId(topicId);
        setIsModalOpen(true);

        const { data } = await supabase
            .from("topic_details")
            .select("*")
            .eq("topic_id", topicId)
            .order("order_index");

        setDetails((prev) => {
            if (selectedTopicId !== topicId) return prev;
            return data || [];
        });
    };

    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                {notice ? <p className="mt-3 text-sm text-error-600">{notice}</p> : null}
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* LEFT CARD */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Total {summaryLabel}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                        {totalRows}
                    </p>
                </div>

                {/* RIGHT CARD */}
                <div className="inline-flex justify-between items-center rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        New Questions
                    </p>
                    <TextButton
                        variant="primary"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Create Topic
                    </TextButton>
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
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Part</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Prompt</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Created</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-4 text-sm text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : visibleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-4 text-sm text-gray-500">
                                            No data found
                                        </td>
                                    </tr>
                                ) : (
                                    visibleRows.map((row) => (
                                        <tr
                                            key={row.id}
                                            onClick={() => handleRowClick(row.id)}
                                            className={`
            cursor-pointer border-b last:border-0
            hover:bg-gray-50 dark:hover:bg-white/5
            ${selectedTopicId === row.id ? "bg-brand-50" : ""}
          `}
                                        >
                                            <td className="px-5 py-4 text-sm font-medium">
                                                Part {row.part}
                                            </td>

                                            <td className="px-5 py-4 text-sm">
                                                {row.prompt || "-"}
                                            </td>

                                            <td className="px-5 py-4 text-sm">
                                                {row.is_active ? "Active" : "Inactive"}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-500">
                                                {row.created_at
                                                    ? new Date(row.created_at).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td className="px-5 py-4 text-sm flex gap-2">
                                                {/* EDIT */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditTopic(row);
                                                        setEditPrompt(row.prompt || "");
                                                        setEditPart(Number(row.part));
                                                        setEditActive(row.is_active);
                                                    }}
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    Edit
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();

                                                        const confirmDelete = confirm("Delete this topic?");
                                                        if (!confirmDelete) return;

                                                        const { error } = await supabase
                                                            .from("topics")
                                                            .delete()
                                                            .eq("id", row.id);

                                                        if (!error) {
                                                            setRows((prev) => prev.filter((r) => r.id !== row.id));
                                                        } else {
                                                            alert(error.message);
                                                        }
                                                    }}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    Delete
                                                </button>
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
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${safePage === page
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Topic Details</h3>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedTopicId(null);
                                    setDetails([]);
                                }}
                                className="text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>
                        </div>

                        {/* CONTENT */}
                        {details.length === 0 ? (
                            <p className="text-sm text-gray-500">No details</p>
                        ) : (
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                                {details.map((d) => (
                                    <li key={d.id} className="text-sm">
                                        <span className="font-semibold capitalize">{d.type}:</span>{" "}
                                        {d.content}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* FOOTER */}
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {editTopic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">

                        <h3 className="text-lg font-semibold mb-4">Edit Topic</h3>

                        {/* PART */}
                        <select
                            value={editPart}
                            onChange={(e) => setEditPart(Number(e.target.value))}
                            className="w-full mb-3 border p-2 rounded"
                        >
                            <option value={1}>Part 1</option>
                            <option value={2}>Part 2</option>
                            <option value={3}>Part 3</option>
                        </select>

                        {/* PROMPT */}
                        <input
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="w-full mb-3 border p-2 rounded"
                            placeholder="Prompt"
                        />

                        {/* ACTIVE */}
                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={editActive}
                                onChange={(e) => setEditActive(e.target.checked)}
                            />
                            Active
                        </label>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-2">
                            <TextButton
                                variant="secondary"
                                onClick={() => setEditTopic(null)}
                            >
                                Cancel
                            </TextButton>


                            <TextButton
                                variant="primary"
                                onClick={async () => {
                                    const { error } = await supabase
                                        .from("topics")
                                        .update({
                                            part: editPart,
                                            prompt: editPrompt,
                                            is_active: editActive,
                                        })
                                        .eq("id", editTopic.id);

                                    if (!error) {
                                        setRows((prev) =>
                                            prev.map((r) =>
                                                r.id === editTopic.id
                                                    ? {
                                                        ...r,
                                                        part: editPart,
                                                        prompt: editPrompt,
                                                        is_active: editActive,
                                                    }
                                                    : r
                                            )
                                        );

                                        setEditTopic(null);
                                    } else {
                                        alert(error.message);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Save
                            </TextButton>
                        </div>
                    </div>
                </div>
            )}

            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">Create Topic</h3>

                        {/* PART */}
                        <select
                            value={newPart}
                            onChange={(e) => setNewPart(Number(e.target.value))}
                            className="w-full mb-3 border p-2 rounded"
                        >
                            <option value={1}>Part 1</option>
                            <option value={2}>Part 2</option>
                            <option value={3}>Part 3</option>
                        </select>

                        {/* TITLE */}
                        <input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full mb-3 border p-2 rounded"
                        />

                        {/* PROMPT */}
                        <input
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                            placeholder="Prompt"
                            className="w-full mb-3 border p-2 rounded"
                        />

                        {/* ACTIVE */}
                        <label className="flex gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={newActive}
                                onChange={(e) => setNewActive(e.target.checked)}
                            />
                            Active
                        </label>

                        {/* DETAILS */}
                        <div className="space-y-2 mb-4">
                            {newDetails.map((d, i) => (
                                <div key={i} className="flex gap-2">
                                    <select
                                        value={d.type}
                                        onChange={(e) => {
                                            const updated = [...newDetails];
                                            updated[i].type = e.target.value as any;
                                            setNewDetails(updated);
                                        }}
                                        className="border p-2 rounded"
                                    >
                                        <option value="question">Question</option>
                                        <option value="bullet">Bullet</option>
                                    </select>

                                    <input
                                        value={d.content}
                                        onChange={(e) => {
                                            const updated = [...newDetails];
                                            updated[i].content = e.target.value;
                                            setNewDetails(updated);
                                        }}
                                        placeholder="Content"
                                        className="flex-1 border p-2 rounded"
                                    />

                                    <button
                                        onClick={() =>
                                            setNewDetails((prev) => prev.filter((_, idx) => idx !== i))
                                        }
                                        className="text-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* ADD DETAIL */}
                        <button
                            onClick={() =>
                                setNewDetails((prev) => [
                                    ...prev,
                                    { type: "question", content: "" },
                                ])
                            }
                            className="mb-4 text-blue-500"
                        >
                            + Add Detail
                        </button>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-2">
                            <TextButton
                                variant="secondary"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </TextButton>
                            <TextButton
                                variant="primary"
                                onClick={async () => {
                                    const { data: topic, error } = await supabase
                                        .from("topics")
                                        .insert({
                                            part: newPart,
                                            title: newTitle,
                                            prompt: newPrompt,
                                            is_active: newActive,
                                        })
                                        .select()
                                        .single();

                                    if (error) {
                                        alert(error.message);
                                        return;
                                    }

                                    if (newDetails.length > 0) {
                                        await supabase.from("topic_details").insert(
                                            newDetails.map((d, i) => ({
                                                topic_id: topic.id,
                                                type: d.type,
                                                content: d.content,
                                                order_index: i,
                                            }))
                                        );
                                    }

                                    setRows((prev) => [topic, ...prev]);

                                    setIsCreateOpen(false);
                                    setNewPrompt("");
                                    setNewPart(1);
                                    setNewActive(true);
                                    setNewDetails([]);
                                }}
                            >
                                Create
                            </TextButton>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
