"use client";

import { useEffect, useState } from "react";
import { ScrollText, CheckCircle2, XCircle, AlertCircle, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface LogEntry {
  id: number;
  userId: number | null;
  activity: string;
  status: string;
  createdAt: string;
  user?: { id: number; email: string | null; name: string | null; role: string } | null;
}

interface LogsData {
  logs: LogEntry[];
  stats: {
    totalLogs: number;
    byStatus: { success: number; failed: number; warning: number };
    evaluations: {
      total: number;
      byLevel: Record<string, number>;
      averageScore: number;
    };
  };
}

const statusConfig: Record<string, { color: "green" | "red" | "amber"; icon: typeof CheckCircle2 }> = {
  success: { color: "green", icon: CheckCircle2 },
  failed: { color: "red", icon: XCircle },
  warning: { color: "amber", icon: AlertCircle },
};

export default function LogsPage() {
  const [data, setData] = useState<LogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/logs?limit=100");
        const json = await res.json();
        if (active) setData(json);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  const fetchLogs = async (status?: string) => {
    setFilter(status ?? "");
    setLoading(true);
    try {
      const url = `/api/admin/logs?limit=100${status ? `&status=${status}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <ScrollText className="h-6 w-6 text-green-600" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Activity Logs</h1>
      </div>

      {/* Stats summary */}
      {data?.stats && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Success</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{data.stats.byStatus.success}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">Failed</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{data.stats.byStatus.failed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-xs text-gray-500">Warning</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{data.stats.byStatus.warning}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "" ? "primary" : "secondary"}
          onClick={() => fetchLogs()}
        >
          All ({data?.stats.totalLogs ?? 0})
        </Button>
        <Button
          size="sm"
          variant={filter === "success" ? "primary" : "secondary"}
          onClick={() => fetchLogs("success")}
        >
          Success ({data?.stats.byStatus.success ?? 0})
        </Button>
        <Button
          size="sm"
          variant={filter === "failed" ? "primary" : "secondary"}
          onClick={() => fetchLogs("failed")}
        >
          Failed ({data?.stats.byStatus.failed ?? 0})
        </Button>
        <Button
          size="sm"
          variant={filter === "warning" ? "primary" : "secondary"}
          onClick={() => fetchLogs("warning")}
        >
          Warning ({data?.stats.byStatus.warning ?? 0})
        </Button>
      </div>

      {/* Logs */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
        </div>
      ) : !data?.logs || data.logs.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400">No logs found</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.logs.map((log) => {
            const cfg = statusConfig[log.status] ?? { color: "gray" as const, icon: AlertCircle };
            const StatusIcon = cfg.icon;
            return (
              <Card key={log.id} className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <StatusIcon className={`h-4 w-4 ${
                      log.status === "success" ? "text-green-600" :
                      log.status === "failed" ? "text-red-600" :
                      "text-amber-600"
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {log.activity}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <Badge color={cfg.color}>{log.status}</Badge>
                      {log.user && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <User className="h-3 w-3" />
                          {log.user.name ?? log.user.email ?? "Unknown"}
                          {log.user.role === "admin" && (
                            <span className="text-purple-500 font-medium">· admin</span>
                          )}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
