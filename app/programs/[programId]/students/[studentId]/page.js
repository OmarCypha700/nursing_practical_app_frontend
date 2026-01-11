"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, ArrowLeft, RefreshCcw, Search, X, Lock, AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast } from "sonner";

export default function ProceduresPage() {
  const { programId, studentId } = useParams();
  const router = useRouter();
  const [procedures, setProcedures] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!programId || !studentId) return;

    // Fetch student details
    const fetchStudent = api.get(`/exams/students/${studentId}/`);

    // Fetch procedures
    const fetchProcedures = api.get(
      `/exams/programs/${programId}/procedures/`,
      {
        params: { student_id: studentId },
      }
    );

    Promise.all([fetchStudent, fetchProcedures])
      .then(([studentRes, proceduresRes]) => {
        setStudent(studentRes.data);
        setProcedures(proceduresRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [programId, studentId]);

  // Count reconciled procedures
  const reconciledCount = useMemo(() => {
    return procedures.filter((proc) => proc.status === "reconciled").length;
  }, [procedures]);

  // Check if limit reached
  const limitReached = reconciledCount >= 4;

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        className: "bg-yellow-500 normal-case hover:bg-yellow-600 text-white",
      },
      scored: {
        label: "Ready to Reconcile",
        className: "bg-blue-500 normal-case hover:bg-blue-600 text-white",
      },
      reconciled: {
        label: "Reconciled",
        className: "bg-green-500 normal-case hover:bg-green-600 text-white",
      },
    };
    return configs[status] || configs.pending;
  };

  const handleProcedureClick = (proc) => {
    // Check if reconciled
    if (proc.status === "reconciled") {
      toast.info("This procedure has already been reconciled.");
      return;
    }

    // Check if limit reached and procedure is not reconciled
    if (limitReached && proc.status !== "reconciled") {
      toast.error("Maximum of 4 procedures can be reconciled. This procedure is locked.");
      return;
    }

    router.push(
      `/programs/${programId}/students/${studentId}/procedures/${proc.id}`
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Filter procedures based on search query
  const filteredProcedures = procedures.filter((proc) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      proc.name.toLowerCase().includes(query) ||
      proc.status.toLowerCase().includes(query)
    );
  });

  // Check if a procedure should be disabled
  const isProcedureDisabled = (proc) => {
    return limitReached && proc.status !== "reconciled";
  };

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Student Info Header */}
      {student && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{student.full_name}</h2>
              <p className="text-sm text-muted-foreground">
                Index Number: {student.index_number}
              </p>
              {student.program && (
                <p className="text-sm text-muted-foreground">
                  Program: {student.program.name}
                </p>
              )}
              {/* Reconciliation count */}
              <p className="text-sm font-medium mt-1">
                <span className={reconciledCount >= 4 ? "text-green-600" : "text-primary"}>
                  {reconciledCount} of 4 procedures reconciled
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/programs/${programId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl uppercase font-bold">Select Procedure</h1>
      </div>

      <Separator className="mb-4" />

      {/* Limit Reached Alert */}
      {limitReached && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Maximum Procedures Reached</AlertTitle>
          <AlertDescription>
            This student has completed 4 reconciled procedures. All other procedures are now locked and cannot be accessed.
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search procedures by name or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Search Results Counter */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Found {filteredProcedures.length} of {procedures.length} procedure
            {procedures.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Procedures List */}
      <div className="space-y-3">
        {filteredProcedures.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              {searchQuery ? (
                <>
                  <p className="mb-2">No procedures found matching "{searchQuery}"</p>
                  <Button variant="link" onClick={clearSearch}>
                    Clear search
                  </Button>
                </>
              ) : (
                <p>No procedures available</p>
              )}
            </div>
          </Card>
        ) : (
          filteredProcedures.map((proc) => {
            const statusConfig = getStatusConfig(proc.status);
            const isDisabled = isProcedureDisabled(proc);

            return (
              <Card
                key={proc.id}
                className={`transition ${
                  isDisabled
                    ? "opacity-60 cursor-not-allowed bg-gray-50"
                    : "cursor-pointer hover:shadow-md hover:border-primary"
                }`}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={statusConfig.className}>
                        {statusConfig.label}
                        {proc.status === "reconciled" && (
                          <Lock className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                      
                      {isDisabled && (
                        <Badge variant="destructive" className="normal-case">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>

                    {proc.status === "scored" && !isDisabled && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/programs/${programId}/students/${studentId}/procedures/${proc.id}/reconcile`
                          );
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Reconcile <RefreshCcw className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>

                  <CardTitle 
                    onClick={() => !isDisabled && handleProcedureClick(proc)}
                    className={`text-lg uppercase ${
                      isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "cursor-pointer underline"
                    }`}
                  >
                    {proc.name}
                    {isDisabled && (
                      <Lock className="inline h-4 w-4 ml-2" />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}