"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Rule {
  id: number;
  name: string;
  description: string | null;
  weight: number;
  active: boolean;
  createdAt: string;
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", weight: 10, active: true });

  const fetchRules = () => {
    fetch("/api/admin/rules")
      .then((r) => r.json())
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "", weight: 10, active: true });
    setShowForm(false);
    fetchRules();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this rule?")) return;
    await fetch(`/api/admin/rules/${id}`, { method: "DELETE" });
    fetchRules();
  };

  const handleToggle = async (rule: Rule) => {
    await fetch(`/api/admin/rules/${rule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !rule.active }),
    });
    fetchRules();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Password Rules</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Rule Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                placeholder="e.g. min_length"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                placeholder="What this rule checks"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (0–100)</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) })}
                min={0}
                max={100}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Rule</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rules table */}
      {loading ? (
        <p className="text-gray-500">Loading rules...</p>
      ) : rules.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400">No rules yet. Add one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <Card key={rule.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                      {rule.name}
                    </span>
                    <Badge color={rule.active ? "green" : "gray"}>
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge color="blue">Weight: {rule.weight}</Badge>
                  </div>
                  {rule.description && (
                    <p className="mt-1 text-sm text-gray-500">{rule.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleToggle(rule)}>
                    {rule.active ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
