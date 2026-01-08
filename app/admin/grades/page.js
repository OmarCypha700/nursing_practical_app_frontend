"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  FileDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [sortBy, setSortBy] = useState("index_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [filterProgram, searchQuery, sortBy, sortOrder]);

  const fetchPrograms = async () => {
    try {
      const res = await api.get("/exams/programs/");
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load programs");
    }
  };

  //   const fetchGrades = async () => {
  //     try {
  //       setLoading(true);
  //       const params = {
  //         sort_by: sortBy,
  //         order: sortOrder,
  //       };

  //       if (filterProgram !== "all") {
  //         params.program_id = filterProgram;
  //       }

  //       if (searchQuery) {
  //         params.search = searchQuery;
  //       }

  //       const res = await api.get("/exams/admin/grades/", { params });
  //       setGrades(res.data);
  //       setLoading(false);
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to load grades");
  //       setLoading(false);
  //     }
  //   };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const params = {
        sort_by: sortBy,
        order: sortOrder,
      };

      if (filterProgram !== "all") {
        params.program_id = filterProgram;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      // Changed URL path
      const res = await api.get("/exams/grades/", { params });
      setGrades(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load grades");
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = {
        export: format, // Changed from format: format to export: format
      };

      if (filterProgram !== "all") {
        params.program_id = filterProgram;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      // Use same URL, just add export parameter
      const response = await api.get("/exams/grades/", {
        params,
        responseType: "blob",
      });

      // Rest stays the same...
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const extension = format === "excel" ? "xlsx" : format;
      link.setAttribute("download", `student_grades.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Grades exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const getGradeBadgeColor = (grade) => {
    if (grade === "N/A") return "bg-gray-500";
    if (grade.startsWith("A")) return "bg-green-500";
    if (grade.startsWith("B")) return "bg-blue-500";
    if (grade.startsWith("C")) return "bg-yellow-500";
    if (grade.startsWith("D")) return "bg-orange-500";
    return "bg-red-500";
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 inline" />
    );
  };

  // Calculate statistics
  const stats = {
    total: grades.length,
    completed: grades.filter((g) => g.grade !== "N/A").length,
    averagePercentage:
      grades.length > 0
        ? (
            grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
          ).toFixed(2)
        : 0,
  };

  if (loading && grades.length === 0) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Grades</h2>
          <p className="text-muted-foreground">
            View and export student performance data
          </p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={exporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("excel")}
            disabled={exporting}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={exporting}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} with completed assessments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePercentage}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0
                ? ((stats.completed / stats.total) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Students with grades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or index..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterProgram} onValueChange={setFilterProgram}>
          <SelectTrigger className="w-64">
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
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Student Grades ({grades.length})
            {loading && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Loading...
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort("index_number")}
                  >
                    Index Number
                    <SortIcon column="index_number" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort("full_name")}
                  >
                    Full Name
                    <SortIcon column="full_name" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort("program_name")}
                  >
                    Program
                    <SortIcon column="program_name" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted text-center"
                    onClick={() => handleSort("total_score")}
                  >
                    Score
                    <SortIcon column="total_score" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted text-center"
                    onClick={() => handleSort("percentage")}
                  >
                    Percentage
                    <SortIcon column="percentage" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted text-center"
                    onClick={() => handleSort("grade")}
                  >
                    Grade
                    <SortIcon column="grade" />
                  </TableHead>
                  {/* <TableHead className="text-center">Progress</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No grades found
                    </TableCell>
                  </TableRow>
                ) : (
                  grades.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">
                        {student.index_number}
                      </TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.program_name}</TableCell>
                      <TableCell className="text-center">
                        {student.total_score} / {student.max_score}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {student.percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${getGradeBadgeColor(
                            student.grade
                          )} text-white hover:${getGradeBadgeColor(
                            student.grade
                          )}`}
                        >
                          {student.grade}
                        </Badge>
                      </TableCell>
                      {/* <TableCell className="text-center text-sm">
                        {student.reconciled_count} / {student.procedures_count}
                      </TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
