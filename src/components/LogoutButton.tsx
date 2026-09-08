"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";

export function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Logged out successfully", "success");
    setShowModal(false);
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Logout"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-50 p-2 dark:bg-amber-900/20">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to log out? You can still use the evaluator as a guest,
              but your evaluation history will only be available when logged in.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleLogout}
              disabled={loading}
              variant="danger"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Yes, log out"
              )}
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
