"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  Users,
  Shield,
  BookOpen,
  ScrollText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/evaluations", label: "Evaluations", icon: FileSearch },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/rules", label: "Rules", icon: Shield },
  { href: "/admin/dictionary", label: "Dictionary", icon: BookOpen },
  { href: "/admin/logs", label: "Activity Logs", icon: ScrollText },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — hidden on mobile, visible on desktop */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50",
          "w-64 flex-shrink-0",
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
          "transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ top: "4rem" }}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800 lg:hidden">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Admin Panel</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden border-b border-gray-200 px-4 py-3 dark:border-gray-800 lg:block">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs text-gray-400">
              Intelligent Password Security
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
