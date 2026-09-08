"use client";

import { useEffect, useState } from "react";
import { ScrollText, Brain, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, strengthToColor } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  user: {
    id: number;
    email: string | null;
    name: string | null;
  };
}

interface EvalData {
  evaluations: Evaluation[];
  stats: {
    total: number;
    byLevel: Record<string, number>;
  };
}

const levelColors: Record<string, string> = {
  Weak: "bg-strength-weak",
  Medium: "bg-strength-medium",
  Strong: "bg-strength-strong",
  "Very Strong": "bg-strength-verystrong",
};

export default function AdminEvaluationsPage() {
  const [data, setData] = useState<EvalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const fetchEvals = async (level?: string) => {
    setLoading(true);
    try {
      const url = `/api/admin/evaluations?limit=200${level ? `&level=${level}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/evaluations?limit=200");
        const json = await res.json();
        if (active) setData(json);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <ScrollText className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          All Evaluations
        </h1>
      </div>

      {/* Privacy note */}
      <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
        Passwords are stored as bcrypt hashes and cannot be reversed. Only scores and analysis are shown.
      </div>

      {/* Filter buttons */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <Button
          size="sm"
          variant={filter === "" ? "primary" : "secondary"}
          onClick={() => { setFilter(""); fetchEvals(); }}
        >
          All ({data?.stats.total ?? 0})
        </Button>
        {(["Weak", "Medium", "Strong", "Very Strong"] as const).map((lvl) => (
          <Button
            key={lvl}
            size="sm"
            variant={filter === lvl ? "primary" : "secondary"}
            onClick={() => { setFilter(lvl); fetchEvals(lvl); }}
          >
            {lvl} ({data?.stats.byLevel[lvl] ?? 0})
          </Button>
        ))}
      </div>

      {/* Evaluations */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : !data?.evaluations || data.evaluations.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400">No evaluations found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.evaluations.map((eval_) => (
            <Card key={eval_.id} className="p-4">
              <div className="flex flex-col gap-3">
                {/* Top: user + level + date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge color={strengthToColor(eval_.strengthLevel)}>
                      {eval_.strengthLevel}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      by <strong className="text-gray-700 dark:text-gray-300">
                        {eval_.user.name ?? eval_.user.email ?? "Guest"}
                      </strong>
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(eval_.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                    {eval_.score}<span className="text-xs font-normal text-gray-400">/100</span>
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={cn("h-full rounded-full", levelColors[eval_.strengthLevel])}
                      style={{ width: `${eval_.score}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-800/50">
                    <p className="text-gray-400">Rule Score</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                      {eval_.ruleScore ?? "—"}/100
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-900/20">
                    <p className="text-purple-400">AI Score</p>
                    <p className="font-semibold text-purple-700 dark:text-purple-300 tabular-nums">
                      {eval_.mlScore ?? "—"}/100
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-900/20">
                    <p className="text-purple-400 flex items-center gap-1">
                      <Brain className="h-3 w-3" /> AI Prediction
                    </p>
                    <p className="font-semibold text-purple-700 dark:text-purple-300">
                      {eval_.mlClass ?? "—"}
                      {eval_.mlConfidence != null && (
                        <span className="font-normal text-purple-400">
                          {" "}({(eval_.mlConfidence * 100).toFixed(0)}%)
                        </span>
                      )}
                    </p>
                  </div>
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
    </div>
  );
}
