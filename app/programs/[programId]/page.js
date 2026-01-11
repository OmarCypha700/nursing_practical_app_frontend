"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function StudentsPage() {
  const { programId } = useParams();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) return;

    fetchStudents();
  }, [programId, levelFilter]);

  const fetchStudents = () => {
    setLoading(true);

    const params = {};
    if (levelFilter !== "all") {
      params.level = levelFilter;
    }

    api
      .get(`/exams/programs/${programId}/students/`, { params })
      .then((res) => setStudents(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  // Get unique levels from students for the dropdown
  const availableLevels = useMemo(() => {
    const levels = new Set();
    students.forEach((s) => {
      if (s.level) levels.add(s.level);
    });
    return Array.from(levels).sort();
  }, [students]);

  // Filter by search only (level filtering is done on backend)
  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      `${s.index_number} ${s.full_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  const clearFilters = () => {
    setSearch("");
    setLevelFilter("all");
  };

  const getLevelLabel = (level) => {
    const labels = {
      '100': 'Level 100',
      '200': 'Level 200',
      '300': 'Level 300',
      '400': 'Level 400',
      '500': 'Level 500',
      '600': 'Level 600',
    };
    return labels[level] || `Level ${level}`;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-4 gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/programs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl uppercase font-bold mb-4">Select Student</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-3 mb-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by index number or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Level Filter and Active Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="100">Level 100</SelectItem>
              <SelectItem value="200">Level 200</SelectItem>
              <SelectItem value="300">Level 300</SelectItem>
              {/* <SelectItem value="400">Level 400</SelectItem> */}
            </SelectContent>
          </Select>

          {/* Active Filters */}
          {(search || levelFilter !== "all") && (
            <div className="flex items-center gap-2">
              {levelFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {getLevelLabel(levelFilter)}
                  <button
                    onClick={() => setLevelFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        {(search || levelFilter !== "all") && !loading && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} student
            {students.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Students List */}
      <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="p-3 bg-gray-100 rounded animate-pulse">
              <Skeleton className="h-4 w-1/3 mb-2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </li>
          ))}

        {!loading && filteredStudents.length === 0 && (
          <li className="text-center py-8">
            <p className="text-muted-foreground mb-2">No students found</p>
            {(search || levelFilter !== "all") && (
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </li>
        )}

        {!loading &&
          filteredStudents.map((s) => (
            <li
              key={s.id}
              className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition group"
              onClick={() =>
                router.push(`/programs/${programId}/students/${s.id}`)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{s.index_number}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.full_name}
                  </div>
                </div>
                {s.level && (
                  <Badge
                    variant="outline"
                    className="ml-2 group-hover:bg-primary group-hover:text-primary-foreground transition"
                  >
                    L{s.level}
                  </Badge>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
