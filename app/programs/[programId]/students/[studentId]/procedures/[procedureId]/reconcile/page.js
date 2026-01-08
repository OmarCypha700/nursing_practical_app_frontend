"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function ReconcilePage() {
  const { programId, studentId, procedureId } = useParams();
  const router = useRouter();

  const [reconciliationData, setReconciliationData] = useState(null);
  const [finalScores, setFinalScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !procedureId) return;

    api
      .get(
        `/exams/students/${studentId}/procedures/${procedureId}/reconciliation/`
      )
      .then((res) => {
        setReconciliationData(res.data);

        // Initialize with reconciled scores if available
        const initialScores = {};
        res.data.steps.forEach((step) => {
          // Use reconciled score if available, otherwise default to examiner_a
          initialScores[step.id] =
            step.reconciled_score ?? step.examiner_a_score ?? 0;
        });
        setFinalScores(initialScores);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [studentId, procedureId]);

  const handleScoreChange = (stepId, score) => {
    setFinalScores((prev) => ({
      ...prev,
      [stepId]: score,
    }));
  };

  const handleSubmit = async () => {
    if (!reconciliationData) return;

    // Validate all steps have scores
    const allStepsScored = reconciliationData.steps.every(
      (step) =>
        finalScores[step.id] !== undefined && finalScores[step.id] !== null
    );

    if (!allStepsScored) {
      toast.info("Please provide a score for all steps before submitting.");
      return;
    }

    setSaving(true);

    const reconciledScores = reconciliationData.steps.map((step) => ({
      step_id: step.id,
      score: finalScores[step.id],
    }));

    try {
      await api.post("/exams/save-reconciliation/", {
        student_procedure_id: reconciliationData.id,
        reconciled_scores: reconciledScores,
      });

      toast.success("Reconciliation saved successfully!");
      router.push(`/programs/${programId}/students/${studentId}`);
    } catch (err) {
      console.error("Failed to save reconciliation", err);
      toast.error("Failed to save reconciliation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <p>Loading reconciliation data...</p>
      </div>
    );
  }

  if (!reconciliationData) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <p>No reconciliation data found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Score Reconciliation</h1>
            <p className="text-sm text-muted-foreground">
              {reconciliationData.student.full_name} -{" "}
              {reconciliationData.student.index_number}
            </p>
          </div>
        </div>
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          {reconciliationData.status}
        </Badge>
      </div>

      <Separator className="mb-6" />

      {/* Examiners Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-600">Examiner A</p>
          <p className="text-lg">{reconciliationData.examiner_a_name}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">Examiner B</p>
          <p className="text-lg">{reconciliationData.examiner_b_name}</p>
        </div>
      </div>

            {reconciliationData.is_already_reconciled && (
        <Alert className="mb-4 border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This procedure was already reconciled by{" "}
            <strong>{reconciliationData.reconciled_by_name}</strong> on{" "}
            {new Date(reconciliationData.reconciled_at).toLocaleString()}.
            Submitting will update the reconciliation.
          </AlertDescription>
        </Alert>
      )}

      {/* Scoring Table */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 font-semibold">#</th>
              <th className="text-left p-6 font-semibold">Step Description</th>
              <th className="text-center p-4 font-semibold w-24">Examiner A</th>
              <th className="text-center p-4 font-semibold w-24">Examiner B</th>
              <th className="text-center p-4 font-semibold w-48">
                Final Score
              </th>
            </tr>
          </thead>
          <tbody>
            {reconciliationData.steps.map((step, index) => {
              const scoresMatch =
                step.examiner_a_score === step.examiner_b_score;

              return (
                <tr key={step.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{index + 1}</td>
                  <td className="p-6">{step.description}</td>

                  {/* Examiner A Score */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        scoresMatch
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {step.examiner_a_score ?? "-"}
                    </span>
                  </td>

                  {/* Examiner B Score */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        scoresMatch
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {step.examiner_b_score ?? "-"}
                    </span>
                  </td>

                  {/* Final Score Selection */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4].map((score) => {
                        const inputId = `final-${step.id}-${score}`;

                        return (
                          <label
                            key={score}
                            htmlFor={inputId}
                            className="flex flex-col items-center cursor-pointer"
                          >
                            <span className="text-xs font-semibold mb-1">
                              {score}
                            </span>
                            <input
                              id={inputId}
                              type="radio"
                              name={`final-${step.id}`}
                              value={score}
                              checked={finalScores[step.id] === score}
                              onChange={() => handleScoreChange(step.id, score)}
                              className="h-4 w-4 accent-primary"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Reconciliation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
