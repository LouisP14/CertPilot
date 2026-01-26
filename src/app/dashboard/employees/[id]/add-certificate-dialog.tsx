"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FileText, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface FormationType {
  id: string;
  name: string;
  category: string | null;
  defaultValidityMonths: number | null;
}

interface AddCertificateDialogProps {
  employeeId: string;
  formationTypes: FormationType[];
}

export function AddCertificateDialog({
  employeeId,
  formationTypes,
}: AddCertificateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    formationTypeId: "",
    obtainedDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    organism: "",
    details: "",
  });

  const handleFormationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const formationTypeId = e.target.value;
    const formationType = formationTypes.find(
      (ft) => ft.id === formationTypeId,
    );

    let expiryDate = "";
    if (formationType?.defaultValidityMonths && formData.obtainedDate) {
      const obtained = new Date(formData.obtainedDate);
      obtained.setMonth(
        obtained.getMonth() + formationType.defaultValidityMonths,
      );
      expiryDate = obtained.toISOString().split("T")[0];
    }

    setFormData((prev) => ({
      ...prev,
      formationTypeId,
      expiryDate,
    }));
  };

  const handleObtainedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const obtainedDate = e.target.value;
    const formationType = formationTypes.find(
      (ft) => ft.id === formData.formationTypeId,
    );

    let expiryDate = formData.expiryDate;
    if (formationType?.defaultValidityMonths && obtainedDate) {
      const obtained = new Date(obtainedDate);
      obtained.setMonth(
        obtained.getMonth() + formationType.defaultValidityMonths,
      );
      expiryDate = obtained.toISOString().split("T")[0];
    }

    setFormData((prev) => ({
      ...prev,
      obtainedDate,
      expiryDate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      const certificate = await response.json();

      // Si un fichier PDF a été sélectionné, l'uploader
      if (pdfFile) {
        const formDataPdf = new FormData();
        formDataPdf.append("file", pdfFile);

        await fetch(`/api/certificates/${certificate.id}/upload`, {
          method: "POST",
          body: formDataPdf,
        });
      }

      setOpen(false);
      setFormData({
        formationTypeId: "",
        obtainedDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        organism: "",
        details: "",
      });
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter une formation
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ajouter une formation</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formationTypeId">Formation *</Label>
            <Select
              id="formationTypeId"
              value={formData.formationTypeId}
              onChange={handleFormationTypeChange}
              required
            >
              <option value="">-- Sélectionner une formation --</option>
              {formationTypes.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  {ft.name} {ft.category ? `(${ft.category})` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="obtainedDate">Date d&apos;obtention *</Label>
              <Input
                id="obtainedDate"
                type="date"
                value={formData.obtainedDate}
                onChange={handleObtainedDateChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Fin de validité</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiryDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organism">Organisme de formation</Label>
            <Input
              id="organism"
              value={formData.organism}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, organism: e.target.value }))
              }
              placeholder="Ex: APAVE, SOCOTEC..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Détails / Commentaires</Label>
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
                  Enregistrement...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
