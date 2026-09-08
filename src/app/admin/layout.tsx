// Admin layout — sidebar is now handled globally by AppShell in root layout.
// This file just passes children through.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
