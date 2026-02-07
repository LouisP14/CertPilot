"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  ChevronDown,
  Key,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  adminEmail: string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string;
  employeeLimit: number;
  createdAt: string;
  _count?: {
    users: number;
    employees: number;
  };
}

function ClientsContent() {
  const searchParams = useSearchParams();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    create: true,
    manage: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    plan: "business" as "starter" | "business" | "enterprise" | "corporate",
    subscriptionMonths: 12,
  });

  // Charger la liste des clients
  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Pré-remplir depuis les paramètres URL (venant de /admin/demandes)
  useEffect(() => {
    const email = searchParams.get("email");
    const company = searchParams.get("company");
    const name = searchParams.get("name");

    if (email || company || name) {
      setFormData((prev) => ({
        ...prev,
        email: email || prev.email,
        companyName: company || prev.companyName,
        contactName: name || prev.contactName,
      }));
      // Ouvrir la section création si on vient avec des paramètres
      setOpenSections({ create: true, manage: false });
    }
  }, [searchParams]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `✅ Client créé avec succès !\n📧 Email: ${formData.email}\n🔑 Mot de passe: ${formData.password}\n📤 Email de bienvenue envoyé !`,
        });
        // Reset form
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          password: "",
          plan: "business",
          subscriptionMonths: 12,
        });
        // Rafraîchir la liste des clients
        fetchClients();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur serveur" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?\n\nCette action supprimera également tous les utilisateurs et données associés.`,
      )
    ) {
      return;
    }

    setDeletingId(clientId);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setClients(clients.filter((c) => c.id !== clientId));
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur serveur");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion Clients</h1>
        <p className="text-gray-600">
          Créez et gérez les comptes de vos clients
        </p>
      </div>

      <div className="space-y-4">
        {/* Section Créer un compte */}
        <Card>
          <CardHeader
            className="cursor-pointer transition-colors hover:bg-gray-50"
            onClick={() => toggleSection("create")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                <div>
                  <CardTitle>Créer un compte client</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    Configurez un nouvel accès pour votre client
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.create ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.create && (
            <CardContent className="pt-0">
              {/* Message de succès/erreur */}
              {message && (
                <div
                  className={`mb-6 rounded-xl border p-4 ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p
                    className={`whitespace-pre-line text-sm font-medium ${
                      message.type === "success"
                        ? "text-emerald-800"
                        : "text-red-800"
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations entreprise */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#173B56]">
                    <Building2 className="h-4 w-4" />
                    Informations entreprise
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="companyName">
                        Nom de l&apos;entreprise{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        placeholder="Acme Industries"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName">
                        Nom du contact <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactName"
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>
                </div>

                {/* Connexion */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#173B56]">
                    <Key className="h-4 w-4" />
                    Informations de connexion
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="contact@entreprise.fr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        Mot de passe temporaire{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="password"
                          type="text"
                          required
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Cliquez sur Générer"
                          className="font-mono"
                        />
                        <Button
                          type="button"
                          variant="success"
                          onClick={generatePassword}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Générer
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Le client devra changer ce mot de passe à la première
                        connexion
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#173B56]">
                    <Users className="h-4 w-4" />
                    Configuration
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="plan">Offre</Label>
                      <select
                        id="plan"
                        value={formData.plan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plan: e.target.value as
                              | "starter"
                              | "business"
                              | "enterprise"
                              | "corporate",
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="starter">
                          Starter - 199€/mois (1-50 employés)
                        </option>
                        <option value="business">
                          Business - 349€/mois (51-100 employés)
                        </option>
                        <option value="enterprise">
                          Enterprise - 599€/mois (101-200 employés)
                        </option>
                        <option value="corporate">
                          Corporate - 1199€/mois (201-500 employés)
                        </option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subscriptionMonths">
                        Durée abonnement (mois)
                      </Label>
                      <Input
                        id="subscriptionMonths"
                        type="number"
                        min="1"
                        value={formData.subscriptionMonths}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subscriptionMonths: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer le compte client
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Section Gestion des utilisateurs */}
        <Card>
          <CardHeader
            className="cursor-pointer transition-colors hover:bg-gray-50"
            onClick={() => toggleSection("manage")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    Consultez et gérez les comptes clients existants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-700">
                  {clients.length} client{clients.length > 1 ? "s" : ""}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    openSections.manage ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </CardHeader>
          {openSections.manage && (
            <CardContent className="pt-0">
              {loadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : clients.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">
                    Aucun client pour le moment
                  </p>
                  <p className="text-sm text-gray-400">
                    Créez votre premier client ci-dessus
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {client.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {client.adminEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">
                              {client._count?.employees || 0}
                            </span>{" "}
                            / {client.employeeLimit} employés
                          </p>
                          <p className="text-gray-400">
                            {client.subscriptionPlan || "Starter"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            client.subscriptionStatus === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : client.subscriptionStatus === "TRIAL"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {client.subscriptionStatus === "ACTIVE"
                            ? "Actif"
                            : client.subscriptionStatus === "TRIAL"
                              ? "Essai"
                              : "Expiré"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() =>
                            handleDeleteClient(client.id, client.name)
                          }
                          disabled={deletingId === client.id}
                        >
                          {deletingId === client.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ClientsAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <ClientsContent />
    </Suspense>
  );
}
