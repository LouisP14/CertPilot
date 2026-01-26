"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/ui/signature-pad";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CompanyFormProps {
  company: {
    id: string;
    name: string;
    adminEmail: string | null;
  } | null;
}

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: company?.name || "",
    adminEmail: company?.adminEmail || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
        <Input
          id="companyName"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Mon Entreprise"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminEmail">Email administrateur</Label>
        <Input
          id="adminEmail"
          type="email"
          value={formData.adminEmail}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))
          }
          placeholder="admin@entreprise.fr"
        />
        <p className="text-xs text-gray-600">
          Recevra les alertes de fin de validité
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          ✓ Enregistré avec succès
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer"
        )}
      </Button>
    </form>
  );
}

interface AlertFormProps {
  alertThresholds: string;
}

const DEFAULT_THRESHOLDS = [
  { days: 90, label: "90 jours" },
  { days: 60, label: "60 jours" },
  { days: 30, label: "30 jours" },
  { days: 14, label: "14 jours" },
  { days: 7, label: "7 jours" },
];

export function AlertForm({ alertThresholds }: AlertFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Parse current thresholds
  const currentThresholds = alertThresholds.split(",").map(Number);
  const [selectedThresholds, setSelectedThresholds] =
    useState<number[]>(currentThresholds);

  const toggleThreshold = (days: number) => {
    setSelectedThresholds((prev) =>
      prev.includes(days)
        ? prev.filter((d) => d !== days)
        : [...prev, days].sort((a, b) => b - a),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertThresholds: selectedThresholds.join(","),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Seuils d&apos;alerte (jours avant expiration)</Label>
        <div className="space-y-2">
          {DEFAULT_THRESHOLDS.map((threshold) => (
            <label
              key={threshold.days}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedThresholds.includes(threshold.days)}
                onChange={() => toggleThreshold(threshold.days)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{threshold.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Un email sera envoyé à chaque seuil franchi
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          ✓ Enregistré avec succès
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer"
        )}
      </Button>
    </form>
  );
}

// ============================================
// FORMULAIRE SIGNATURE ÉLECTRONIQUE
// ============================================

interface SignatureFormProps {
  initialData?: {
    signatureEnabled: boolean;
    signatureImage: string | null;
    signatureResponsable: string | null;
    signatureTitre: string | null;
  };
}

export function SignatureForm({ initialData }: SignatureFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!initialData);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    signatureEnabled: initialData?.signatureEnabled || false,
    signatureImage: initialData?.signatureImage || "",
    signatureResponsable: initialData?.signatureResponsable || "",
    signatureTitre: initialData?.signatureTitre || "",
  });

  // Charger les données si pas fournies
  useEffect(() => {
    if (!initialData) {
      fetch("/api/settings/signature")
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            signatureEnabled: data.signatureEnabled || false,
            signatureImage: data.signatureImage || "",
            signatureResponsable: data.signatureResponsable || "",
            signatureTitre: data.signatureTitre || "",
          });
        })
        .catch(console.error)
        .finally(() => setLoadingData(false));
    }
  }, [initialData]);

  const handleSignatureSave = (signature: string) => {
    setFormData((prev) => ({ ...prev, signatureImage: signature }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/signature", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Activer/Désactiver */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={formData.signatureEnabled}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                signatureEnabled: e.target.checked,
              }))
            }
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
        </label>
        <span className="text-sm font-medium text-gray-700">
          Afficher la signature sur les passeports
        </span>
      </div>

      {/* Informations du signataire */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signatureResponsable">Nom du responsable *</Label>
          <Input
            id="signatureResponsable"
            value={formData.signatureResponsable}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                signatureResponsable: e.target.value,
              }))
            }
            placeholder="Jean DUPONT"
            required={formData.signatureEnabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signatureTitre">Titre / Fonction</Label>
          <Input
            id="signatureTitre"
            value={formData.signatureTitre}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                signatureTitre: e.target.value,
              }))
            }
            placeholder="Responsable"
          />
        </div>
      </div>

      {/* Signature Pad */}
      <div className="space-y-2">
        <Label>Signature</Label>
        <SignaturePad
          initialSignature={formData.signatureImage}
          onSave={handleSignatureSave}
        />
        {formData.signatureImage && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Signature enregistrée
          </div>
        )}
      </div>

      {/* Aperçu */}
      {formData.signatureEnabled &&
        formData.signatureImage &&
        formData.signatureResponsable && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="mb-3 text-sm font-medium text-gray-700">
              Aperçu sur le passeport :
            </p>
            <div className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm">
              <img
                src={formData.signatureImage}
                alt="Aperçu signature"
                className="h-12 w-auto"
              />
              <div className="mt-1 border-t border-gray-200 pt-1 text-center">
                <p className="text-sm font-semibold text-gray-800">
                  {formData.signatureResponsable}
                </p>
                {formData.signatureTitre && (
                  <p className="text-xs text-gray-500">
                    {formData.signatureTitre}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          ✓ Signature enregistrée avec succès
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer la signature"
        )}
      </Button>
    </form>
  );
}

