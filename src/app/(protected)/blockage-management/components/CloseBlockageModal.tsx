"use client";

import React, { useState } from "react";
import Button from "@/components/rocket/components/ui/Button";
import Icon from "@/components/rocket/components/AppIcon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";

interface CloseBlockageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (closureRemarks: string) => void;
  blockageDescription: string;
}

const CloseBlockageModal: React.FC<CloseBlockageModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  blockageDescription,
}) => {
  const { data: session } = useSession() as { data: Session | null };
  const [closureRemarks, setClosureRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleClose = () => {
    setClosureRemarks("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!closureRemarks.trim()) {
      alert("Please provide closure remarks");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(closureRemarks);
      setClosureRemarks("");
      onClose();
    } catch (error) {
      console.error("Error closing blockage:", error);
      toast.error("Failed to close blockage. Make sure you've entered closure remarks and try again. If the problem continues, contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <Icon name="XCircle" size={20} className="text-warning" />
            <span>Close Blockage</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to close this blockage? This action cannot be
            undone, but the blockage will remain in the system for historical
            records.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Blockage Description */}
          <div>
            <label className="text-text-secondary mb-2 block text-sm font-medium">
              Blockage Description
            </label>
            <div className="bg-muted border-border rounded-lg border p-3">
              <p className="text-text-primary text-sm">{blockageDescription}</p>
            </div>
          </div>

          {/* Closure Remarks */}
          <div>
            <label className="text-text-secondary mb-2 block text-sm font-medium">
              Closure Remarks <span className="text-error">*</span>
            </label>
            <textarea
              value={closureRemarks}
              onChange={(e) => setClosureRemarks(e.target.value)}
              placeholder="Enter remarks explaining why this blockage is being closed..."
              rows={4}
              className="border-border focus:ring-primary/20 focus:border-primary w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2"
              required
            />
            <p className="text-text-secondary mt-1 text-xs">
              Provide details about the resolution or reason for closing this
              blockage.
            </p>
          </div>

          {/* Closure Info */}
          <div className="bg-muted border-border rounded-lg border p-3">
            <div className="text-text-secondary space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span>Closure Date:</span>
                <span className="text-text-primary font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Closed By:</span>
                <span className="text-text-primary font-medium">
                  {session?.user?.name ?? "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isSubmitting || !closureRemarks.trim()}
            className="bg-warning hover:bg-warning/90"
          >
            {isSubmitting ? "Closing..." : "Close Blockage"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloseBlockageModal;
