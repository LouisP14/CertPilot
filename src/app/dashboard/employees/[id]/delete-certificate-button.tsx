"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteCertificateButtonProps {
  certificateId: string;
  isConcernedPP?: boolean;
  ppDeclaredAt?: Date | string | null;
  formationName?: string;
}

export function DeleteCertificateButton({
  certificateId,
  isConcernedPP,
  ppDeclaredAt,
  formationName,
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

  // Construire le message selon le statut PP
  const isDeclared = Boolean(ppDeclaredAt);
  const declaredDate = ppDeclaredAt
    ? new Date(ppDeclaredAt).toLocaleDateString("fr-FR")
    : null;

  let dialogTitle = "Archiver la formation";
  let dialogMessage: React.ReactNode =
    "Êtes-vous sûr de vouloir archiver cette formation ?";

  if (isDeclared) {
    dialogTitle = "Archiver une formation déjà déclarée";
    dialogMessage = (
      <div className="space-y-3">
        <p>
          Vous êtes sur le point d&apos;archiver la formation
          {formationName ? (
            <>
              {" "}
              <strong>{formationName}</strong>
            </>
          ) : null}
          .
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">
              Attention : formation déjà déclarée au Passeport de Prévention
              {declaredDate ? <> le {declaredDate}</> : null}.
            </p>
            <p>
              L&apos;archivage dans CertPilot{" "}
              <strong>n&apos;annule pas</strong> la déclaration sur la
              plateforme officielle{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">
                prevention.moncompteformation.gouv.fr
              </code>
              .
            </p>
            <p>
              Si vous souhaitez corriger/supprimer la déclaration officielle,
              vous devez le faire directement sur{" "}
              <a
                href="https://prevention.moncompteformation.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-amber-950"
              >
                la plateforme de l&apos;État
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  } else if (isConcernedPP) {
    dialogMessage = (
      <div className="space-y-3">
        <p>
          Vous êtes sur le point d&apos;archiver la formation
          {formationName ? (
            <>
              {" "}
              <strong>{formationName}</strong>
            </>
          ) : null}
          .
        </p>
        <p className="text-sm text-gray-600">
          Cette formation est concernée par le Passeport de Prévention mais
          n&apos;a pas encore été déclarée. L&apos;archivage la retire de la
          liste &laquo;&nbsp;à déclarer&nbsp;&raquo;.
        </p>
      </div>
    );
  }

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
        title={dialogTitle}
        message={dialogMessage}
        confirmText="Archiver quand même"
        variant="danger"
      />
    </>
  );
}