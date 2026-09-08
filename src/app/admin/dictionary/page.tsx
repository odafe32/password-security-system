"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface DictEntry {
  id: number;
  password: string;
  category: string | null;
  createdAt: string;
}

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ password: "", category: "common" });

  const fetchEntries = () => {
    fetch("/api/admin/dictionary?limit=100")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/dictionary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ password: "", category: "common" });
    setShowForm(false);
    fetchEntries();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this password from the dictionary?")) return;
    await fetch(`/api/admin/dictionary/${id}`, { method: "DELETE" });
    fetchEntries();
  };

  const categoryColors: Record<string, "red" | "amber" | "blue"> = {
    common: "red",
    leaked: "amber",
    pattern: "blue",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Weak Password Dictionary
          </h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Add Password
        </Button>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {total} known weak passwords in the database
      </p>

      {/* Add form */}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                placeholder="e.g. password123"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="common">Common</option>
                <option value="leaked">Leaked</option>
                <option value="pattern">Pattern</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add to Dictionary</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Dictionary entries */}
      {loading ? (
        <p className="text-gray-500">Loading dictionary...</p>
      ) : entries.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400">Dictionary is empty. Add weak passwords to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {entry.password}
                  </span>
                  {entry.category && (
                    <Badge color={categoryColors[entry.category] ?? "gray"}>
                      {entry.category}
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="danger" onClick={() => handleDelete(entry.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
