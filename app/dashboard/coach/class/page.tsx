"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TextButton from "@/components/ui/system/TextButton";
import { InputField } from "@/components/ui/system/InputField";
import { PlusIcon, UsersIcon, CopyIcon, CheckIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";

interface Class {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
}

interface Student {
  id: string;
  email: string;
}

export default function ClassPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nameClass, setNameClass] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkRoleAndFetch();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkRoleAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error.message);
        setLoading(false);
        return;
      }

      if (data?.role !== 'guru') {
        console.warn("User is not a guru, redirecting to dashboard");
        router.push('/dashboard');
        return;
      }

      await fetchClasses();
    } catch (err) {
      console.error("Error in checkRoleAndFetch:", err);
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("classes")
        .select("id, name, description, join_code")
        .eq("coach_id", user.id);

      if (error) {
        console.error("Error fetching classes:", error.message);
        setLoading(false);
        return;
      }

      setClasses(data || []);
    } catch (err) {
      console.error("Unexpected error in fetchClasses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!nameClass.trim()) {
      alert("Please enter a class name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        return;
      }

      const joinCode = Math.random().toString(36).substring(2, 15);

      const { data, error } = await supabase
        .from("classes")
        .insert({
          name: nameClass,
          description: description || null,
          join_code: joinCode,
          coach_id: user.id,
          created_by: user.id,
        })
        .select();

      if (error) {
        console.error("Error creating class:", error.message);
        alert("Failed to create class: " + error.message);
        return;
      }

      setNameClass("");
      setDescription("");
      setShowCreateForm(false);
      await fetchClasses();
    } catch (err) {
      console.error("Unexpected error in handleCreateClass:", err);
      alert("An unexpected error occurred");
    }
  };

  const handleOpenEditModal = (classItem: Class, event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setEditingClass(classItem);
    setNameClass(classItem.name);
    setDescription(classItem.description || "");
    setShowEditModal(true);
  };

  const handleUpdateClass = async () => {
    if (!editingClass) return;
    if (!nameClass.trim()) {
      alert("Please enter a class name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("classes")
        .update({
          name: nameClass,
          description: description || null,
        })
        .eq("id", editingClass.id)
        .select();

      if (error) {
        console.error("Error updating class:", error.message);
        alert("Failed to update class: " + error.message);
        return;
      }

      setEditingClass(null);
      setShowEditModal(false);
      setNameClass("");
      setDescription("");
      await fetchClasses();
    } catch (err) {
      console.error("Unexpected error in handleUpdateClass:", err);
      alert("An unexpected error occurred");
    }
  };

  const handleDeleteClass = async () => {
    if (!editingClass) return;

    const confirmed = confirm(`Hapus kelas ${editingClass.name}?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", editingClass.id);

      if (error) {
        console.error("Error deleting class:", error.message);
        alert("Failed to delete class: " + error.message);
        return;
      }

      setEditingClass(null);
      setShowEditModal(false);
      setNameClass("");
      setDescription("");
      await fetchClasses();
    } catch (err) {
      console.error("Unexpected error in handleDeleteClass:", err);
      alert("An unexpected error occurred");
    }
  };

  const handleViewStudents = async (classItem: Class) => {
    try {
      setSelectedClass(classItem);
      const { data, error } = await supabase
        .from("class_members")
        .select("profiles!inner(id, email)")
        .eq("class_id", classItem.id);

      if (error) {
        console.error("Error fetching class members:", error.message);
        alert("Failed to load students: " + error.message);
        return;
      }

      setStudents((data as any[] | null)?.map((d) => d.profiles as Student) || []);
      setShowModal(true);
    } catch (err) {
      console.error("Unexpected error in handleViewStudents:", err);
      alert("An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-primary font-medium">Loading classes...</p>
        </div>
      </div>
    );
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="w-full bg-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            My Classes
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage your class and students</p>
        </div>

        {/* Create Button */}
        <div className="mb-8 flex justify-start">
          <TextButton
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon weight="bold" size={20} />
            Create New Class
          </TextButton>
        </div>

        {/* Classes */}
        {classes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-400 bg-white p-10 text-center text-gray-700 max-w-3xl mx-auto">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Classes Yet</h2>
            <p className="text-gray-700 text-center mb-6 max-w-md mx-auto">
              Create your first class to start managing students and track their progress.
            </p>
            <TextButton
              variant="primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Class
            </TextButton>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="group cursor-pointer"
                onClick={() => handleViewStudents(cls)}
              >
                <div className="relative overflow-hidden rounded-[24px] border border-gray-200 bg-gradient-to-br from-white via-white to-rose-50/50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_rgba(15,23,42,0.16)] w-[360px]">
                  <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                        Class Room
                      </span>
                      <h3 className="mb-1 text-2xl font-bold text-gray-900 leading-tight">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cls.description ? cls.description : "Click to view students"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(cls, e)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-primary/70 shadow-sm transition-colors hover:bg-primary/5 hover:text-primary"
                        title="Edit class"
                      >
                        <PencilIcon size={20} weight="regular" />
                      </button>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-primary/70 shadow-sm transition-colors group-hover:text-primary">
                        <UsersIcon weight="regular" size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-rose-100 bg-white/90 p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">Join Code</p>
                    <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2">
                      <code className="font-mono text-base font-bold tracking-[0.18em] text-gray-900">
                        {cls.join_code.toUpperCase()}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(cls.join_code);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                        title="Copy join code"
                      >
                        {copiedCode === cls.join_code ? (
                          <>
                            <CheckIcon weight="bold" size={16} className="text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <CopyIcon weight="bold" size={16} className="text-rose-500" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && isMounted && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Class
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Class Name
                </label>
                <InputField
                  value={nameClass}
                  onChange={setNameClass}
                  placeholder="Enter class name..."
                  className="bg-white text-gray-900 outline-gray-300"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <InputField
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter class description..."
                  className="bg-white text-gray-900 outline-gray-300"
                />
              </div>

              <div className="flex gap-3">
                <TextButton
                  variant="primary"
                  onClick={handleCreateClass}
                  className="flex-1"
                >
                  Create
                </TextButton>
                <TextButton
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNameClass("");
                    setDescription("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </TextButton>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Class Modal */}
        {showEditModal && editingClass && isMounted && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Class
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Class Name
                </label>
                <InputField
                  value={nameClass}
                  onChange={setNameClass}
                  placeholder="Enter class name..."
                  className="bg-white text-gray-900 outline-gray-300"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <InputField
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter class description..."
                  className="bg-white text-gray-900 outline-gray-300"
                />
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <TextButton
                  variant="primary"
                  onClick={handleUpdateClass}
                  className="flex-1"
                >
                  Save Changes
                </TextButton>
                <TextButton
                  variant="secondary"
                  onClick={handleDeleteClass}
                  className="flex-1 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Delete Class
                </TextButton>
              </div>

              <div className="mt-4">
                <TextButton
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                    setNameClass("");
                    setDescription("");
                  }}
                  className="w-full"
                >
                  Cancel
                </TextButton>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Students Modal */}
        {showModal && selectedClass && isMounted && createPortal(
          <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Students in {selectedClass.name}
                </h2>
              </div>

              <div className="p-6">
                {students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-gray-600">No students joined yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 bg-tertiary rounded-lg hover:bg-tertiary/80 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center text-white font-bold">
                          {student.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white rounded-b-3xl border-t border-gray-100 p-6">
                <TextButton
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedClass(null);
                  }}
                  className="w-full"
                >
                  Close
                </TextButton>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </main>
  );
}