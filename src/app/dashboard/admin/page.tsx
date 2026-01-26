"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ContactRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  employeeCount: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  employeeLimit: number;
  createdAt: string;
  users: { id: string; email: string; name: string; role: string }[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "clients">(
    "requests",
  );
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [clients, setClients] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(
    null,
  );

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "requests") {
        const res = await fetch("/api/contact-requests");
        const data = await res.json();
        setRequests(data);
      } else {
        const res = await fetch("/api/admin/clients");
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/contact-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-800",
      CONTACTED: "bg-blue-100 text-blue-800",
      CONVERTED: "bg-emerald-100 text-emerald-800",
      REJECTED: "bg-red-100 text-red-800",
      TRIAL: "bg-purple-100 text-purple-800",
      ACTIVE: "bg-emerald-100 text-emerald-800",
      EXPIRED: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      PENDING: "En attente",
      CONTACTED: "Contacté",
      CONVERTED: "Converti",
      REJECTED: "Refusé",
      TRIAL: "Essai",
      ACTIVE: "Actif",
      EXPIRED: "Expiré",
    };
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          <p className="text-sm text-gray-500">
            Gérez les demandes de contact et les comptes clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Nouveau client
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "requests"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MessageSquare className="mr-2 inline h-4 w-4" />
          Demandes ({requests.filter((r) => r.status === "PENDING").length})
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "clients"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Building2 className="mr-2 inline h-4 w-4" />
          Clients ({clients.length})
        </button>
      </div>

      {/* Bouton refresh */}
      <div className="flex justify-end">
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      ) : activeTab === "requests" ? (
        <RequestsList
          requests={requests}
          onStatusChange={updateRequestStatus}
          onConvert={(req) => {
            setSelectedRequest(req);
            setShowCreateModal(true);
          }}
          getStatusBadge={getStatusBadge}
        />
      ) : (
        <ClientsList clients={clients} getStatusBadge={getStatusBadge} />
      )}

      {/* Modal création client */}
      {showCreateModal && (
        <CreateClientModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedRequest(null);
            setActiveTab("clients");
            fetchData();
          }}
          prefillData={selectedRequest}
        />
      )}
    </div>
  );
}

function RequestsList({
  requests,
  onStatusChange,
  onConvert,
  getStatusBadge,
}: {
  requests: ContactRequest[];
  onStatusChange: (id: string, status: string) => void;
  onConvert: (req: ContactRequest) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Aucune demande
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Les demandes de contact apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {req.companyName}
                </h3>
                {getStatusBadge(req.status)}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {req.contactName}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {req.email}
                </span>
                {req.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {req.phone}
                  </span>
                )}
                {req.employeeCount && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {req.employeeCount} employés
                  </span>
                )}
              </div>
              {req.message && (
                <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {req.message}
                </p>
              )}
              <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {req.status === "PENDING" && (
                <>
                  <button
                    onClick={() => onStatusChange(req.id, "CONTACTED")}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Eye className="mr-1 inline h-3 w-3" />
                    Contacté
                  </button>
                  <button
                    onClick={() => onStatusChange(req.id, "REJECTED")}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <XCircle className="mr-1 inline h-3 w-3" />
                    Refuser
                  </button>
                </>
              )}
              {(req.status === "PENDING" || req.status === "CONTACTED") && (
                <button
                  onClick={() => onConvert(req)}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  <UserPlus className="mr-1 inline h-3 w-3" />
                  Créer le compte
                </button>
              )}
              {req.status === "CONVERTED" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Compte créé
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientsList({
  clients,
  getStatusBadge,
}: {
  clients: Company[];
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun client</h3>
        <p className="mt-2 text-sm text-gray-500">
          Créez votre premier compte client
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Entreprise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Utilisateurs
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Créé le
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="font-medium text-gray-900">{client.name}</div>
                <div className="text-sm text-gray-500">
                  {client.users[0]?.email}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {client.subscriptionPlan || "-"}
                <span className="ml-1 text-gray-500">
                  ({client.employeeLimit} emp.)
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {getStatusBadge(client.subscriptionStatus)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {client.users.length} utilisateur(s)
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(client.createdAt).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateClientModal({
  onClose,
  onSuccess,
  prefillData,
}: {
  onClose: () => void;
  onSuccess: () => void;
  prefillData: ContactRequest | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    companyName: prefillData?.companyName || "",
    contactName: prefillData?.contactName || "",
    email: prefillData?.email || "",
    password: generatePassword(),
    plan: "Starter",
    employeeLimit: 50,
    subscriptionMonths: 12,
  });

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      // Marquer la demande comme convertie si applicable
      if (prefillData) {
        await fetch("/api/contact-requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: prefillData.id, status: "CONVERTED" }),
        });
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { name: "Starter", limit: 50, price: "199€" },
    { name: "Business", limit: 100, price: "349€" },
    { name: "Enterprise", limit: 200, price: "599€" },
    { name: "Corporate", limit: 500, price: "1199€" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          {prefillData ? "Créer le compte client" : "Nouveau client"}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Entreprise *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom du contact *
            </label>
            <input
              type="text"
              required
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mot de passe temporaire *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, password: generatePassword() })
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Générer
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Le client devra changer ce mot de passe à sa première connexion
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Plan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {plans.map((plan) => (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      plan: plan.name,
                      employeeLimit: plan.limit,
                    })
                  }
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    formData.plan === plan.name
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{plan.name}</div>
                  <div className="text-xs text-gray-500">
                    {plan.limit} emp. · {plan.price}/mois
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Durée d&apos;abonnement
            </label>
            <select
              value={formData.subscriptionMonths}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subscriptionMonths: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={1}>1 mois</option>
              <option value={3}>3 mois</option>
              <option value={6}>6 mois</option>
              <option value={12}>12 mois (1 an)</option>
              <option value={24}>24 mois (2 ans)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
