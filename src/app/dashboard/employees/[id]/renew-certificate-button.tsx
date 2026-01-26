"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface RenewCertificateButtonProps {
  certificate: {
    id: string;
    formationType: {
      id: string;
      name: string;
      defaultValidityMonths: number | null;
    };
    details: string | null;
  };
  employeeId: string;
}

export function RenewCertificateButton({
  certificate,
  employeeId,
}: RenewCertificateButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculer la date d'expiration par défaut
  const today = new Date().toISOString().split("T")[0];
  const defaultExpiryDate = certificate.formationType.defaultValidityMonths
    ? new Date(
        new Date().setMonth(
          new Date().getMonth() +
            certificate.formationType.defaultValidityMonths,
        ),
      )
        .toISOString()
        .split("T")[0]
    : "";

  const [formData, setFormData] = useState({
    obtainedDate: today,
    expiryDate: defaultExpiryDate,
    organism: "",
    details: certificate.details || "",
  });

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Archiver l'ancien certificat
      const archiveResponse = await fetch(
        `/api/certificates/${certificate.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archive: true }),
        },
      );

      if (!archiveResponse.ok) {
        throw new Error("Erreur lors de l'archivage de l'ancien certificat");
      }

      // 2. Créer le nouveau certificat
      const createResponse = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          formationTypeId: certificate.formationType.id,
          obtainedDate: formData.obtainedDate,
          expiryDate: formData.expiryDate || null,
          organism: formData.organism || null,
          details: formData.details || null,
        }),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(
          data.error || "Erreur lors de la création du certificat",
        );
      }

      const newCertificate = await createResponse.json();

      // 3. Uploader le PDF si présent
      if (pdfFile && newCertificate.id) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", pdfFile);

        const uploadResponse = await fetch(
          `/api/certificates/${newCertificate.id}/upload`,
          {
            method: "POST",
            body: formDataUpload,
          },
        );

        if (!uploadResponse.ok) {
          console.warn(
            "Erreur lors de l'upload du PDF, mais le certificat a été créé",
          );
        }
      }

      setOpen(false);
      setPdfFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Renouveler cette formation"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Renouveler la formation
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{certificate.formationType.name}</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            L&apos;ancienne formation sera archivée et une nouvelle entrée sera
            créée.
          </p>
        </div>

        <form onSubmit={handleRenew} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obtainedDate">Nouvelle date de formation *</Label>
            <Input
              id="obtainedDate"
              type="date"
              value={formData.obtainedDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  obtainedDate: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Nouvelle fin de validité</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
              }
            />
            {certificate.formationType.defaultValidityMonths && (
              <p className="text-xs text-gray-500">
                Durée par défaut :{" "}
                {certificate.formationType.defaultValidityMonths} mois
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organism">Organisme de formation</Label>
            <Input
              id="organism"
              value={formData.organism}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, organism: e.target.value }))
              }
              placeholder="Ex: AFPA, GRETA..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Détails / Mentions</Label>
            <Input
              id="details"
              value={formData.details}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, details: e.target.value }))
              }
              placeholder="Ex: HOV B2V BR BC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfFile">Document PDF (certificat)</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                id="pdfFile"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== "application/pdf") {
                      setError("Seuls les fichiers PDF sont acceptés");
                      e.target.value = "";
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      setError("Le fichier ne doit pas dépasser 10 Mo");
                      e.target.value = "";
                      return;
                    }
                    setPdfFile(file);
                    setError("");
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
              {pdfFile && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">Optionnel - Max 10 Mo</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renouvellement...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Renouveler
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
