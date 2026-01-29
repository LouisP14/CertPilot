"use client";

import {
  Award,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  History,
  Mail,
  PenTool,
  Search,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  description: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  SIGN: "Signature",
  SEND_CONVOCATION: "Envoi convocation",
  EXPORT_PDF: "Export PDF",
  UPLOAD: "Upload fichier",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  PLAN_SESSION: "Planification session",
  CANCEL_SESSION: "Annulation session",
  IMPORT: "Import données",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  SIGN: "bg-purple-100 text-purple-800",
  SEND_CONVOCATION: "bg-indigo-100 text-indigo-800",
  EXPORT_PDF: "bg-gray-100 text-gray-800",
  UPLOAD: "bg-cyan-100 text-cyan-800",
  LOGIN: "bg-emerald-100 text-emerald-800",
  LOGOUT: "bg-amber-100 text-amber-800",
  PLAN_SESSION: "bg-teal-100 text-teal-800",
  CANCEL_SESSION: "bg-orange-100 text-orange-800",
  IMPORT: "bg-violet-100 text-violet-800",
};

const ENTITY_LABELS: Record<string, string> = {
  EMPLOYEE: "Employé",
  CERTIFICATE: "Certificat",
  FORMATION_TYPE: "Formation",
  TRAINING_SESSION: "Session",
  CONVOCATION: "Convocation",
  SIGNATURE: "Signature",
  COMPANY: "Entreprise",
  USER: "Utilisateur",
  SETTINGS: "Paramètres",
  PLANNING_CONSTRAINTS: "Contraintes",
  TRAINING_CENTER: "Centre formation",
  OFFERING: "Offre",
  REFERENCE: "Référence",
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  EMPLOYEE: <User className="h-4 w-4" />,
  CERTIFICATE: <Award className="h-4 w-4" />,
  FORMATION_TYPE: <GraduationCap className="h-4 w-4" />,
  TRAINING_SESSION: <Calendar className="h-4 w-4" />,
  CONVOCATION: <Mail className="h-4 w-4" />,
  SIGNATURE: <PenTool className="h-4 w-4" />,
  COMPANY: <Building className="h-4 w-4" />,
  USER: <User className="h-4 w-4" />,
  SETTINGS: <Settings className="h-4 w-4" />,
  PLANNING_CONSTRAINTS: <Shield className="h-4 w-4" />,
  TRAINING_CENTER: <Building className="h-4 w-4" />,
  OFFERING: <FileText className="h-4 w-4" />,
  REFERENCE: <Settings className="h-4 w-4" />,
};

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtres
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal détails
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "25");

      if (search) params.append("search", search);
      if (entityTypeFilter) params.append("entityType", entityTypeFilter);
      if (actionFilter) params.append("action", actionFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/audit?${params.toString()}`);
      const data: AuditResponse = await response.json();

      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Erreur lors du chargement des logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, entityTypeFilter, actionFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <History className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-sm text-gray-600">
              Historique complet des actions ({total} entrées)
            </p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">Filtres</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Type d'entité */}
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Tous les types</option>
            {Object.entries(ENTITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Action */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Toutes les actions</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Date début */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          {/* Date fin */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Liste des logs */}
      <div className="rounded-lg border bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mb-4 text-gray-300" />
            <p>Aucun log trouvé</p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedLog(log)}
              >
                {/* Icône entité */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  {ENTITY_ICONS[log.entityType] || (
                    <FileText className="h-4 w-4" />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800"}`}
                    >
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ENTITY_LABELS[log.entityType] || log.entityType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 truncate">
                    {log.description}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    {log.userName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.userName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Action voir */}
                <button className="p-2 text-gray-400 hover:text-purple-600">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-auto rounded-xl bg-white shadow-xl m-4">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white p-4">
              <h2 className="text-lg font-bold text-gray-900">
                Détails de l&apos;action
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Infos principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Action
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[selectedLog.action]}`}
                    >
                      {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Type
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {ENTITY_LABELS[selectedLog.entityType] ||
                      selectedLog.entityType}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Utilisateur
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLog.userName || "Système"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLog.description}
                </p>
              </div>

              {/* Entité */}
              {selectedLog.entityName && (
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Entité concernée
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLog.entityName}
                  </p>
                </div>
              )}

              {/* Anciennes valeurs */}
              {selectedLog.oldValues &&
                Object.keys(selectedLog.oldValues).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Anciennes valeurs
                    </label>
                    <pre className="mt-1 rounded-lg bg-red-50 p-3 text-xs text-red-800 overflow-auto">
                      {JSON.stringify(selectedLog.oldValues, null, 2)}
                    </pre>
                  </div>
                )}

              {/* Nouvelles valeurs */}
              {selectedLog.newValues &&
                Object.keys(selectedLog.newValues).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Nouvelles valeurs
                    </label>
                    <pre className="mt-1 rounded-lg bg-green-50 p-3 text-xs text-green-800 overflow-auto">
                      {JSON.stringify(selectedLog.newValues, null, 2)}
                    </pre>
                  </div>
                )}

              {/* Métadonnées */}
              {selectedLog.metadata &&
                Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Métadonnées
                    </label>
                    <pre className="mt-1 rounded-lg bg-gray-50 p-3 text-xs text-gray-800 overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

              {/* Contexte technique */}
              <div className="border-t pt-4">
                <label className="text-xs font-medium text-gray-500">
                  Contexte technique
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">ID Log:</span>{" "}
                    {selectedLog.id}
                  </div>
                  <div>
                    <span className="font-medium">ID Entité:</span>{" "}
                    {selectedLog.entityId || "-"}
                  </div>
                  {selectedLog.ipAddress && (
                    <div>
                      <span className="font-medium">IP:</span>{" "}
                      {selectedLog.ipAddress}
                    </div>
                  )}
                  {selectedLog.userEmail && (
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedLog.userEmail}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

