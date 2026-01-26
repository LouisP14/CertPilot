"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Euro,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Attendee {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
  };
  status: string;
  absenceCost: number | null;
}

interface TrainingSession {
  id: string;
  formationType: {
    id: string;
    name: string;
    category: string | null;
    durationDays: number | null;
  };
  trainingCenter: {
    id: string;
    name: string;
    city: string;
    isPartner: boolean;
  } | null;
  isIntraCompany: boolean;
  startDate: string;
  endDate: string;
  status: string;
  convocationsSentAt: string | null;
  trainingCost: number | null;
  totalAbsenceCost: number | null;
  totalCost: number | null;
  attendees: Attendee[];
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PLANNED: {
    label: "Planifiée",
    color: "bg-blue-100 text-blue-700",
    icon: <Calendar className="h-3 w-3" />,
  },
  CONFIRMED: {
    label: "Confirmée",
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  IN_PROGRESS: {
    label: "En cours",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Terminée",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  CANCELLED: {
    label: "Annulée",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sendingConvocations, setSendingConvocations] = useState<string | null>(
    null,
  );
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);

        // Vérifier et clôturer automatiquement les sessions passées
        autoCompletePassedSessions(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clôture automatique des sessions dont la date est passée
  const autoCompletePassedSessions = async (
    sessionsData: TrainingSession[],
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionsToComplete = sessionsData.filter((session) => {
      const endDate = new Date(session.endDate);
      endDate.setHours(23, 59, 59, 999);
      return (
        (session.status === "CONFIRMED" || session.status === "IN_PROGRESS") &&
        endDate < today
      );
    });

    for (const session of sessionsToComplete) {
      try {
        await fetch(`/api/sessions/${session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED" }),
        });
      } catch (error) {
        console.error("Erreur clôture auto:", error);
      }
    }

    // Recharger si des sessions ont été clôturées
    if (sessionsToComplete.length > 0) {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    }
  };

  const sendConvocations = async (session: TrainingSession) => {
    setSendingConvocations(session.id);

    try {
      // Préparer les données pour l'envoi des convocations
      const employees = session.attendees.map((a) => ({
        id: a.employee.id,
        name: `${a.employee.firstName} ${a.employee.lastName}`,
        email: null as string | null,
      }));

      // Déterminer le lieu
      const location = session.trainingCenter
        ? `${session.trainingCenter.name}, ${session.trainingCenter.city}`
        : "À définir";

      const response = await fetch("/api/convocations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          formationName: session.formationType.name,
          startDate: session.startDate,
          endDate: session.endDate,
          startTime: "09:00",
          endTime: "17:00",
          location,
          notes: "",
          employees,
          pdfBase64: "",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          "Convocations envoyées !",
          result.message ||
            `${result.emailsSent || 0} email(s) envoyé(s) avec succès`,
        );
        // L'API a déjà mis à jour convocationsSentAt, on recharge juste
        fetchSessions(); // Recharger pour voir le changement
      } else {
        const error = await response.json();
        toast.error(
          "Erreur d'envoi",
          error.error || "Impossible d'envoyer les convocations",
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        "Erreur d'envoi",
        "Une erreur est survenue lors de l'envoi des convocations",
      );
    } finally {
      setSendingConvocations(null);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchSessions();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(
          "Session supprimée",
          "La session a été supprimée avec succès",
        );
        fetchSessions();
      } else {
        toast.error("Erreur", "Impossible de supprimer la session");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur", "Une erreur est survenue");
    } finally {
      setDeleting(false);
      setSessionToDelete(null);
    }
  };

  // Filtrer les sessions
  const filteredSessions = sessions.filter((session) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchFormation = session.formationType.name
        .toLowerCase()
        .includes(searchLower);
      const matchCenter =
        session.trainingCenter?.name?.toLowerCase().includes(searchLower) ||
        false;
      const matchEmployee = session.attendees.some(
        (a) =>
          a.employee.firstName.toLowerCase().includes(searchLower) ||
          a.employee.lastName.toLowerCase().includes(searchLower),
      );
      if (!matchFormation && !matchCenter && !matchEmployee) return false;
    }

    if (filterStatus && session.status !== filterStatus) return false;

    return true;
  });

  // Stats
  const totalSessions = sessions.length;
  const plannedSessions = sessions.filter(
    (s) => s.status === "PLANNED" || s.status === "CONFIRMED",
  ).length;
  const totalCost = sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);
  const totalParticipants = sessions.reduce(
    (sum, s) => sum + s.attendees.length,
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
            Sessions de Formation
          </h1>
          <p className="text-gray-600">
            Gestion des sessions planifiées et confirmées
          </p>
        </div>
        <Link href="/dashboard/training-needs">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle session
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-sm text-gray-500">Sessions totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{plannedSessions}</p>
                <p className="text-sm text-gray-500">Planifiées/Confirmées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalParticipants}</p>
                <p className="text-sm text-gray-500">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Euro className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalCost.toLocaleString("fr-FR")} €
                </p>
                <p className="text-sm text-gray-500">Coût total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher formation, centre ou participant..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            {(search || filterStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("");
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des sessions */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Aucune session trouvée</p>
              <p className="text-sm text-gray-400">
                Planifiez une session depuis les besoins de formation
              </p>
              <Link href="/dashboard/training-needs">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Voir les besoins
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => {
            const statusConfig =
              STATUS_CONFIG[session.status] || STATUS_CONFIG.DRAFT;
            const isExpanded = expandedSession === session.id;

            return (
              <Card key={session.id}>
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedSession(isExpanded ? null : session.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {session.formationType.name}
                          <Badge
                            className={
                              session.isIntraCompany
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {session.isIntraCompany ? "INTRA" : "INTER"}
                          </Badge>
                        </CardTitle>
                        <p className="flex items-center gap-2 text-sm text-gray-500">
                          <Building2 className="h-4 w-4" />
                          {session.trainingCenter?.name || "Centre non défini"}
                          <span className="text-gray-300">•</span>
                          <MapPin className="h-4 w-4" />
                          {session.trainingCenter?.city || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Date */}
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(session.startDate).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">
                          {session.attendees.length}
                        </span>
                      </div>

                      {/* Coût */}
                      <div className="flex items-center gap-1 text-gray-600">
                        <Euro className="h-4 w-4" />
                        <span className="font-semibold">
                          {(session.totalCost || 0).toLocaleString("fr-FR")}
                        </span>
                        <span className="text-sm">€</span>
                      </div>

                      {/* Statut */}
                      <Badge
                        className={`${statusConfig.color} flex items-center gap-1`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Contenu étendu */}
                {isExpanded && (
                  <CardContent className="border-t border-gray-100 bg-gray-50 pt-4">
                    {/* Détails financiers */}
                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg bg-white p-3 shadow-sm">
                        <p className="text-sm text-gray-600">Coût formation</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(session.trainingCost || 0).toLocaleString("fr-FR")}{" "}
                          €
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-3 shadow-sm">
                        <p className="text-sm text-gray-600">Coût absence</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(session.totalAbsenceCost || 0).toLocaleString(
                            "fr-FR",
                          )}{" "}
                          €
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-3 shadow-sm">
                        <p className="text-sm text-emerald-700 font-medium">
                          Coût total
                        </p>
                        <p className="text-xl font-bold text-emerald-600">
                          {(session.totalCost || 0).toLocaleString("fr-FR")} €
                        </p>
                      </div>
                    </div>

                    {/* Liste des participants */}
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        Participants ({session.attendees.length})
                      </p>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {session.attendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-2 rounded-lg bg-white p-2 border"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                              {attendee.employee.firstName[0]}
                              {attendee.employee.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium">
                                {attendee.employee.firstName}{" "}
                                {attendee.employee.lastName}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {attendee.employee.position}
                              </p>
                            </div>
                            {attendee.absenceCost && (
                              <p className="text-xs text-gray-500">
                                {attendee.absenceCost.toLocaleString("fr-FR")} €
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex gap-2">
                        {session.status === "PLANNED" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSessionStatus(session.id, "CONFIRMED");
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmer
                          </Button>
                        )}
                        {session.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (session.convocationsSentAt) {
                                // Déjà envoyées, demander confirmation pour réenvoyer
                                if (
                                  confirm(
                                    "Les convocations ont déjà été envoyées. Voulez-vous les renvoyer ?",
                                  )
                                ) {
                                  sendConvocations(session);
                                }
                              } else {
                                sendConvocations(session);
                              }
                            }}
                            disabled={sendingConvocations === session.id}
                            className={
                              session.convocationsSentAt
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {sendingConvocations === session.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi...
                              </>
                            ) : session.convocationsSentAt ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Convocations envoyées
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Convocations
                              </>
                            )}
                          </Button>
                        )}
                        {session.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSessionStatus(session.id, "COMPLETED");
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Terminer
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {session.status !== "COMPLETED" &&
                          session.status !== "CANCELLED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateSessionStatus(session.id, "CANCELLED");
                              }}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Annuler
                            </Button>
                          )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(session.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        open={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        title="Supprimer la session"
        message="Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible et supprimera également toutes les convocations associées."
        confirmText={deleting ? "Suppression..." : "Supprimer"}
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => sessionToDelete && deleteSession(sessionToDelete)}
      />
    </div>
  );
}
