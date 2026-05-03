"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { InputField } from "@/components/ui/system/InputField";
import TextButton from "@/components/ui/system/TextButton";
import { PlusIcon } from "@phosphor-icons/react";

interface RawClassData {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  coach_id: string;
}

interface JoinedClass {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  coach_name: string | null;
}

export default function StudentClassPage() {
  const [joinCode, setJoinCode] = useState("");
  const [joinedClasses, setJoinedClasses] = useState<JoinedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const fetchJoinedClasses = async (studentId: string) => {
    try {
      console.log("Fetching joined classes for student:", studentId);

      const { data: membershipData, error: membershipError } = await supabase
        .from("class_members")
        .select("class_id")
        .eq("student_id", studentId);

      console.log("Memberships fetched:", membershipData, "error:", membershipError);

      if (membershipError) {
        console.error("Error fetching joined class ids - Details:", {
          message: membershipError.message,
          code: membershipError.code,
          details: membershipError.details,
          hint: membershipError.hint,
        });
        setMessage(`Gagal memuat kelas: ${membershipError.message}`);
        return;
      }

      const classIds = (membershipData || []).map((item) => item.class_id).filter(Boolean);
      console.log("Class IDs from memberships:", classIds);

      if (classIds.length === 0) {
        console.log("No classes found for this student");
        setJoinedClasses([]);
        return;
      }

      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, name, description, join_code, coach_id")
        .in("id", classIds);

      console.log("Classes fetched:", classesData, "error:", classesError);

      if (classesError) {
        console.error("Error fetching classes - Details:", {
          message: classesError.message,
          code: classesError.code,
          details: classesError.details,
          hint: classesError.hint,
        });
        setMessage(`Gagal memuat detail kelas: ${classesError.message}`);
        return;
      }

      const coachIds = (classesData || []).map((cls: RawClassData) => cls.coach_id).filter(Boolean);
      console.log("Coach IDs extracted:", coachIds);
      interface CoachData {
        id: string;
        email: string;
      }

      let coaches: { [key: string]: string } = {};
      if (coachIds.length > 0) {
        const { data: coachesData, error: coachesError } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", coachIds);

        console.log("Coaches fetch error:", coachesError);
        console.log("Coaches data:", coachesData);

        if (!coachesError && coachesData) {
          coaches = coachesData.reduce((acc, coach: CoachData) => {
            acc[coach.id] = coach.email;
            return acc;
          }, {} as { [key: string]: string });
        }
        console.log("Coaches map:", coaches);
      }

      console.log("Setting joined classes:", classesData);
      const mappedClasses = (classesData || []).map((cls: RawClassData) => {
        const coachName = coaches[cls.coach_id] || null;
        console.log(`Class ${cls.id} (${cls.name}): coach_id=${cls.coach_id}, coach_name=${coachName}`);
        return {
          id: cls.id,
          name: cls.name,
          description: cls.description,
          join_code: cls.join_code,
          coach_name: coachName,
        };
      });
      setJoinedClasses(mappedClasses);
    } catch (err) {
      console.error("Unexpected error fetching joined classes:", err);
      setMessage("Terjadi kesalahan ketika memuat kelas");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile role:", profileError.message);
          return;
        }

        if (profileData?.role !== "user") {
          router.push("/dashboard");
          return;
        }

        await fetchJoinedClasses(user.id);
      } catch (err) {
        console.error("Error initializing StudentClassPage:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [router]);

  const handleJoinClass = async () => {
    const code = joinCode.trim();
    if (!code) {
      setMessage("Masukkan kode kelas terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      console.log("Calling join_class_by_code with code:", code);

      const { error: joinError } = await supabase.rpc("join_class_by_code", {
        p_join_code: code,
      });

      console.log("join_class_by_code result - error:", joinError);

      if (joinError) {
        console.error("Error joining class:", joinError);
        if (joinError.message.includes("tidak ditemukan")) {
          setMessage("Kode kelas tidak ditemukan. Periksa kembali dan coba lagi.");
        } else if (joinError.message.includes("Hanya akun student")) {
          setMessage("Hanya akun student yang dapat bergabung.");
        } else {
          setMessage("Gagal bergabung dengan kelas: " + joinError.message);
        }
        return;
      }

      console.log("Member berhasil disimpan!");
      setJoinCode("");
      setMessage("Berhasil bergabung ke kelas!");
      await fetchJoinedClasses(user.id);
    } catch (err) {
      console.error("Unexpected error joining class:", err);
      setMessage("Terjadi kesalahan ketika bergabung. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-primary font-medium">Memuat kelas...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Class</h1>
          <p className="mt-2 text-gray-600">Masukkan kode join untuk gabung kelas. Setelah berhasil kamu akan melihat kartu kelas di bawah.</p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)] backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <InputField
                  value={joinCode}
                  onChange={setJoinCode}
                  placeholder="Masukkan join code..."
                  className="w-full"
                />
              </div>
              <TextButton
                onClick={handleJoinClass}
                disabled={submitting}
                variant="primary"
                className="w-full sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <PlusIcon size={18} weight="fill" />
                  Join
                </span>
              </TextButton>
            </div>
            {message ? (
              <p className="mt-4 text-sm text-gray-700">{message}</p>
            ) : (
              <p className="mt-4 text-sm text-gray-500">Kamu bisa menambahkan kelas dengan kode di atas.</p>
            )}
          </div>

          <div className="space-y-4">
            {joinedClasses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-10 text-center text-gray-500">
                <p className="text-lg font-medium">Belum bergabung dengan kelas apa pun.</p>
                <p className="mt-2 text-sm">Masukkan kode join kelas untuk memulai.</p>
              </div>
            ) : (
              joinedClasses.map((joinedClass) => (
                <div
                  key={joinedClass.id}
                  className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-[1px_2px_12px_0px_rgba(217,217,217,0.50)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Joined Class</p>
                      <h2 className="mt-2 text-2xl font-semibold text-gray-900">{joinedClass.name}</h2>
                      <p className="mt-2 text-gray-500">Coach: {joinedClass.coach_name || "Tidak ada coach"}</p>
                    </div>
                    <div className="rounded-2xl bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                      Code: {joinedClass.join_code}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">{joinedClass.description || "Tidak ada deskripsi kelas."}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
