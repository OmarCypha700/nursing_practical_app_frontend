"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentsPage() {
  const { programId } = useParams();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) return;

    setLoading(true);

    api
      .get(`/exams/programs/${programId}/students/`)
      .then((res) => setStudents(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [programId]);

  /* Filter by index number or name */
  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      `${s.index_number} ${s.full_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-4 gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl uppercase font-bold mb-4">Select Student</h1>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by index number or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sticky w-full mb-4 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <ul className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="p-3 bg-gray-100 rounded animate-pulse">
              <Skeleton className="h-4 w-1/3 mb-2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </li>
          ))}

        {!loading && filteredStudents.length === 0 && (
          <li className="text-sm text-muted-foreground text-center py-4">
            No students found
          </li>
        )}

        {!loading &&
          filteredStudents.map((s) => (
            <li
              key={s.id}
              className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition"
              onClick={() =>
                router.push(`/programs/${programId}/students/${s.id}`)
              }
            >
              <div className="font-medium">{s.index_number}</div>
              <div className="text-sm text-muted-foreground">{s.full_name}</div>
            </li>
          ))}
      </ul>
    </div>
  );
}


