"use client";

import { useEffect, useState } from "react";
import { Shield, BarChart3, TrendingUp, ScrollText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Stats {
  logs: Array<{ id: number; activity: string; status: string; createdAt: string }>;
  stats: {
    totalLogs: number;
    byStatus: { success: number; failed: number; warning: number };
    evaluations: {
      total: number;
      byLevel: { Weak: number; Medium: number; Strong: number; "Very Strong": number };
      averageScore: number;
    };
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/logs?limit=5");
        const json = await res.json();
        if (active) setData(json);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  const stats = data?.stats;
  const evals = stats?.evaluations;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
        Admin Dashboard
      </h1>

      {/* Stats cards */}
      <div className="mb-8 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-blue-50 p-2 sm:p-2.5 dark:bg-blue-900/20">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Evaluations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {evals?.total ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-green-50 p-2 sm:p-2.5 dark:bg-green-900/20">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Avg Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {evals?.averageScore ?? 0}<span className="text-xs font-normal text-gray-400">/100</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-amber-50 p-2 sm:p-2.5 dark:bg-amber-900/20">
              <ScrollText className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">System Logs</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalLogs ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-purple-50 p-2 sm:p-2.5 dark:bg-purple-900/20">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Log Status</p>
              <div className="flex gap-1 mt-0.5">
                <Badge color="green">{stats?.byStatus.success ?? 0}</Badge>
                <Badge color="red">{stats?.byStatus.failed ?? 0}</Badge>
                <Badge color="amber">{stats?.byStatus.warning ?? 0}</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Strength distribution + Recent activity */}
      <div className="mb-8 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title="Password Strength Distribution">
          {evals && evals.total > 0 ? (
            <div className="space-y-3">
              {(["Weak", "Medium", "Strong", "Very Strong"] as const).map((level) => {
                const count = evals.byLevel[level] ?? 0;
                const pct = (count / evals.total) * 100;
                const colors: Record<string, string> = {
                  Weak: "bg-strength-weak",
                  Medium: "bg-strength-medium",
                  Strong: "bg-strength-strong",
                  "Very Strong": "bg-strength-verystrong",
                };
                return (
                  <div key={level} className="flex items-center gap-2 sm:gap-3">
                    <span className="w-16 sm:w-20 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{level}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full ${colors[level]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 sm:w-12 text-right text-xs sm:text-sm tabular-nums text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No evaluations yet</p>
          )}
        </Card>

        <Card title="Recent Activity">
          {data?.logs && data.logs.length > 0 ? (
            <ul className="space-y-2">
              {data.logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 truncate">{log.activity}</span>
                  <Badge
                    color={log.status === "success" ? "green" : log.status === "failed" ? "red" : "amber"}
                  >
                    {log.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No recent activity</p>
          )}
        </Card>
      </div>

    </div>
  );
}
