"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await api.get("/exams/admin/programs/");
      setPrograms(res.data);
      
      // Fetch stats for each program
      const statsPromises = res.data.map(async (program) => {
        const [studentsRes, proceduresRes] = await Promise.all([
          api.get(`/exams/programs/${program.id}/students/`),
          api.get(`/exams/programs/${program.id}/procedures/`),
        ]);
        return {
          id: program.id,
          students: studentsRes.data.length,
          procedures: proceduresRes.data.length,
        };
      });
      
      const programStats = await Promise.all(statsPromises);
      const statsMap = {};
      programStats.forEach((stat) => {
        statsMap[stat.id] = stat;
      });
      setStats(statsMap);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load programs");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingProgram) {
        await api.patch(`/exams/admin/programs/${editingProgram.id}/`, formData);
        toast.success("Program updated successfully");
      } else {
        await api.post("/exams/admin/programs/", formData);
        toast.success("Program created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchPrograms();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      abbreviation: program.abbreviation || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/admin/programs/${deleteDialog.id}/`);
      toast.success("Program deleted successfully");
      setDeleteDialog({ open: false, id: null });
      fetchPrograms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete program. It may have related records.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      abbreviation: "",
    });
    setEditingProgram(null);
  };

  const filteredPrograms = programs.filter((program) =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (program.abbreviation &&
      program.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Programs</h2>
          <p className="text-muted-foreground">
            Manage academic programs and their configurations
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Programs ({filteredPrograms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Abbreviation</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Procedures</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No programs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      {program.name}
                    </TableCell>
                    <TableCell>
                      {program.abbreviation ? (
                        <Badge variant="secondary">
                          {program.abbreviation}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge >
                        {stats[program.id]?.students || 0} students
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge >
                        {stats[program.id]?.procedures || 0} procedures
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(program)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: program.id })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? "Edit Program" : "Add New Program"}
            </DialogTitle>
            <DialogDescription>
              {editingProgram
                ? "Update program information"
                : "Create a new academic program"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Bachelor of Science in Nursing"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abbreviation">Abbreviation (Optional)</Label>
              <Input
                id="abbreviation"
                value={formData.abbreviation}
                onChange={(e) =>
                  setFormData({ ...formData, abbreviation: e.target.value })
                }
                placeholder="e.g., BSN"
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
                  : editingProgram
                  ? "Update Program"
                  : "Create Program"}
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
              This will permanently delete the program. Make sure there are no
              students or procedures associated with it. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}