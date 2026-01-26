"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteCertificateButtonProps {
  certificateId: string;
}

export function DeleteCertificateButton({
  certificateId,
}: DeleteCertificateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/certificates/${certificateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'archivage");
      }

      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erreur lors de l'archivage de la formation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-500 hover:text-red-600"
        title="Archiver"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Archiver la formation"
        message="Êtes-vous sûr de vouloir archiver cette formation ?"
        confirmText="Archiver"
        variant="danger"
      />
    </>
  );
}
