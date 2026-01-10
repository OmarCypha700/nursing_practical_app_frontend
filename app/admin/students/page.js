"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Upload,
  UserCheck,
  UserX,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    index_number: "",
    full_name: "",
    program_id: "",
    level: "100",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const [exportFormat, setExportFormat] = useState("excel");
  const [importDialog, setImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, programsRes] = await Promise.all([
        api.get("/exams/admin/students/"),
        api.get("/exams/programs/"),
      ]);
      setStudents(studentsRes.data);
      setPrograms(programsRes.data);
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

    try {
      if (editingStudent) {
        await api.patch(
          `/exams/admin/students/${editingStudent.id}/`,
          formData
        );
        toast.success("Student updated successfully");
      } else {
        await api.post("/exams/admin/students/", formData);
        toast.success("Student created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.index_number?.[0] || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      index_number: student.index_number,
      full_name: student.full_name,
      program_id: student.program.id,
      level: student.level,
      is_active: student.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/admin/students/${deleteDialog.id}/`);
      toast.success("Student deleted successfully");
      setDeleteDialog({ open: false, id: null });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.post("/exams/students/bulk-delete/", {
        student_ids: selectedStudents,
      });
      toast.success(`Successfully deleted ${selectedStudents.length} student(s)`);
      setBulkDeleteDialog(false);
      setSelectedStudents([]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to delete students");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.post(`/exams/admin/students/${id}/toggle_active/`);
      toast.success("Status updated successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        export: exportFormat,
      };

      if (filterProgram !== "all") {
        params.program_id = filterProgram;
      }

      if (filterLevel !== "all") {
        params.level = filterLevel;
      }

      const response = await api.get("/exams/admin/students/", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const extension = exportFormat === "excel" ? "xlsx" : exportFormat;
      link.setAttribute("download", `students.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(
        `Students exported successfully as ${exportFormat.toUpperCase()}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/exams/students/template/", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Template downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download template");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
        toast.error("Please upload a valid Excel (.xlsx) or CSV file");
        return;
      }

      setImportFile(file);
      setImportDialog(true);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error("Please select a file");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await api.post("/exams/students/import/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImportResult(response.data);

      if (response.data.errors === 0) {
        toast.success(
          `Import successful! Created: ${response.data.created}, Updated: ${response.data.updated}`
        );
        setTimeout(() => {
          setImportDialog(false);
          setImportFile(null);
          setImportResult(null);
          fetchData();
        }, 3000);
      } else {
        toast.warning(`Import completed with ${response.data.errors} errors`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      index_number: "",
      full_name: "",
      program_id: "",
      level: "100",
      is_active: true,
    });
    setEditingStudent(null);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.index_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram =
      filterProgram === "all" || student.program.id === parseInt(filterProgram);
    const matchesLevel =
      filterLevel === "all" || student.level === filterLevel;
    return matchesSearch && matchesProgram && matchesLevel;
  });

  const allSelected = filteredStudents.length > 0 && 
    selectedStudents.length === filteredStudents.length;
  const someSelected = selectedStudents.length > 0 && !allSelected;

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student records and enrollments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown */}
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileDown className="mr-2 h-4 w-4" />
            Template
          </Button>

          <label htmlFor="import-file">
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterProgram} onValueChange={setFilterProgram}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id.toString()}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="100">Level 100</SelectItem>
            <SelectItem value="200">Level 200</SelectItem>
            <SelectItem value="300">Level 300</SelectItem>
            <SelectItem value="400">Level 400</SelectItem>
          </SelectContent>
        </Select>

        {selectedStudents.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setBulkDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedStudents.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Students ({filteredStudents.length})
            {selectedStudents.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                • {selectedStudents.length} selected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className={someSelected ? "opacity-50" : ""}
                  />
                </TableHead>
                <TableHead>Index Number</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) =>
                          handleSelectStudent(student.id, checked)
                        }
                        aria-label={`Select ${student.full_name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.index_number}
                    </TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.program.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">L{student.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={student.is_active ? "success" : "destructive"}
                      >
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(student.id)}
                        >
                          {student.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: student.id })
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
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Update student information"
                : "Create a new student record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="index_number">Index Number</Label>
              <Input
                id="index_number"
                value={formData.index_number}
                onChange={(e) =>
                  setFormData({ ...formData, index_number: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={formData.program_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, program_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Level 100 (First Year)</SelectItem>
                  <SelectItem value="200">Level 200 (Second Year)</SelectItem>
                  <SelectItem value="300">Level 300 (Third Year)</SelectItem>
                  <SelectItem value="400">Level 400 (Fourth Year)</SelectItem>
                </SelectContent>
              </Select>
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
                  : editingStudent
                  ? "Update Student"
                  : "Create Student"}
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
              This will permanently delete the student record. This action
              cannot be undone.
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Students?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedStudents.length} student(s). This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive"
            >
              Delete {selectedStudents.length} Student(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Students</DialogTitle>
            <DialogDescription>
              Upload an Excel or CSV file to import student records
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {importFile && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">
                  {importFile.name}
                </p>
              </div>
            )}

            {importResult && (
              <div
                className={`p-4 rounded-lg ${
                  importResult.errors === 0 ? "bg-green-50" : "bg-yellow-50"
                }`}
              >
                <p className="font-semibold mb-2">Import Results:</p>
                <ul className="text-sm space-y-1">
                  <li>✓ Created: {importResult.created}</li>
                  <li>✓ Updated: {importResult.updated}</li>
                  {importResult.errors > 0 && (
                    <li className="text-red-600">
                      ✗ Errors: {importResult.errors}
                    </li>
                  )}
                </ul>

                {importResult.error_details &&
                  importResult.error_details.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Error Details:</p>
                      <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                        {importResult.error_details.map((error, idx) => (
                          <li key={idx} className="text-red-600">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImportDialog(false);
                setImportFile(null);
                setImportResult(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={importing || !importFile}
            >
              {importing ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
