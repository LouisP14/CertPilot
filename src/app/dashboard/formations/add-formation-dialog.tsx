"use client";

import { Button } from "@/components/ui/button";
import { CodeHelpField } from "@/components/ui/code-help-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FORMACODES,
  NSF_CODES,
  ROME_CODES,
} from "@/lib/passeport-prevention-codes";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AddFormationTypeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [allServicesChecked, setAllServicesChecked] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    services: [] as string[],
    defaultValidityMonths: "",
    isConcernedPP: false,
    isCertifiante: "" as "" | "OUI" | "NON",
    certificationCode: "",
    formacodes: "",
    nsfCodes: "",
    romeCodes: "",
  });

  // Charger les services dynamiquement à l'ouverture
  useEffect(() => {
    if (!open) return;
    fetch("/api/references?type=SERVICE")
      .then((r) => r.json())
      .then((data: { value: string }[]) => {
        const services = data.map((d) => d.value);
        setAvailableServices(services);
        // Par défaut tous cochés
        setAllServicesChecked(true);
        setFormData((prev) => ({ ...prev, services }));
      })
      .catch(() => {});
  }, [open]);

  const toggleService = (service: string) => {
    const newServices = formData.services.includes(service)
      ? formData.services.filter((s) => s !== service)
      : [...formData.services, service];

    setFormData((prev) => ({ ...prev, services: newServices }));

    if (newServices.length === availableServices.length) {
      setAllServicesChecked(true);
    } else {
      setAllServicesChecked(false);
    }
  };

  const toggleAllServices = () => {
    const newValue = !allServicesChecked;
    setAllServicesChecked(newValue);
    setFormData((prev) => ({
      ...prev,
      services: newValue ? [...availableServices] : [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/formation-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          defaultValidityMonths: formData.defaultValidityMonths,
          isConcernedPP: formData.isConcernedPP,
          isCertifiante: formData.isCertifiante || null,
          certificationCode: formData.certificationCode || null,
          formacodes: formData.formacodes || null,
          nsfCodes: formData.nsfCodes || null,
          romeCodes: formData.romeCodes || null,
          service: allServicesChecked
            ? "Tous"
            : formData.services.length === 0
              ? ""
              : formData.services.join(","),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setOpen(false);
      setAllServicesChecked(true);
      setFormData({
        name: "",
        category: "",
        services: [...availableServices],
        defaultValidityMonths: "",
        isConcernedPP: false,
        isCertifiante: "",
        certificationCode: "",
        formacodes: "",
        nsfCodes: "",
        romeCodes: "",
      });
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
        Nouvelle formation
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Nouveau type de formation
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la formation *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Électricien Basse Tension"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie / Code</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="Ex: B0S44-3 BT, R489 CAT 1B, SST..."
            />
          </div>

          <div className="space-y-2">
            <Label>Services concernés</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allServicesChecked}
                  onChange={toggleAllServices}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Tous les services
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2 pl-6">
                {availableServices.map((service) => (
                  <label
                    key={service}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => toggleService(service)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Sélectionnez les services pour lesquels cette formation est
              requise
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultValidityMonths">
              Durée de validité par défaut (mois)
            </Label>
            <Input
              id="defaultValidityMonths"
              type="number"
              min="0"
              value={formData.defaultValidityMonths}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultValidityMonths: e.target.value,
                }))
              }
              placeholder="Ex: 36 (laisser vide si pas d'expiration)"
            />
            <p className="text-xs text-gray-500">
              Laisser vide si la formation n&apos;a pas de date
              d&apos;expiration
            </p>
          </div>

          {/* Passeport Prévention */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="mb-3 flex items-start gap-2">
              <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Passeport Prévention
              </span>
            </div>
            <label className="mb-3 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isConcernedPP}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isConcernedPP: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Formation concernée par le Passeport de Prévention
              </span>
            </label>
            {formData.isConcernedPP && (
              <div className="space-y-3 border-t border-emerald-200 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="isCertifiante">Formation certifiante ?</Label>
                  <select
                    id="isCertifiante"
                    value={formData.isCertifiante}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isCertifiante: e.target.value as "" | "OUI" | "NON",
                      }))
                    }
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Non renseigné --</option>
                    <option value="OUI">Oui (RS/RNCP)</option>
                    <option value="NON">Non</option>
                  </select>
                </div>
                {formData.isCertifiante === "OUI" && (
                  <div className="space-y-2">
                    <Label htmlFor="certificationCode">
                      Code certification (RS/RNCP)
                    </Label>
                    <Input
                      id="certificationCode"
                      maxLength={9}
                      value={formData.certificationCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          certificationCode: e.target.value,
                        }))
                      }
                      placeholder="Ex: RS6550"
                    />
                  </div>
                )}
                {formData.isCertifiante === "NON" && (
                  <>
                    <CodeHelpField
                      id="formacodes"
                      label="Codes Formacode (séparés par /)"
                      value={formData.formacodes}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, formacodes: v }))
                      }
                      codes={FORMACODES}
                      placeholder="Ex: 42829/42817"
                      description="Jusqu'à 5 codes de domaine de formation"
                    />
                    <CodeHelpField
                      id="nsfCodes"
                      label="Codes NSF (séparés par /)"
                      value={formData.nsfCodes}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, nsfCodes: v }))
                      }
                      codes={NSF_CODES}
                      placeholder="Ex: 344r/344p"
                      description="Jusqu'à 3 codes de spécialité de formation"
                    />
                  </>
                )}
                <CodeHelpField
                  id="romeCodes"
                  label="Codes ROME - compétences transférables (séparés par /)"
                  value={formData.romeCodes}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, romeCodes: v }))
                  }
                  codes={ROME_CODES}
                  placeholder="Ex: 115650/121885/400635"
                  description="Jusqu'à 10 codes. Voir les fiches pratiques INRS."
                />
              </div>
            )}
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
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
