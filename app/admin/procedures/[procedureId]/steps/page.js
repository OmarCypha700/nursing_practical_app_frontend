"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";

export default function ProcedureStepsPage() {
  const { procedureId } = useParams();
  const router = useRouter();
  const [procedure, setProcedure] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [formData, setFormData] = useState({
    description: "",
    step_order: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [procedureId]);

  const fetchData = async () => {
    try {
      const [procedureRes, stepsRes] = await Promise.all([
        api.get(`/exams/admin/procedures/${procedureId}/`),
        api.get(`/exams/admin/procedure-steps/?procedure_id=${procedureId}`),
      ]);
      setProcedure(procedureRes.data);
      setSteps(stepsRes.data.sort((a, b) => a.step_order - b.step_order));
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const stepData = {
      ...formData,
      procedure_id: parseInt(procedureId),
    };

    try {
      if (editingStep) {
        await api.patch(
          `/exams/admin/procedure-steps/${editingStep.id}/`,
          stepData
        );
        toast.success("Step updated successfully");
      } else {
        await api.post("/exams/admin/procedure-steps/", stepData);
        toast.success("Step created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (step) => {
    setEditingStep(step);
    setFormData({
      description: step.description,
      step_order: step.step_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/admin/procedure-steps/${deleteDialog.id}/`);
      toast.success("Step deleted successfully");
      setDeleteDialog({ open: false, id: null });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete step");
    }
  };

  const handleReorder = async (stepId, direction) => {
    const currentIndex = steps.findIndex((s) => s.id === stepId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    [newSteps[currentIndex], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[currentIndex],
    ];

    // Update step orders
    try {
      await Promise.all(
        newSteps.map((step, index) =>
          api.patch(`/exams/admin/procedure-steps/${step.id}/`, {
            step_order: index + 1,
            description: step.description,
            procedure_id: parseInt(procedureId),
          })
        )
      );
      toast.success("Order updated successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
      step_order: steps.length + 1,
    });
    setEditingStep(null);
  };

  const openAddDialog = () => {
    resetForm();
    setFormData({
      ...formData,
      step_order: steps.length + 1,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!procedure) {
    return <div className="p-6">Procedure not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/procedures")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button onClick={openAddDialog} className="md:hidden">
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {procedure.name} - Steps
          </h2>
          <p className="text-muted-foreground">
            Program: {procedure.program} | Total Score: {procedure.total_score}
          </p>
        </div>
        <Button onClick={openAddDialog} className="hidden md:inline-flex">
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
      </div>

      {/* Steps Table */}
      <Card>
        <CardHeader>
          <CardTitle>Procedure Steps ({steps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No steps added yet</p>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Step
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32 text-center">Reorder</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.map((step, index) => (
                  <TableRow key={step.id}>
                    <TableCell className="font-medium">
                      {step.step_order}
                    </TableCell>
                    <TableCell>{step.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(step.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(step.id, "down")}
                          disabled={index === steps.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(step)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: step.id })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? "Edit Step" : "Add New Step"}
            </DialogTitle>
            <DialogDescription>
              {editingStep
                ? "Update step information"
                : "Create a new procedure step"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="step_order">Step Order</Label>
              <Input
                id="step_order"
                type="number"
                value={formData.step_order}
                onChange={(e) =>
                  setFormData({ ...formData, step_order: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingStep
                  ? "Update Step"
                  : "Create Step"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the step. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
