"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare, Loader2, Pencil, PlusCircle, Save, Square, Trash2, UserCheck, UserX, X } from "lucide-react";
import { useEffect, useState } from "react";

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  managedServices: string[];
  isActive: boolean;
  createdAt: string;
}

interface UsersManagerProps {
  availableServices: string[];
}

export function UsersManager({ availableServices }: UsersManagerProps) {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Edit services state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editServices, setEditServices] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (selectedServices.length === 0) {
      setError("Sélectionnez au moins un service supervisé.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, managedServices: selectedServices }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création.");
      } else {
        setSuccess(`Compte manager créé. Un email d'invitation a été envoyé à ${email}.`);
        setName("");
        setEmail("");
        setSelectedServices([]);
        setShowForm(false);
        fetchUsers();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: CompanyUser) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch {
      // silent
    }
  }

  function openEdit(user: CompanyUser) {
    setEditingUserId(user.id);
    setEditServices([...user.managedServices]);
    setEditError(null);
  }

  function toggleEditService(service: string) {
    setEditServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  async function handleSaveServices(userId: string) {
    if (editServices.length === 0) {
      setEditError("Sélectionnez au moins un service.");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managedServices: editServices }),
      });
      if (res.ok) {
        setEditingUserId(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setEditError(data.error || "Erreur lors de la mise à jour.");
      }
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(user: CompanyUser) {
    if (!confirm(`Supprimer le compte de ${user.name} ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
    } catch {
      // silent
    }
  }

  const managers = users.filter((u) => u.role === "MANAGER");
  const adminUser = users.find((u) => u.role === "ADMIN");

  return (
    <div className="space-y-4">
      {/* Admin account info */}
      {adminUser && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">{adminUser.name}</p>
            <p className="text-xs text-slate-500">{adminUser.email}</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Administrateur</Badge>
        </div>
      )}

      {/* Managers list */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      ) : managers.length === 0 ? (
        <p className="text-sm text-slate-500 py-2">Aucun manager créé pour l&apos;instant.</p>
      ) : (
        <div className="space-y-2">
          {managers.map((user) => (
            <div
              key={user.id}
              className={`rounded-lg border px-4 py-3 ${
                user.isActive ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{user.name}</p>
                    {!user.isActive && (
                      <Badge className="bg-red-100 text-red-600 hover:bg-red-100 text-xs">Désactivé</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  {editingUserId !== user.id && user.managedServices.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.managedServices.map((s) => (
                        <span
                          key={s}
                          className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-3 flex items-center gap-1">
                  <button
                    onClick={() => editingUserId === user.id ? setEditingUserId(null) : openEdit(user)}
                    title="Modifier les services"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    title={user.isActive ? "Désactiver" : "Réactiver"}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    title="Supprimer"
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Formulaire d'édition des services inline */}
              {editingUserId === user.id && (
                <div className="mt-3 border-t pt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">Services supervisés</p>
                  {availableServices.length === 0 ? (
                    <p className="text-xs text-slate-400">Aucun service configuré.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableServices.map((service) => {
                        const selected = editServices.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleEditService(service)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                              selected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {selected ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                            {service}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {editError && (
                    <p className="text-xs text-red-600">{editError}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={editSaving}
                      onClick={() => handleSaveServices(user.id)}
                    >
                      {editSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                      Enregistrer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditingUserId(null); setEditError(null); }}
                    >
                      <X className="mr-2 h-3 w-3" />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Success / Error */}
      {success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Create form toggle */}
      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowForm(true); setError(null); setSuccess(null); }}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Inviter un manager
        </Button>
      ) : (
        <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4 mt-2">
          <h4 className="text-sm font-semibold text-slate-700">Nouveau manager</h4>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="manager-name" className="text-xs">Nom complet *</Label>
              <Input
                id="manager-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manager-email" className="text-xs">Email *</Label>
              <Input
                id="manager-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@entreprise.fr"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Services supervisés * <span className="text-slate-400">(sélectionnez au moins un)</span></Label>
            {availableServices.length === 0 ? (
              <p className="text-xs text-slate-500">Aucun service configuré. Ajoutez des services dans &quot;Gestion du personnel&quot; ci-dessus.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableServices.map((service) => {
                  const selected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {selected ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                      {service}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Créer et envoyer l&apos;invitation
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setShowForm(false); setError(null); }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
