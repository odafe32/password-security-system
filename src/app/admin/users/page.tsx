"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Ban, CheckCircle2, Shield, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/Toast";

interface UserEntry {
  id: number;
  email: string | null;
  name: string | null;
  role: string;
  suspended: boolean;
  createdAt: string;
  _count: { evaluations: number; logs: number };
}

interface UsersData {
  users: UserEntry[];
  stats: { total: number; active: number; suspended: number; admins: number };
}

export default function UsersPage() {
  const { toast } = useToast();
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserEntry | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (active) setData(json);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  const handleToggleSuspend = async (user: UserEntry) => {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: !user.suspended }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to update user", "error");
        return;
      }
      toast(`${user.email ?? "User"} ${user.suspended ? "unsuspended" : "suspended"}`, "success");
      fetchUsers();
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (user: UserEntry) => {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role === "admin" ? "user" : "admin" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to update role", "error");
        return;
      }
      toast(`${user.email ?? "User"} is now ${user.role === "admin" ? "a regular user" : "an admin"}`, "success");
      fetchUsers();
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to delete user", "error");
        return;
      }
      toast(`${deleteTarget.email ?? "User"} deleted`, "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{data?.stats.total ?? 0}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Active</p>
          <p className="text-lg sm:text-xl font-bold text-green-600">{data?.stats.active ?? 0}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Suspended</p>
          <p className="text-lg sm:text-xl font-bold text-amber-600">{data?.stats.suspended ?? 0}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Admins</p>
          <p className="text-lg sm:text-xl font-bold text-purple-600">{data?.stats.admins ?? 0}</p>
        </Card>
      </div>

      {/* Users list */}
      {data?.users && data.users.length > 0 ? (
        <div className="space-y-2">
          {data.users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    {user.role === "admin" ? (
                      <Shield className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Users className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {user.name ?? "Unknown"}
                      </span>
                      {user.role === "admin" && <Badge color="purple">Admin</Badge>}
                      {user.suspended && <Badge color="red">Suspended</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email ?? "Guest session"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user._count.evaluations} evaluations · {user._count.logs} logs · {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {actionLoading === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleRole(user)}
                      >
                        {user.role === "admin" ? "Demote" : "Promote"}
                      </Button>
                      <Button
                        size="sm"
                        variant={user.suspended ? "secondary" : "secondary"}
                        onClick={() => handleToggleSuspend(user)}
                      >
                        {user.suspended ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Unsuspend</>
                        ) : (
                          <><Ban className="h-3.5 w-3.5" /> Suspend</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-gray-400">No users found</p>
        </Card>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-50 p-2 dark:bg-red-900/20">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {deleteTarget?.name ?? deleteTarget?.email ?? "this user"}
              </strong>?
              This will also delete all their evaluations and logs. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              disabled={actionLoading === deleteTarget?.id}
              variant="danger"
              className="flex-1"
            >
              {actionLoading === deleteTarget?.id ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
              ) : (
                "Yes, delete user"
              )}
            </Button>
            <Button onClick={() => setDeleteTarget(null)} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
