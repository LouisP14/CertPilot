"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Percent,
  Star,
  TrendingDown,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  site: string | null;
  team: string | null;
  hourlyCost: number | null;
}

interface FormationType {
  id: string;
  name: string;
  category: string | null;
  durationHours: number;
  durationDays: number;
}

interface TrainingNeed {
  id: string;
  employee: Employee;
  priority: number;
}

interface CenterComparison {
  center: {
    id: string;
    name: string;
    city: string;
    isPartner: boolean;
    discountPercent: number | null;
  };
  offering: {
    id: string;
    pricePerPerson: number;
    pricePerSession: number | null;
    minParticipants: number | null;
    maxParticipants: number | null;
    durationDays: number | null;
  };
  inter: {
    available: boolean;
    costPerPerson: number;
    trainingCost: number;
    totalCost: number;
  };
  intra: {
    available: boolean;
    costPerPerson: number | null;
    trainingCost: number | null;
    totalCost: number | null;
  };
  recommendation: "INTER" | "INTRA" | null;
  savings: number;
  breakEvenPoint: number | null;
}

interface ComparisonResult {
  formationType: FormationType;
  employees: {
    count: number;
    details: Array<{
      employeeId: string;
      employeeName: string;
      hourlyCost: number;
      hours: number;
      absenceCost: number;
    }>;
    totalAbsenceCost: number;
  };
  centers: CenterComparison[];
  bestOption: CenterComparison | null;
  summary: {
    centerId: string;
    centerName: string;
    mode: "INTER" | "INTRA";
    trainingCost: number;
    absenceCost: number;
    totalCost: number;
    savings: number;
  } | null;
}

interface PlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  formationType: {
    id: string;
    name: string;
    category: string | null;
    durationDays: number;
  };
  needs: TrainingNeed[];
  onSessionCreated?: () => void;
}

