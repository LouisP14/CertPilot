"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Euro,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import PlanningModal from "./planning-modal";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position: string;
  department: string;
  site: string | null;
  team: string | null;
  hourlyCost: number | null;
}

interface FormationType {
  id: string;
  name: string;
  category: string | null;
  service: string | null;
  durationHours: number;
  durationDays: number;
  minParticipants: number;
  maxParticipants: number;
  isLegalObligation: boolean;
  estimatedCostPerPerson: number | null;
  estimatedCostPerSession: number | null;
}

interface TrainingNeed {
  id: string;
  employeeId: string;
  employee: Employee;
  formationTypeId: string;
  formationType: FormationType;
  expiryDate: string | null;
  daysUntilExpiry: number | null;
  priority: number;
  priorityReason: string | null;
  status: string;
  estimatedCost: number | null;
  absenceCost: number | null;
  totalCost: number | null;
}

interface GroupedNeeds {
  formationType: FormationType;
  needs: TrainingNeed[];
  totalEmployees: number;
  avgPriority: number;
  maxPriority: number;
  earliestExpiry: string | null;
  totalEstimatedCost: number;
  totalAbsenceCost: number;
  sites: string[];
  teams: string[];
}

export default function TrainingNeedsPage() {
  const [groupedNeeds, setGroupedNeeds] = useState<GroupedNeeds[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterSite, setFilterSite] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [planningModalOpen, setPlanningModalOpen] = useState(false);
  const [selectedGroupForPlanning, setSelectedGroupForPlanning] =
    useState<GroupedNeeds | null>(null);

  useEffect(() => {
    fetchNeeds();
  }, []);

  const fetchNeeds = async () => {
    try {
      const response = await fetch("/api/training-needs/grouped");
      if (response.ok) {
        const data = await response.json();
        setGroupedNeeds(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const detectNeeds = async () => {
    setDetecting(true);
    try {
      const response = await fetch("/api/training-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horizonDays: 90 }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          "Détection terminée",
          result.message || "Les besoins de formation ont été détectés",
        );
        fetchNeeds(); // Recharger les besoins
      } else {
        const error = await response.json();
        toast.error(
          "Erreur de détection",
          error.error || "Impossible de détecter les besoins",
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        "Erreur de détection",
        "Une erreur est survenue lors de la détection",
      );
    } finally {
      setDetecting(false);
    }
  };

  const toggleGroup = (formationTypeId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(formationTypeId)) {
      newExpanded.delete(formationTypeId);
    } else {
      newExpanded.add(formationTypeId);
    }
    setExpandedGroups(newExpanded);
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return "bg-red-100 text-red-700 border-red-200";
    if (priority >= 7) return "bg-orange-100 text-orange-700 border-orange-200";
    if (priority >= 5) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 9) return "Critique";
    if (priority >= 7) return "Urgent";
    if (priority >= 5) return "Normal";
    return "Faible";
  };

  const openPlanningModal = (group: GroupedNeeds) => {
    setSelectedGroupForPlanning(group);
    setPlanningModalOpen(true);
  };

  const handleSessionCreated = () => {
    fetchNeeds();
    setPlanningModalOpen(false);
    setSelectedGroupForPlanning(null);
  };

  // Extraire les sites uniques pour le filtre
  const allSites = [
    ...new Set(groupedNeeds.flatMap((g) => g.sites).filter(Boolean)),
  ];

  // Filtrer les groupes
  const filteredGroups = groupedNeeds.filter((group) => {
    // Filtre recherche
    if (search) {
      const searchLower = search.toLowerCase();
      const matchFormation =
        group.formationType.name.toLowerCase().includes(searchLower) ||
        group.formationType.category?.toLowerCase().includes(searchLower);
      const matchEmployee = group.needs.some(
        (n) =>
          n.employee.firstName.toLowerCase().includes(searchLower) ||
          n.employee.lastName.toLowerCase().includes(searchLower),
      );
      if (!matchFormation && !matchEmployee) return false;
    }

    // Filtre site
    if (filterSite && !group.sites.includes(filterSite)) return false;

    // Filtre priorité
    if (filterPriority) {
      const minPriority = parseInt(filterPriority);
      if (group.maxPriority < minPriority) return false;
    }

    return true;
  });

  // Stats - On récupère les stats côté client depuis une API
  const [certificateStats, setCertificateStats] = useState({
    totalNeeds: 0,
    expiredCount: 0,
    expiringCount: 0,
  });

  useEffect(() => {
    fetch("/api/stats/certificates")
      .then((res) => res.json())
      .then((data) => setCertificateStats(data))
      .catch((err) => console.error("Erreur stats:", err));
  }, []);

  const totalNeeds = groupedNeeds.reduce((sum, g) => sum + g.totalEmployees, 0);
  const totalCost = groupedNeeds.reduce(
    (sum, g) => sum + g.totalEstimatedCost + g.totalAbsenceCost,
    0,
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Besoins de Formation
          </h1>
          <p className="text-gray-600">
            Détection automatique des formations à renouveler
          </p>
        </div>
        <Button onClick={detectNeeds} disabled={detecting}>
          {detecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Détecter les besoins
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalNeeds}</p>
                <p className="text-sm text-gray-500">Besoins détectés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificateStats.expiredCount}
                </p>
                <p className="text-sm text-gray-500">Expirés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{groupedNeeds.length}</p>
                <p className="text-sm text-gray-500">Formations concernées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {totalCost > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Euro className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalCost.toLocaleString("fr-FR")} €
                  </p>
                  <p className="text-sm text-gray-500">Coût total estimé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher formation ou employé..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
            >
              <option value="">Tous les sites</option>
              {allSites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">Toutes priorités</option>
              <option value="9">🔴 Critique (9+)</option>
              <option value="7">🟠 Urgent (7+)</option>
              <option value="5">🟡 Normal (5+)</option>
            </select>
            {(search || filterSite || filterPriority) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setFilterSite("");
                  setFilterPriority("");
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des besoins groupés */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">
                Aucun besoin de formation détecté
              </p>
              <p className="text-sm text-gray-400">
                Cliquez sur "Détecter les besoins" pour analyser les certificats
                expirant dans les 90 prochains jours
              </p>
              <Button
                className="mt-4"
                onClick={detectNeeds}
                disabled={detecting}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Lancer la détection
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map((group) => (
            <Card
              key={group.formationType.id}
              className={`transition-all ${
                group.maxPriority >= 9
                  ? "border-l-4 border-l-red-500"
                  : group.maxPriority >= 7
                    ? "border-l-4 border-l-orange-500"
                    : ""
              }`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleGroup(group.formationType.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedGroups.has(group.formationType.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {group.formationType.name}
                        {group.formationType.isLegalObligation && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            Obligatoire
                          </Badge>
                        )}
                      </CardTitle>
                      {group.formationType.category && (
                        <p className="text-sm text-gray-500">
                          {group.formationType.category}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Priorité */}
                    <Badge
                      className={`${getPriorityColor(group.maxPriority)} px-3`}
                    >
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {getPriorityLabel(group.maxPriority)}
                    </Badge>

                    {/* Nombre d'employés */}
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">
                        {group.totalEmployees}
                      </span>
                      <span className="text-sm">pers.</span>
                    </div>

                    {/* Coût total (affiché uniquement si données réelles) */}
                    {(group.totalEstimatedCost + group.totalAbsenceCost) > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Euro className="h-4 w-4" />
                        <span className="font-semibold">
                          {(
                            group.totalEstimatedCost + group.totalAbsenceCost
                          ).toLocaleString("fr-FR")}
                        </span>
                        <span className="text-sm">€</span>
                      </div>
                    )}

                    {/* Date expiration la plus proche */}
                    {group.earliestExpiry && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(group.earliestExpiry).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Liste détaillée des employés */}
              {expandedGroups.has(group.formationType.id) && (
                <CardContent className="border-t bg-gray-50">
                  <div className="mb-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Sites:</span>
                      <span className="font-medium">
                        {group.sites.join(", ") || "N/A"}
                      </span>
                    </div>
                    {group.formationType.estimatedCostPerPerson != null && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Durée:</span>
                        <span className="font-medium">
                          {group.formationType.durationDays} jour(s)
                        </span>
                      </div>
                    )}
                    {group.formationType.estimatedCostPerPerson != null && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Session:</span>
                        <span className="font-medium">
                          {group.formationType.minParticipants}-
                          {group.formationType.maxParticipants} pers.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.needs.map((need) => (
                      <div
                        key={need.id}
                        className="flex items-center justify-between rounded-lg bg-white p-3 border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                            {need.employee.firstName[0]}
                            {need.employee.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">
                              {need.employee.firstName} {need.employee.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {need.employee.position} •{" "}
                              {need.employee.department}
                              {need.employee.site && ` • ${need.employee.site}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Priorité */}
                          <Badge
                            className={`${getPriorityColor(need.priority)} text-xs`}
                          >
                            {need.priorityReason}
                          </Badge>

                          {/* Coût (affiché uniquement si données réelles) */}
                          {(need.totalCost ?? 0) > 0 && (
                            <div className="text-right text-sm">
                              <p className="font-medium text-gray-700">
                                {(need.totalCost || 0).toLocaleString("fr-FR")} €
                              </p>
                              <p className="text-xs text-gray-500">
                                Form:{" "}
                                {(need.estimatedCost || 0).toLocaleString(
                                  "fr-FR",
                                )}
                                €{" + "}
                                Abs:{" "}
                                {(need.absenceCost || 0).toLocaleString("fr-FR")}€
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Résumé et action */}
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 p-4">
                    <div className="text-sm">
                      <p className="font-medium text-emerald-800">
                        💡 Recommandation de planification
                      </p>
                      <p className="text-emerald-700">
                        {group.formationType.estimatedCostPerPerson != null
                          ? group.totalEmployees <= group.formationType.maxParticipants
                            ? `Session unique possible (${group.totalEmployees}/${group.formationType.maxParticipants} places)`
                            : `${Math.ceil(group.totalEmployees / group.formationType.maxParticipants)} sessions nécessaires`
                          : group.totalEmployees === 1
                            ? `1 employé concerné`
                            : `${group.totalEmployees} employés concernés`}
                      </p>
                    </div>
                    <Button onClick={() => openPlanningModal(group)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Planifier une session
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Modal de planification */}
      {selectedGroupForPlanning && (
        <PlanningModal
          isOpen={planningModalOpen}
          onClose={() => {
            setPlanningModalOpen(false);
            setSelectedGroupForPlanning(null);
          }}
          formationType={selectedGroupForPlanning.formationType}
          needs={selectedGroupForPlanning.needs}
          onSessionCreated={handleSessionCreated}
        />
      )}
    </div>
  );
}