// ============================================
// FORMULAIRE CONTRAINTES DE PLANIFICATION
// ============================================

interface PlanningConstraintsFormProps {
  initialData?: {
    monthlyBudget: number | null;
    quarterlyBudget: number | null;
    yearlyBudget: number | null;
    maxAbsentPerTeam: number;
    maxAbsentPerSite: number;
    maxAbsentPercent: number;
    blacklistedDates: string;
    allowedTrainingDays: number;
    preferGroupSessions: boolean;
    preferIntraCompany: boolean;
    minDaysBeforeExpiry: number;
  };
}

const DAYS_OF_WEEK = [
  { bit: 1, label: "Lun", fullLabel: "Lundi" },
  { bit: 2, label: "Mar", fullLabel: "Mardi" },
  { bit: 4, label: "Mer", fullLabel: "Mercredi" },
  { bit: 8, label: "Jeu", fullLabel: "Jeudi" },
  { bit: 16, label: "Ven", fullLabel: "Vendredi" },
  { bit: 32, label: "Sam", fullLabel: "Samedi" },
  { bit: 64, label: "Dim", fullLabel: "Dimanche" },
];

export function PlanningConstraintsForm({
  initialData,
}: PlanningConstraintsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!initialData);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [newBlacklistDate, setNewBlacklistDate] = useState("");

  const [formData, setFormData] = useState({
    monthlyBudget: initialData?.monthlyBudget?.toString() || "",
    quarterlyBudget: initialData?.quarterlyBudget?.toString() || "",
    yearlyBudget: initialData?.yearlyBudget?.toString() || "",
    maxAbsentPerTeam: initialData?.maxAbsentPerTeam?.toString() || "2",
    maxAbsentPerSite: initialData?.maxAbsentPerSite?.toString() || "5",
    maxAbsentPercent: initialData?.maxAbsentPercent?.toString() || "20",
    blacklistedDates: initialData?.blacklistedDates || "[]",
    allowedTrainingDays: initialData?.allowedTrainingDays ?? 31,
    preferGroupSessions: initialData?.preferGroupSessions ?? true,
    preferIntraCompany: initialData?.preferIntraCompany ?? true,
    minDaysBeforeExpiry: initialData?.minDaysBeforeExpiry?.toString() || "30",
  });

  // Charger les données si pas fournies
  useEffect(() => {
    if (!initialData) {
      fetch("/api/settings/planning")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setFormData({
              monthlyBudget: data.monthlyBudget?.toString() || "",
              quarterlyBudget: data.quarterlyBudget?.toString() || "",
              yearlyBudget: data.yearlyBudget?.toString() || "",
              maxAbsentPerTeam: data.maxAbsentPerTeam?.toString() || "2",
              maxAbsentPerSite: data.maxAbsentPerSite?.toString() || "5",
              maxAbsentPercent: data.maxAbsentPercent?.toString() || "20",
              blacklistedDates: data.blacklistedDates || "[]",
              allowedTrainingDays: data.allowedTrainingDays ?? 31,
              preferGroupSessions: data.preferGroupSessions ?? true,
              preferIntraCompany: data.preferIntraCompany ?? true,
              minDaysBeforeExpiry: data.minDaysBeforeExpiry?.toString() || "30",
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoadingData(false));
    }
  }, [initialData]);

  const blacklistedDatesArray: string[] = JSON.parse(
    formData.blacklistedDates || "[]",
  );

  const addBlacklistDate = () => {
    if (!newBlacklistDate) return;
    const dates = [...blacklistedDatesArray, newBlacklistDate].sort();
    setFormData((prev) => ({
      ...prev,
      blacklistedDates: JSON.stringify(dates),
    }));
    setNewBlacklistDate("");
  };

  const removeBlacklistDate = (date: string) => {
    const dates = blacklistedDatesArray.filter((d) => d !== date);
    setFormData((prev) => ({
      ...prev,
      blacklistedDates: JSON.stringify(dates),
    }));
  };

  const toggleDay = (bit: number) => {
    const newValue = formData.allowedTrainingDays ^ bit;
    setFormData((prev) => ({ ...prev, allowedTrainingDays: newValue }));
  };

  const isDayAllowed = (bit: number) =>
    (formData.allowedTrainingDays & bit) !== 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/planning", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Budget */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">💰 Budget formation</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyBudget">Budget mensuel (€)</Label>
            <Input
              id="monthlyBudget"
              type="number"
              min="0"
              step="100"
              value={formData.monthlyBudget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  monthlyBudget: e.target.value,
                }))
              }
              placeholder="Ex: 5000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quarterlyBudget">Budget trimestriel (€)</Label>
            <Input
              id="quarterlyBudget"
              type="number"
              min="0"
              step="100"
              value={formData.quarterlyBudget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quarterlyBudget: e.target.value,
                }))
              }
              placeholder="Ex: 15000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearlyBudget">Budget annuel (€)</Label>
            <Input
              id="yearlyBudget"
              type="number"
              min="0"
              step="1000"
              value={formData.yearlyBudget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  yearlyBudget: e.target.value,
                }))
              }
              placeholder="Ex: 50000"
            />
          </div>
        </div>
      </div>

      {/* Contraintes d'absence */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">
          👥 Contraintes d&apos;absence
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="maxAbsentPerTeam">
              Max absents / équipe / jour
            </Label>
            <Input
              id="maxAbsentPerTeam"
              type="number"
              min="1"
              max="50"
              value={formData.maxAbsentPerTeam}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxAbsentPerTeam: e.target.value,
                }))
              }
            />
            <p className="text-xs text-gray-500">
              Ex: pas plus de 2 absents en équipe 3x8
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAbsentPerSite">Max absents / site / jour</Label>
            <Input
              id="maxAbsentPerSite"
              type="number"
              min="1"
              max="100"
              value={formData.maxAbsentPerSite}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxAbsentPerSite: e.target.value,
                }))
              }
            />
            <p className="text-xs text-gray-500">
              Ex: pas plus de 5 absents à Brécey
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAbsentPercent">% max d&apos;absents</Label>
            <Input
              id="maxAbsentPercent"
              type="number"
              min="1"
              max="100"
              value={formData.maxAbsentPercent}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxAbsentPercent: e.target.value,
                }))
              }
            />
            <p className="text-xs text-gray-500">
              Limite globale en pourcentage
            </p>
          </div>
        </div>
      </div>

      {/* Jours autorisés */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">
          📅 Jours de formation autorisés
        </h4>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.bit}
              type="button"
              onClick={() => toggleDay(day.bit)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isDayAllowed(day.bit)
                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                  : "bg-gray-100 text-gray-500 border-2 border-transparent"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Sélectionnez les jours où les formations peuvent être planifiées
        </p>
      </div>

      {/* Dates blacklistées */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">🚫 Dates bloquées</h4>
        <p className="text-sm text-gray-500">
          Jours où aucune formation ne peut avoir lieu (inventaires, fêtes,
          clôtures...)
        </p>
        <div className="flex gap-2">
          <Input
            type="date"
            value={newBlacklistDate}
            onChange={(e) => setNewBlacklistDate(e.target.value)}
            className="max-w-xs"
          />
          <Button type="button" variant="outline" onClick={addBlacklistDate}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </div>
        {blacklistedDatesArray.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blacklistedDatesArray.map((date) => (
              <span
                key={date}
                className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
              >
                {new Date(date).toLocaleDateString("fr-FR")}
                <button
                  type="button"
                  onClick={() => removeBlacklistDate(date)}
                  className="ml-1 rounded-full p-0.5 hover:bg-red-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Préférences */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">
          ⚙️ Préférences de planification
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.preferGroupSessions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preferGroupSessions: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Privilégier les sessions groupées
              </span>
              <p className="text-xs text-gray-500">
                Regrouper les employés pour optimiser les coûts
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.preferIntraCompany}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preferIntraCompany: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Privilégier les formations intra
              </span>
              <p className="text-xs text-gray-500">
                Faire venir le formateur quand c&apos;est plus économique
              </p>
            </div>
          </label>
        </div>
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="minDaysBeforeExpiry">
            Délai minimum avant expiration (jours)
          </Label>
          <Input
            id="minDaysBeforeExpiry"
            type="number"
            min="7"
            max="180"
            value={formData.minDaysBeforeExpiry}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                minDaysBeforeExpiry: e.target.value,
              }))
            }
          />
          <p className="text-xs text-gray-500">
            Ne pas planifier trop proche de l&apos;expiration
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          ✓ Contraintes enregistrées avec succès
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer les contraintes"
        )}
      </Button>
    </form>
  );
}
