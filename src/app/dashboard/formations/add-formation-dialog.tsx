"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          ...formData,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
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

