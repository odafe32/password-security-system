"use client";

import { useState, useCallback } from "react";
import { Loader2, Brain, Shield, Zap, Search, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { StrengthMeter } from "@/components/StrengthMeter";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { generatePasswordSuggestions } from "@/lib/password-generator";
import type { HybridEvaluationResult } from "@/lib/password-engine";

export default function HomePage() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<HybridEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const evaluate = useCallback(async () => {
    if (!password) {
      toast("Please enter a password first", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error("Failed to evaluate password");
      }

      const data = await res.json();
      setResult(data);
      toast(`Password evaluated: ${data.level} (${data.score}/100)`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      toast(msg, "error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [password, toast]);

  const handleChange = (value: string) => {
    setPassword(value);
    if (!value) {
      setResult(null);
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      evaluate();
    }
  };

  // ─── Password generator ──────────────────────────────────────────

  const handleGenerate = () => {
    const newSuggestions = generatePasswordSuggestions(3, 16);
    setSuggestions(newSuggestions);
    toast("3 strong passwords generated", "success");
  };

  const handleUseSuggestion = (suggestion: string) => {
    setPassword(suggestion);
    setResult(null);
    setError(null);
    toast("Password loaded — click Evaluate to check it", "info");
  };

  const handleCopy = async (suggestion: string, index: number) => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);
      toast("Password copied to clipboard", "success");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast("Failed to copy", "error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Intelligent Password Security
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          AI-powered password evaluation using rule-based analysis and neural network prediction
        </p>
      </div>

      {/* Feature badges */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <Zap className="h-3.5 w-3.5" />
          Real-time feedback
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
          <Brain className="h-3.5 w-3.5" />
          Neural network powered
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <Sparkles className="h-3.5 w-3.5" />
          Auto-generate strong passwords
        </span>
      </div>

      {/* Input + Submit button */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1" onKeyDown={handleKeyDown}>
            <PasswordInput
              value={password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <Button
            onClick={evaluate}
            disabled={loading || !password}
            size="lg"
            className="flex-shrink-0 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Evaluate
              </>
            )}
          </Button>
        </div>
        {loading && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analyzing password with rule-based engine + neural network...
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Type your password and click Evaluate, or press Enter to analyze.
        </p>
      </div>

      {/* Generate strong password section */}
      <div className="mb-6">
        <Button
          onClick={handleGenerate}
          variant="secondary"
          size="md"
          className="w-full sm:w-auto"
        >
          <Sparkles className="h-4 w-4" />
          Generate Strong Password
        </Button>

        {/* Generated password suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-3 space-y-2 animate-in">
            <p className="text-xs font-medium text-gray-500">
              Suggested strong passwords — click to use, or copy:
            </p>
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <code className="flex-1 truncate font-mono text-sm text-gray-800 dark:text-gray-200">
                  {suggestion}
                </code>
                <button
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  Use
                </button>
                <button
                  onClick={() => handleCopy(suggestion, i)}
                  className="rounded-md bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                >
                  {copiedIndex === i ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RefreshCw className="h-3 w-3" />
              Generate new suggestions
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {result && !loading && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 animate-in">
          {/* Left: Strength meter + feedback */}
          <div className="space-y-4 sm:space-y-6">
            <Card title="Password Strength">
              <StrengthMeter score={result.score} level={result.level} />
            </Card>

            <Card title="Feedback & Suggestions">
              <FeedbackPanel suggestions={result.suggestions} />
            </Card>
          </div>

          {/* Right: Detailed breakdown */}
          <div>
            <Card title="Detailed Analysis">
              <ScoreBreakdown result={result} />
            </Card>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="text-center py-12 sm:py-16">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Shield className="h-10 w-10 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Type a password above and click Evaluate to see its strength
          </p>
          <p className="text-gray-300 text-xs mt-1">
            Or click Generate Strong Password for suggestions
          </p>
        </div>
      )}
    </div>
  );
}
