"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/exams/admin/dashboard-stats/")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.total_students,
      description: `${stats.active_students} active`,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Examiners",
      value: stats.total_examiners,
      description: "Registered examiners",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Procedures",
      value: stats.total_procedures,
      description: "Assessment procedures",
      icon: ClipboardList,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Programs",
      value: stats.total_programs,
      description: "Academic programs",
      icon: FileText,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const assessmentStats = [
    {
      title: "Pending Assessments",
      value: stats.pending_assessments,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Scored Assessments",
      value: stats.scored_assessments,
      icon: AlertCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Reconciled Assessments",
      value: stats.reconciled_assessments,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here's an overview of your system.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assessment Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Assessment Status</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {assessmentStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/students"
              className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Students</span>
            </a>
            <a
              href="/admin/examiners"
              className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Examiners</span>
            </a>
            <a
              href="/admin/procedures"
              className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <ClipboardList className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Procedures</span>
            </a>
            <a
              href="/admin/programs"
              className="flex items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Manage Programs</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}