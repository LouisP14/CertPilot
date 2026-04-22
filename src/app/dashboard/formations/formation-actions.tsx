"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormationType {
  id: string;
  name: string;
  category: string | null;
  service: string | null;
  defaultValidityMonths: number | null;
  certificateCount: number;
  isConcernedPP?: boolean;
  isCertifiante?: boolean | null;
  certificationCode?: string | null;
  formacodes?: string | null;
  nsfCodes?: string | null;
  romeCodes?: string | null;
}

export function FormationActions({ formation }: { formation: FormationType }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Convertir le service stocké en tableau
  const isAllServices =
    !formation.service ||
    formation.service.toLowerCase() === "tous" ||
    formation.service === "";

  const savedServices = isAllServices
    ? []
    : formation
        .service!.split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const [allServicesChecked, setAllServicesChecked] = useState(isAllServices);
  const [formData, setFormData] = useState({
    name: formation.name,
    category: formation.category || "",
    services: savedServices,
    defaultValidityMonths: formation.defaultValidityMonths?.toString() || "",
    isConcernedPP: formation.isConcernedPP ?? false,
    isCertifiante:
      formation.isCertifiante === true
        ? ("OUI" as const)
        : formation.isCertifiante === false
          ? ("NON" as const)
          : ("" as ""),
    certificationCode: formation.certificationCode || "",
    formacodes: formation.formacodes || "",
    nsfCodes: formation.nsfCodes || "",
    romeCodes: formation.romeCodes || "",
  });

  // Charger les services dynamiquement à l'ouverture du modal
  useEffect(() => {
    if (!editOpen) return;
    fetch("/api/references?type=SERVICE")
      .then((r) => r.json())
      .then((data: { value: string }[]) => {
        const services = data.map((d) => d.value);
        setAvailableServices(services);
        // Si "Tous", initialiser avec la liste dynamique
        if (isAllServices) {
          setFormData((prev) => ({ ...prev, services }));
        }
      })
      .catch(() => {});
  }, [editOpen, isAllServices]);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/formation-types/${formation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          service: allServicesChecked
            ? "Tous"
            : formData.services.length === 0
              ? ""
              : formData.services.join(","),
          defaultValidityMonths: formData.defaultValidityMonths,
          isConcernedPP: formData.isConcernedPP,
          isCertifiante: formData.isCertifiante || null,
          certificationCode: formData.certificationCode || null,
          formacodes: formData.formacodes || null,
          nsfCodes: formData.nsfCodes || null,
          romeCodes: formData.romeCodes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setEditOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/formation-types/${formation.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          title="Modifier"
          onClick={() => setEditOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600"
          title="Supprimer"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Modal Édition */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Modifier la formation
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom de la formation *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Catégorie / Code</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-validity">
                  Durée de validité par défaut (mois)
                </Label>
                <Input
                  id="edit-validity"
                  type="number"
                  min="0"
                  value={formData.defaultValidityMonths}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultValidityMonths: e.target.value,
                    }))
                  }
                />
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
                      <Label htmlFor="edit-isCertifiante">
                        Formation certifiante ?
                      </Label>
                      <select
                        id="edit-isCertifiante"
                        value={formData.isCertifiante}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isCertifiante: e.target.value as
                              | ""
                              | "OUI"
                              | "NON",
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
                        <Label htmlFor="edit-certCode">
                          Code certification (RS/RNCP)
                        </Label>
                        <Input
                          id="edit-certCode"
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
                        <div className="space-y-2">
                          <Label htmlFor="edit-formacodes">
                            Codes Formacode (séparés par /)
                          </Label>
                          <Input
                            id="edit-formacodes"
                            value={formData.formacodes}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                formacodes: e.target.value,
                              }))
                            }
                            placeholder="Ex: 42829/42817"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-nsfCodes">
                            Codes NSF (séparés par /)
                          </Label>
                          <Input
                            id="edit-nsfCodes"
                            value={formData.nsfCodes}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                nsfCodes: e.target.value,
                              }))
                            }
                            placeholder="Ex: 344r/344p"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="edit-romeCodes">
                        Codes ROME - compétences transférables (séparés par /)
                      </Label>
                      <Input
                        id="edit-romeCodes"
                        value={formData.romeCodes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            romeCodes: e.target.value,
                          }))
                        }
                        placeholder="Ex: 115650/121885/400635"
                      />
                      <p className="text-xs text-gray-500">
                        Jusqu&apos;à 10 codes. Voir les fiches pratiques INRS.
                      </p>
                    </div>
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
                  onClick={() => setEditOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Confirmer la suppression
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="mb-4 text-gray-600">
              Êtes-vous sûr de vouloir supprimer la formation{" "}
              <strong>{formation.name}</strong> ? Cette action est irréversible.
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
