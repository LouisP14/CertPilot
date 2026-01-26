"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExternalLink, FileText, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface CertificatePdfUploadProps {
  certificateId: string;
  attachmentUrl: string | null;
}

export function CertificatePdfUpload({
  certificateId,
  attachmentUrl,
}: CertificatePdfUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés");
      return;
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 10 Mo");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/certificates/${certificateId}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const response = await fetch(
        `/api/certificates/${certificateId}/upload`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (attachmentUrl) {
    return (
      <>
        <div className="flex items-center gap-1">
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            title="Voir le PDF"
          >
            <FileText className="h-4 w-4" />
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:text-red-600"
            onClick={() => setShowConfirm(true)}
            title="Supprimer le PDF"
          >
            <X className="h-3 w-3" />
          </Button>
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
        <ConfirmDialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleRemove}
          title="Supprimer le document"
          message="Êtes-vous sûr de vouloir supprimer ce document PDF ?"
          confirmText="Supprimer"
          variant="danger"
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        className="hidden"
        id={`pdf-upload-${certificateId}`}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-gray-400 hover:text-blue-600"
        onClick={() => fileInputRef.current?.click()}
        title="Ajouter un PDF"
      >
        <Upload className="h-4 w-4" />
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
