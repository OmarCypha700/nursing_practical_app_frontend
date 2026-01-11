"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Stethoscope,
  HeartPulse,
  GraduationCap,
  BookOpen,
  HandHeart,
} from "lucide-react";

const programIcons = {
  RGN: Stethoscope,
  RM: HeartPulse,
  PHN: HandHeart,
  RNAP: GraduationCap,
  default: BookOpen,
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
  if (isAuthenticated) {
    api.get("/exams/programs/")
      .then(res => setPrograms(res.data))
      .catch(() => {});
  }
}, [isAuthenticated]);


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Select Program</h1>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Skeleton loaders */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
            </Card>
          ))}

        {/* Program cards */}
        {!loading &&
          programs.map((program) => {
            const Icon =
              programIcons[program.abbreviation] || programIcons.default;

            return (
              <Card
                key={program.id}
                onClick={() =>
                  router.push(`/programs/${program.id}`)
                }
                className="cursor-pointer transition hover:shadow-md hover:border-primary"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" >
                      {program.abbreviation
                        ? program.abbreviation.replace("_", " ")
                        : "General"}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg">
                    {program.name}
                  </CardTitle>

                  <CardDescription>
                    Click to view students and procedures
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
