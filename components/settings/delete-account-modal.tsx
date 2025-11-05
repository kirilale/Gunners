"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
}

export function DeleteAccountModal({ onClose, onConfirm, userEmail }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      setError("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">⚠️ Warning: This action cannot be undone</h3>
            <p className="text-red-700 text-sm">
              Deleting your account will permanently remove:
            </p>
            <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
              <li>All your check-ins and match history</li>
              <li>All collected badges and achievements</li>
              <li>Your predictions and leaderboard rankings</li>
              <li>Your profile and personal statistics</li>
            </ul>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Account: <span className="font-semibold">{userEmail}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              To confirm deletion, please type <span className="font-bold">DELETE</span> below:
            </p>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="font-mono"
              disabled={isDeleting}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== "DELETE"}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