export default function PlanningModal({
  isOpen,
  onClose,
  formationType,
  needs,
  onSessionCreated,
}: PlanningModalProps) {
  const [step, setStep] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<CenterComparison | null>(
    null,
  );
  const [selectedMode, setSelectedMode] = useState<"INTER" | "INTRA">("INTER");
  const [sessionDate, setSessionDate] = useState("");
  const [expandedCenter, setExpandedCenter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [constraintWarnings, setConstraintWarnings] = useState<
    Array<{
      type: "team" | "site" | "percent" | "blockedDate" | "dayNotAllowed";
      severity: "warning" | "danger";
      message: string;
    }>
  >([]);
  const [checkingConstraints, setCheckingConstraints] = useState(false);

  // Vérifier les contraintes quand la date change
  useEffect(() => {
    const checkConstraints = async () => {
      if (!sessionDate || selectedEmployees.length === 0) {
        setConstraintWarnings([]);
        return;
      }

      setCheckingConstraints(true);
      try {
        const response = await fetch("/api/sessions/check-constraints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: sessionDate,
            employeeIds: selectedEmployees,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setConstraintWarnings(data.warnings || []);
        }
      } catch (err) {
        console.error("Erreur vérification contraintes:", err);
      } finally {
        setCheckingConstraints(false);
      }
    };

    checkConstraints();
  }, [sessionDate, selectedEmployees]);

  // Sélectionner tous les employés par défaut
  useEffect(() => {
    if (isOpen) {
      setSelectedEmployees(needs.map((n) => n.employee.id));
      setStep(1);
      setComparison(null);
      setSelectedCenter(null);
      setError(null);
      setSessionDate("");
      setConstraintWarnings([]);
    }
  }, [isOpen, needs]);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
    );
  };

  const selectAll = () => {
    setSelectedEmployees(needs.map((n) => n.employee.id));
  };

  const deselectAll = () => {
    setSelectedEmployees([]);
  };

  const calculateCosts = async () => {
    if (selectedEmployees.length === 0) {
      setError("Veuillez sélectionner au moins un employé");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions/compare-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formationTypeId: formationType.id,
          employeeIds: selectedEmployees,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data);

        // Sélectionner automatiquement le meilleur centre
        if (data.bestOption) {
          setSelectedCenter(data.bestOption);
          setSelectedMode(data.bestOption.recommendation || "INTER");
        }

        setStep(2);
      } else {
        const err = await response.json();
        setError(err.error || "Erreur lors du calcul");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!selectedCenter || !sessionDate) {
      setError("Veuillez sélectionner un centre et une date");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const trainingCost =
        selectedMode === "INTRA"
          ? selectedCenter.intra.trainingCost
          : selectedCenter.inter.trainingCost;

      const costPerPerson =
        selectedMode === "INTRA"
          ? selectedCenter.intra.costPerPerson
          : selectedCenter.inter.costPerPerson;

      const totalCost =
        selectedMode === "INTRA"
          ? selectedCenter.intra.totalCost
          : selectedCenter.inter.totalCost;

      // Récupérer les IDs des besoins de formation sélectionnés
      const trainingNeedIds = needs
        .filter((n) => selectedEmployees.includes(n.employee.id))
        .map((n) => n.id);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formationTypeId: formationType.id,
          trainingCenterId: selectedCenter.center.id,
          isIntraCompany: selectedMode === "INTRA",
          startDate: sessionDate,
          endDate: sessionDate, // Pour simplifier, même date
          trainingCost,
          costPerPerson,
          totalAbsenceCost: comparison?.employees.totalAbsenceCost,
          totalCost,
          status: "PLANNED",
          employeeIds: selectedEmployees,
          trainingNeedIds,
        }),
      });

      if (response.ok) {
        onSessionCreated?.();
        onClose();
      } else {
        const err = await response.json();
        setError(err.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white p-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Planifier une session
            </h2>
            <p className="text-sm text-gray-500">{formationType.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${step >= 1 ? "text-emerald-600" : "text-gray-400"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-200"}`}
              >
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="font-medium">Sélection</span>
            </div>
            <div className="flex-1 border-t-2 border-gray-200" />
            <div
              className={`flex items-center gap-2 ${step >= 2 ? "text-emerald-600" : "text-gray-400"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-200"}`}
              >
                {step > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="font-medium">Comparatif</span>
            </div>
            <div className="flex-1 border-t-2 border-gray-200" />
            <div
              className={`flex items-center gap-2 ${step >= 3 ? "text-emerald-600" : "text-gray-400"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? "bg-emerald-600 text-white" : "bg-gray-200"}`}
              >
                3
              </div>
              <span className="font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Sélection des employés */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Sélectionnez les employés à inclure dans cette session
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Tout sélectionner
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Tout désélectionner
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-auto rounded-lg border">
                {needs.map((need) => (
                  <label
                    key={need.id}
                    className={`flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0 hover:bg-gray-50 ${
                      selectedEmployees.includes(need.employee.id)
                        ? "bg-emerald-50"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(need.employee.id)}
                      onChange={() => toggleEmployee(need.employee.id)}
                      className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-medium text-gray-700">
                      {need.employee.firstName[0]}
                      {need.employee.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {need.employee.firstName} {need.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {need.employee.site || "Site non défini"} •{" "}
                        {need.employee.team || "Équipe non définie"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      {need.employee.hourlyCost != null &&
                        need.employee.hourlyCost > 0 && (
                          <p className="font-medium text-gray-700">
                            {need.employee.hourlyCost} €/h
                          </p>
                        )}
                      <Badge
                        className={`text-xs ${
                          need.priority >= 9
                            ? "bg-red-100 text-red-700"
                            : need.priority >= 7
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Priorité {need.priority}
                      </Badge>
                    </div>
                  </label>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <strong>{selectedEmployees.length}</strong> employé(s)
                sélectionné(s)
                {formationType.durationDays > 1 && (
                  <>
                    {" "}
                    • Durée formation:{" "}
                    <strong>{formationType.durationDays} jour(s)</strong>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Comparatif des coûts */}
          {step === 2 && comparison && (
            <div className="space-y-6">
              {/* Résumé */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Participants</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {comparison.employees.count}
                  </p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">
                      Coût d&apos;absence total
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {comparison.employees.totalAbsenceCost.toLocaleString(
                      "fr-FR",
                    )}{" "}
                    €
                  </p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">Centres disponibles</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {comparison.centers.length}
                  </p>
                </div>
              </div>

              {/* Meilleure option */}
              {comparison.summary && (
                <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Star className="h-5 w-5 fill-emerald-500" />
                    <span className="font-semibold">
                      Meilleure option recommandée
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {comparison.summary.centerName}
                      </p>
                      <Badge
                        className={
                          comparison.summary.mode === "INTRA"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {comparison.summary.mode === "INTRA"
                          ? "INTRA (formateur se déplace)"
                          : "INTER (employés se déplacent)"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Coût total</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {comparison.summary.totalCost?.toLocaleString("fr-FR")}{" "}
                        €
                      </p>
                      {comparison.summary.savings > 0 && (
                        <p className="flex items-center justify-end gap-1 text-sm text-emerald-600">
                          <TrendingDown className="h-4 w-4" />
                          Économie de{" "}
                          {comparison.summary.savings.toLocaleString("fr-FR")} €
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des centres */}
              {comparison.centers.length === 0 ? (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-orange-500" />
                  <p className="mt-2 font-medium text-orange-700">
                    Aucun centre ne propose cette formation
                  </p>
                  <p className="text-sm text-orange-600">
                    Ajoutez des offres de formation aux centres existants
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Comparatif des centres
                  </h3>
                  {comparison.centers.map((centerComp, index) => (
                    <div
                      key={centerComp.center.id}
                      className={`rounded-lg border-2 transition-all ${
                        selectedCenter?.center.id === centerComp.center.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* En-tête du centre */}
                      <div
                        className="flex cursor-pointer items-center justify-between p-4"
                        onClick={() =>
                          setExpandedCenter(
                            expandedCenter === centerComp.center.id
                              ? null
                              : centerComp.center.id,
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          {index === 0 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Star className="h-4 w-4 fill-white" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {centerComp.center.name}
                              </p>
                              {centerComp.center.isPartner && (
                                <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                  Partenaire
                                </Badge>
                              )}
                              {centerComp.center.discountPercent && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  <Percent className="mr-1 h-3 w-3" />-
                                  {centerComp.center.discountPercent}%
                                </Badge>
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {centerComp.center.city}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Prix INTER */}
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">
                              INTER
                            </p>
                            <p className="font-semibold text-gray-900">
                              {centerComp.inter.totalCost.toLocaleString(
                                "fr-FR",
                              )}{" "}
                              €
                            </p>
                          </div>

                          {/* Prix INTRA */}
                          {centerComp.intra.available ? (
                            <div className="text-center">
                              <p className="text-xs font-medium text-gray-600">
                                INTRA
                              </p>
                              <p className="font-semibold text-gray-900">
                                {centerComp.intra.totalCost?.toLocaleString(
                                  "fr-FR",
                                )}{" "}
                                €
                              </p>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500">
                              <p className="text-xs font-medium">INTRA</p>
                              <p className="text-sm">N/D</p>
                            </div>
                          )}

                          {/* Max participants */}
                          {centerComp.offering.maxParticipants && (
                            <div
                              className={`text-center px-2 py-1 rounded text-xs font-medium ${
                                selectedEmployees.length >
                                centerComp.offering.maxParticipants
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Users className="h-3 w-3 inline mr-1" />
                              {selectedEmployees.length}/
                              {centerComp.offering.maxParticipants} max
                            </div>
                          )}

                          {/* Recommandation */}
                          <Badge
                            className={
                              centerComp.recommendation === "INTRA"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {centerComp.recommendation}
                          </Badge>

                          {expandedCenter === centerComp.center.id ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Détails expandés */}
                      {expandedCenter === centerComp.center.id && (
                        <div className="border-t bg-white p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            {/* Alerte si dépassement */}
                            {centerComp.offering.maxParticipants &&
                              selectedEmployees.length >
                                centerComp.offering.maxParticipants && (
                                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
                                  <AlertTriangle className="h-5 w-5 shrink-0" />
                                  <div className="text-sm">
                                    <p className="font-medium">
                                      Capacité dépassée
                                    </p>
                                    <p>
                                      Cette offre est limitée à{" "}
                                      <strong>
                                        {centerComp.offering.maxParticipants}{" "}
                                        participants
                                      </strong>
                                      . Vous en avez sélectionné{" "}
                                      {selectedEmployees.length}.
                                    </p>
                                  </div>
                                </div>
                              )}

                            {/* Option INTER */}
                            <div
                              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                                centerComp.offering.maxParticipants &&
                                selectedEmployees.length >
                                  centerComp.offering.maxParticipants
                                  ? "cursor-not-allowed opacity-60 border-red-300"
                                  : selectedCenter?.center.id ===
                                        centerComp.center.id &&
                                      selectedMode === "INTER"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300"
                              }`}
                              onClick={() => {
                                if (
                                  centerComp.offering.maxParticipants &&
                                  selectedEmployees.length >
                                    centerComp.offering.maxParticipants
                                ) {
                                  setError(
                                    `Cette offre est limitée à ${centerComp.offering.maxParticipants} participants maximum`,
                                  );
                                  return;
                                }
                                setSelectedCenter(centerComp);
                                setSelectedMode("INTER");
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-blue-700">
                                  INTER (inter-entreprise)
                                </h4>
                                {selectedCenter?.center.id ===
                                  centerComp.center.id &&
                                  selectedMode === "INTER" && (
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                  )}
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                Vos employés se déplacent au centre
                              </p>
                              <div className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-700">
                                    Prix/personne
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {centerComp.inter.costPerPerson.toLocaleString(
                                      "fr-FR",
                                    )}{" "}
                                    €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">
                                    Formation ({comparison.employees.count}{" "}
                                    pers.)
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {centerComp.inter.trainingCost.toLocaleString(
                                      "fr-FR",
                                    )}{" "}
                                    €
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">Absence</span>
                                  <span className="font-medium text-gray-900">
                                    {comparison.employees.totalAbsenceCost.toLocaleString(
                                      "fr-FR",
                                    )}{" "}
                                    €
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="font-semibold text-gray-900">
                                    Coût total
                                  </span>
                                  <span className="text-lg font-bold text-blue-600">
                                    {centerComp.inter.totalCost.toLocaleString(
                                      "fr-FR",
                                    )}{" "}
                                    €
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Option INTRA */}
                            <div
                              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                                !centerComp.intra.available ||
                                (centerComp.offering.maxParticipants &&
                                  selectedEmployees.length >
                                    centerComp.offering.maxParticipants)
                                  ? "cursor-not-allowed opacity-60"
                                  : selectedCenter?.center.id ===
                                        centerComp.center.id &&
                                      selectedMode === "INTRA"
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-purple-300"
                              }`}
                              onClick={() => {
                                if (
                                  centerComp.offering.maxParticipants &&
                                  selectedEmployees.length >
                                    centerComp.offering.maxParticipants
                                ) {
                                  setError(
                                    `Cette offre est limitée à ${centerComp.offering.maxParticipants} participants maximum`,
                                  );
                                  return;
                                }
                                if (centerComp.intra.available) {
                                  setSelectedCenter(centerComp);
                                  setSelectedMode("INTRA");
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-purple-700">
                                  INTRA (intra-entreprise)
                                </h4>
                                {selectedCenter?.center.id ===
                                  centerComp.center.id &&
                                  selectedMode === "INTRA" && (
                                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                  )}
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                Le formateur se déplace chez vous
                              </p>
                              {centerComp.intra.available ? (
                                <div className="mt-3 space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      Forfait session
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {centerComp.intra.trainingCost?.toLocaleString(
                                        "fr-FR",
                                      )}{" "}
                                      €
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      Prix/personne
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {centerComp.intra.costPerPerson?.toLocaleString(
                                        "fr-FR",
                                      )}{" "}
                                      €
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      Absence
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {comparison.employees.totalAbsenceCost.toLocaleString(
                                        "fr-FR",
                                      )}{" "}
                                      €
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="font-semibold text-gray-900">
                                      Coût total
                                    </span>
                                    <span className="text-lg font-bold text-purple-600">
                                      {centerComp.intra.totalCost?.toLocaleString(
                                        "fr-FR",
                                      )}{" "}
                                      €
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 text-center text-gray-400">
                                  <p>Non disponible</p>
                                  <p className="text-xs">
                                    Ce centre ne propose pas l&apos;INTRA
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Point d'équilibre */}
                          {centerComp.breakEvenPoint && (
                            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
                              <Calculator className="mr-2 inline h-4 w-4 text-gray-600" />
                              <span className="text-gray-700">
                                Point d&apos;équilibre INTER/INTRA :{" "}
                              </span>
                              <strong className="text-gray-900">
                                {centerComp.breakEvenPoint}
                              </strong>{" "}
                              <span className="text-gray-700">
                                participants.
                              </span>{" "}
                              {comparison.employees.count >=
                              centerComp.breakEvenPoint ? (
                                <span className="text-purple-600">
                                  Avec {comparison.employees.count} personnes,
                                  l&apos;INTRA est plus rentable.
                                </span>
                              ) : (
                                <span className="text-blue-600">
                                  Avec {comparison.employees.count} personnes,
                                  l&apos;INTER est plus rentable.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedCenter && (
            <div className="space-y-6">
              {/* Alerte si dépassement de capacité */}
              {selectedCenter.offering.maxParticipants &&
                selectedEmployees.length >
                  selectedCenter.offering.maxParticipants && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                    <AlertTriangle className="h-6 w-6 shrink-0" />
                    <div>
                      <p className="font-semibold">Capacité dépassée !</p>
                      <p className="text-sm">
                        Cette offre est limitée à{" "}
                        <strong>
                          {selectedCenter.offering.maxParticipants} participants
                        </strong>
                        . Vous en avez sélectionné {selectedEmployees.length}.
                        Veuillez réduire le nombre de participants ou choisir un
                        autre centre.
                      </p>
                    </div>
                  </div>
                )}

              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900">
                  Récapitulatif de la session
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Formation
                    </p>
                    <p className="font-medium text-gray-900">
                      {formationType.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Centre</p>
                    <p className="font-medium text-gray-900">
                      {selectedCenter.center.name}
                      {selectedCenter.offering.maxParticipants && (
                        <span
                          className={`ml-2 text-xs ${selectedEmployees.length > selectedCenter.offering.maxParticipants ? "text-red-600" : "text-gray-500"}`}
                        >
                          (max {selectedCenter.offering.maxParticipants} pers.)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Mode</p>
                    <Badge
                      className={
                        selectedMode === "INTRA"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {selectedMode === "INTRA"
                        ? "INTRA (formateur se déplace)"
                        : "INTER (employés se déplacent)"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Participants
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedEmployees.length} employé(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Coûts */}
              <div className="rounded-lg border bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Coût formation
                    </p>
                    <p className="text-xl font-bold text-emerald-700">
                      {selectedMode === "INTRA"
                        ? selectedCenter.intra.trainingCost?.toLocaleString(
                            "fr-FR",
                          )
                        : selectedCenter.inter.trainingCost.toLocaleString(
                            "fr-FR",
                          )}{" "}
                      €
                    </p>
                  </div>
                  <div className="text-2xl text-gray-500 font-light">+</div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Coût absence
                    </p>
                    <p className="text-xl font-bold text-emerald-700">
                      {comparison?.employees.totalAbsenceCost.toLocaleString(
                        "fr-FR",
                      )}{" "}
                      €
                    </p>
                  </div>
                  <div className="text-2xl text-gray-500 font-light">=</div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Coût total
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedMode === "INTRA"
                        ? selectedCenter.intra.totalCost?.toLocaleString(
                            "fr-FR",
                          )
                        : selectedCenter.inter.totalCost.toLocaleString(
                            "fr-FR",
                          )}{" "}
                      €
                    </p>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="sessionDate" className="text-gray-700">
                  Date de la session *
                </Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-1"
                />

                {/* Indicateur de chargement des contraintes */}
                {checkingConstraints && (
                  <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Vérification des contraintes...
                  </p>
                )}

                {/* Avertissements des contraintes d'absence */}
                {constraintWarnings.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {constraintWarnings.map((warning, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                          warning.severity === "danger"
                            ? "bg-red-50 border border-red-200 text-red-700"
                            : "bg-orange-50 border border-orange-200 text-orange-700"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-4 w-4 shrink-0 ${
                            warning.severity === "danger"
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        />
                        <span>{warning.message}</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 italic">
                      Ces avertissements sont informatifs et ne bloquent pas la
                      création de la session.
                    </p>
                  </div>
                )}
              </div>

              {/* Liste des employés */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Employés inscrits ({selectedEmployees.length})
                </p>
                <div className="max-h-40 overflow-auto rounded-lg border bg-gray-50 p-3">
                  <div className="flex flex-wrap gap-2">
                    {needs
                      .filter((n) => selectedEmployees.includes(n.employee.id))
                      .map((need) => (
                        <Badge
                          key={need.employee.id}
                          className="bg-white text-gray-700 border"
                        >
                          {need.employee.firstName} {need.employee.lastName}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t bg-gray-50 p-4">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Retour
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          )}

          {step === 1 && (
            <Button onClick={calculateCosts} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calcul en cours...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Comparer les coûts
                </>
              )}
            </Button>
          )}

          {step === 2 && (
            <Button
              onClick={() => setStep(3)}
              disabled={
                !selectedCenter ||
                (selectedCenter.offering.maxParticipants !== null &&
                  selectedEmployees.length >
                    selectedCenter.offering.maxParticipants)
              }
            >
              Continuer
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}

          {step === 3 && (
            <Button
              onClick={createSession}
              disabled={
                creating ||
                !sessionDate ||
                (selectedCenter?.offering.maxParticipants !== null &&
                  selectedCenter?.offering.maxParticipants !== undefined &&
                  selectedEmployees.length >
                    selectedCenter.offering.maxParticipants)
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Créer la session
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
