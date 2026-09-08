"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";

interface AppShellProps {
  isAdmin: boolean;
  children: React.ReactNode;
}

/**
 * Wraps the app content. If the user is an admin, shows the admin sidebar
 * on all pages. Otherwise just renders the content.
 */
export function AppShell({ isAdmin, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        {/* Mobile toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden sticky top-0 z-30 flex w-full items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 border-b border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
        >
          <Menu className="h-4 w-4" />
          Admin Menu
        </button>

        {/* Page content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
