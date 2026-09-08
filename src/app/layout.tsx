import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Shield, Home, Settings, History } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { ToastProvider } from "@/components/Toast";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intelligent Password Security System",
  description: "Evaluate password strength with AI-powered analysis, pattern detection, and real-time feedback.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950">
        <ToastProvider>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                Password Security
              </span>
            </Link>

            {/* Right side: nav + auth */}
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Evaluator</span>
              </Link>

              {user && (
                <Link
                  href="/history"
                  className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Auth section */}
              {user ? (
                <div className="ml-1 sm:ml-2 flex items-center gap-2 border-l border-gray-200 pl-2 sm:pl-3 dark:border-gray-700">
                  <span className="hidden md:inline text-sm text-gray-600 dark:text-gray-400 max-w-[120px] truncate">
                    {user.name ?? user.email}
                  </span>
                  <LogoutButton />
                </div>
              ) : (
                <div className="ml-1 sm:ml-2 flex items-center gap-1 sm:gap-2 border-l border-gray-200 pl-2 sm:pl-3 dark:border-gray-700">
                  <Link
                    href="/login"
                    className="rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-blue-600 px-2 sm:px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content — with admin sidebar if user is admin */}
        <main className="flex-1">
          <AppShell isAdmin={user?.role === "admin"}>{children}</AppShell>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-6xl px-4 text-center text-xs sm:text-sm text-gray-500">
            Intelligent Password Security System — Hybrid Rule-Based + Neural Network Evaluation
          </div>
        </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
