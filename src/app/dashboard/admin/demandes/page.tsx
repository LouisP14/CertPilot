"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  Send,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ContactRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  employeeCount: string | null;
  plan: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  NEW: {
    label: "Nouveau",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <Clock className="h-4 w-4" />,
  },
  CONTACTED: {
    label: "Contacté",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: <Phone className="h-4 w-4" />,
  },
  DEMO_DONE: {
    label: "Démo effectuée",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: <Eye className="h-4 w-4" />,
  },
  PAYMENT_SENT: {
    label: "Lien paiement envoyé",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: <CreditCard className="h-4 w-4" />,
  },
  CONVERTED: {
    label: "Converti",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  REJECTED: {
    label: "Rejeté",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const PLAN_CONFIG: Record<
  string,
  { name: string; price: number; employees: string }
> = {
  starter: { name: "Starter", price: 199, employees: "1-50" },
  business: { name: "Business", price: 349, employees: "51-100" },
  enterprise: { name: "Enterprise", price: 599, employees: "101-200" },
  corporate: { name: "Corporate", price: 1199, employees: "201-500" },
};

export default function DemandesAdminPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/contact-requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/admin/demandes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
        );
        if (selectedRequest?.id === id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setUpdating(null);
    }
  };

  // Créer et copier le lien de paiement Stripe
  const createPaymentLink = async (request: ContactRequest) => {
    if (!request.plan) {
      toast.error("Aucune offre sélectionnée pour ce prospect");
      return;
    }

    setSendingPaymentLink(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactRequestId: request.id,
          plan: request.plan,
          billing: billingCycle,
          customerEmail: request.email,
          companyName: request.companyName,
          contactName: request.contactName,
          employeeCount: request.employeeCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création du lien");
      }

      const { url } = await response.json();

      // Envoyer l'email avec le lien de paiement
      const emailResponse = await fetch("/api/emails/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: request.email,
          contactName: request.contactName,
          companyName: request.companyName,
          plan: request.plan,
          billing: billingCycle,
          paymentUrl: url,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error("Erreur lors de l'envoi de l'email");
      }

      // Copier le lien dans le presse-papier
      await navigator.clipboard.writeText(url);
      toast.success("Email envoyé et lien copié dans le presse-papier !");

      // Mettre à jour le statut
      await updateStatus(request.id, "PAYMENT_SENT");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setSendingPaymentLink(false);
    }
  };

  const deleteRequest = async (id: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.",
      )
    ) {
      return;
    }
    setDeleting(id);
    try {
      const response = await fetch(`/api/contact-requests?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        if (selectedRequest?.id === id) {
          setSelectedRequest(null);
        }
        toast.success("Demande supprimée");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const filteredRequests =
    filterStatus === "ALL"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "NEW").length,
    inProgress: requests.filter((r) =>
      ["CONTACTED", "DEMO_DONE", "PAYMENT_SENT"].includes(r.status),
    ).length,
    converted: requests.filter((r) => r.status === "CONVERTED").length,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Demandes de contact
          </h1>
          <p className="text-gray-600">Gérez les demandes de démonstration</p>
        </div>
        <Button variant="outline" onClick={fetchRequests}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <MessageSquare className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-sm text-slate-500">Nouveaux</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Send className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-slate-500">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.converted}</p>
                <p className="text-sm text-slate-500">Convertis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("ALL")}
        >
          Tous ({requests.length})
        </Button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = requests.filter((r) => r.status === key).length;
          return (
            <Button
              key={key}
              variant={filterStatus === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(key)}
            >
              {config.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Liste + Détails */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Liste des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredRequests.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucune demande</p>
            ) : (
              filteredRequests.map((request) => {
                const statusConfig =
                  STATUS_CONFIG[request.status] || STATUS_CONFIG.NEW;
                const planConfig = request.plan
                  ? PLAN_CONFIG[request.plan]
                  : null;

                return (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-slate-50 ${
                      selectedRequest?.id === request.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 truncate">
                            {request.companyName}
                          </p>
                          {planConfig && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              <Package className="h-3 w-3" />
                              {planConfig.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {request.contactName}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(request.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Détails de la demande sélectionnée */}
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-6">
                {/* Infos contact */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Entreprise</p>
                      <p className="font-medium">
                        {selectedRequest.companyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Contact</p>
                      <p className="font-medium">
                        {selectedRequest.contactName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <a
                        href={`mailto:${selectedRequest.email}`}
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        {selectedRequest.email}
                      </a>
                    </div>
                  </div>
                  {selectedRequest.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Téléphone</p>
                        <a
                          href={`tel:${selectedRequest.phone}`}
                          className="font-medium text-emerald-600 hover:underline"
                        >
                          {selectedRequest.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedRequest.employeeCount && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Employés</p>
                        <p className="font-medium">
                          {selectedRequest.employeeCount}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedRequest.plan &&
                    PLAN_CONFIG[selectedRequest.plan] && (
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">
                            Offre souhaitée
                          </p>
                          <p className="font-medium">
                            {PLAN_CONFIG[selectedRequest.plan].name} -{" "}
                            {PLAN_CONFIG[selectedRequest.plan].price}€/mois
                          </p>
                        </div>
                      </div>
                    )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Date de demande</p>
                      <p className="font-medium">
                        {new Date(selectedRequest.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedRequest.message && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">
                      Message
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedRequest.message}
                    </p>
                  </div>
                )}

                {/* Actions de statut */}
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-3">
                    Changer le statut
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <Button
                        key={key}
                        variant={
                          selectedRequest.status === key ? "default" : "outline"
                        }
                        size="sm"
                        disabled={updating === selectedRequest.id}
                        onClick={() => updateStatus(selectedRequest.id, key)}
                      >
                        {config.icon}
                        <span className="ml-1">{config.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions principales */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  {/* Bouton Envoyer lien de paiement - toujours visible si plan sélectionné */}
                  {selectedRequest.plan &&
                    selectedRequest.status !== "CONVERTED" &&
                    selectedRequest.status !== "REJECTED" && (
                      <div className="space-y-2">
                        {/* Toggle mensuel / annuel */}
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
                          <button
                            type="button"
                            onClick={() => setBillingCycle("monthly")}
                            className={`flex-1 py-2 font-medium transition-colors ${
                              billingCycle === "monthly"
                                ? "bg-slate-800 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Mensuel
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillingCycle("annual")}
                            className={`flex-1 py-2 font-medium transition-colors ${
                              billingCycle === "annual"
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Annuel
                            <span className="ml-1 text-xs opacity-80">
                              −17%
                            </span>
                          </button>
                        </div>
                        <Button
                          onClick={() => createPaymentLink(selectedRequest)}
                          disabled={sendingPaymentLink}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          {sendingPaymentLink ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="mr-2 h-4 w-4" />
                          )}
                          Envoyer lien de paiement
                          <span className="ml-1 opacity-80 text-xs">
                            ({billingCycle === "annual" ? "annuel" : "mensuel"})
                          </span>
                        </Button>
                      </div>
                    )}

                  {selectedRequest.status === "CONVERTED" ? (
                    <Link
                      href={`/dashboard/admin/clients?email=${selectedRequest.email}&company=${encodeURIComponent(selectedRequest.companyName)}&name=${encodeURIComponent(selectedRequest.contactName)}`}
                      className="w-full"
                    >
                      <Button variant="success" className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Voir le compte client
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex gap-2">
                      <a
                        href={`mailto:${selectedRequest.email}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer un email
                        </Button>
                      </a>
                      {selectedRequest.phone && (
                        <a
                          href={`tel:${selectedRequest.phone}`}
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            <Phone className="mr-2 h-4 w-4" />
                            Appeler
                          </Button>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Bouton supprimer */}
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    onClick={() => deleteRequest(selectedRequest.id)}
                    disabled={deleting === selectedRequest.id}
                  >
                    {deleting === selectedRequest.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Supprimer cette demande
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p>Sélectionnez une demande pour voir les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
