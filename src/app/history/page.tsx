"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, LogIn, Brain, Shield, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, strengthToColor } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Evaluation {
  id: number;
  strengthLevel: string;
  score: number;
  entropy: number | null;
  mlClass: string | null;
  mlConfidence: number | null;
  mlScore: number | null;
  ruleScore: number | null;
  createdAt: string;
}

interface HistoryData {
  evaluations: Evaluation[];
  stats: {
    total: number;
    avgScore: number;
    byLevel: Record<string, number>;
  };
}

const levelColors: Record<string, string> = {
  Weak: "bg-strength-weak",
  Medium: "bg-strength-medium",
  Strong: "bg-strength-strong",
  "Very Strong": "bg-strength-verystrong",
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) {
          if (active) setAuthed(false);
          return;
        }
        const res = await fetch("/api/history");
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <LogIn className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Login Required</h1>
        <p className="mt-1 text-sm text-gray-500">You need to be logged in to view your history.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Login
          </Link>
          <Link href="/register" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
            Register
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const evaluations = data?.evaluations ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <History className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Evaluation History</h1>
      </div>

      {/* Summary stats */}
      {stats && stats.total > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Avg Score</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{stats.avgScore}<span className="text-xs font-normal text-gray-400">/100</span></p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4">
            <p className="text-xs text-gray-500 mb-1">Strength Distribution</p>
            <div className="space-y-1">
              {Object.entries(stats.byLevel).map(([level, count]) => (
                <div key={level} className="flex items-center gap-1.5 text-xs">
                  <span className="w-12 text-gray-500">{level}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={cn("h-full rounded-full", levelColors[level])}
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-gray-400">{count}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">AI Analyzed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  {evaluations.filter(e => e.mlClass).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Evaluation cards */}
      {evaluations.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400">No evaluations yet. Go to the evaluator to try it out.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {evaluations.map((eval_, i) => (
            <Card key={eval_.id} className="p-4">
              <div className="flex flex-col gap-3">
                {/* Top row: index, level, score, date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">#{evaluations.length - i}</span>
                    <Badge color={strengthToColor(eval_.strengthLevel)}>
                      {eval_.strengthLevel}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(eval_.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                    {eval_.score}<span className="text-sm font-normal text-gray-400">/100</span>
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={cn("h-full rounded-full transition-all", levelColors[eval_.strengthLevel])}
                      style={{ width: `${eval_.score}%` }}
                    />
                  </div>
                </div>

                {/* Detailed metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Rule score */}
                  <div className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-800/50">
                    <p className="text-gray-400">Rule Score</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                      {eval_.ruleScore ?? "—"}/100
                    </p>
                  </div>

                  {/* ML score */}
                  <div className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-900/20">
                    <p className="text-purple-400">AI Score</p>
                    <p className="font-semibold text-purple-700 dark:text-purple-300 tabular-nums">
                      {eval_.mlScore ?? "—"}/100
                    </p>
                  </div>

                  {/* ML class + confidence */}
                  <div className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-900/20">
                    <p className="text-purple-400">AI Prediction</p>
                    <p className="font-semibold text-purple-700 dark:text-purple-300">
                      {eval_.mlClass ?? "—"}
                      {eval_.mlConfidence != null && (
                        <span className="font-normal text-purple-400">
                          {" "}({(eval_.mlConfidence * 100).toFixed(0)}%)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Entropy */}
                  <div className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-800/50">
                    <p className="text-gray-400">Entropy</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                      {eval_.entropy != null ? `${eval_.entropy.toFixed(0)} bits` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Back to evaluator */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Shield className="h-4 w-4" />
          Evaluate Another Password
        </Link>
      </div>
    </div>
  );
}
