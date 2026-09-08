"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Login failed", "error");
        return;
      }

      toast("Login successful!", "success");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin@password-security.local");
    setPassword("admin123");
    toast("Admin credentials filled", "info");
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
          <Shield className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Login</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to save your evaluation history</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Register
          </Link>
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">
          Or{" "}
          <Link href="/" className="font-medium text-gray-600 hover:underline dark:text-gray-400">
            continue as guest
          </Link>
        </div>
      </Card>

      {/* Admin credentials hint */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Admin Demo Credentials
            </p>
            <div className="mt-1 text-xs text-blue-700 dark:text-blue-400">
              <p>Email: <code className="font-mono">admin@password-security.local</code></p>
              <p>Password: <code className="font-mono">admin123</code></p>
            </div>
            <button
              onClick={fillAdminCredentials}
              className="mt-2 text-xs font-medium text-blue-600 underline hover:text-blue-700"
            >
              Click to fill admin credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
