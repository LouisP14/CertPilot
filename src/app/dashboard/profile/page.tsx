"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  PenLine,
  Shield,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  employeeCount: number;
  company: {
    id: string;
    name: string;
    logo: string | null;
    subscriptionStatus: string;
    subscriptionPlan: string | null;
    trialEndsAt: string | null;
    employeeLimit: number;
    adminEmail: string | null;
  } | null;
}

function getRoleBadge(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Administrateur
        </Badge>
      );
    case "MANAGER":
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <User className="h-3 w-3 mr-1" />
          Manager
        </Badge>
      );
    case "VIEWER":
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200">
          <Eye className="h-3 w-3 mr-1" />
          Lecteur
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

function getSubscriptionBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <Check className="h-3 w-3 mr-1" />
          Actif
        </Badge>
      );
    case "TRIAL":
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <Calendar className="h-3 w-3 mr-1" />
          Essai gratuit
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Expiré
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-slate-100 text-slate-600 border-slate-200">
          Annulé
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getPlanLabel(plan: string | null) {
  if (!plan) return "Aucun";
  const labels: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    scale: "Scale",
    business: "Business",
    Starter: "Starter",
    Growth: "Growth",
    Scale: "Scale",
    Business: "Business",
  };
  return labels[plan] || plan;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Édition informations personnelles
  const [editingInfo, setEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");

  // Changement mot de passe
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setProfile(data);
      setEditName(data.name);
      setEditEmail(data.email);
    } catch {
      setError("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    setInfoError("");
    setInfoSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      setInfoSuccess("Informations mises à jour avec succès");
      setEditingInfo(false);
      fetchProfile();
      setTimeout(() => setInfoSuccess(""), 3000);
    } catch (err) {
      setInfoError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères",
      );
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      setPasswordSuccess("Mot de passe modifié avec succès");
      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Erreur lors du changement",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#173B56]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600">{error || "Profil introuvable"}</p>
        </div>
      </div>
    );
  }

  const trialDaysRemaining = profile.company?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.company.trialEndsAt).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#173B56]">Mon profil</h1>
          <p className="text-sm text-slate-500">
            Gérez vos informations personnelles et la sécurité de votre compte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : carte de profil */}
        <div className="lg:col-span-1 space-y-6">
          {/* Carte identité */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-[#173B56] to-[#1e4a6b] text-white text-2xl font-bold shadow-lg">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#173B56]">
                  {profile.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{profile.email}</p>
                <div className="mt-3">{getRoleBadge(profile.role)}</div>
                <p className="text-xs text-slate-400 mt-4">
                  Membre depuis le{" "}
                  {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Widget abonnement */}
          {profile.company && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#173B56]" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Statut</span>
                  {getSubscriptionBadge(profile.company.subscriptionStatus)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Offre</span>
                  <span className="text-sm font-semibold text-[#173B56]">
                    {getPlanLabel(profile.company.subscriptionPlan)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Employés</span>
                  <span className="text-sm font-medium">
                    <span className="text-[#173B56] font-semibold">
                      {profile.employeeCount}
                    </span>
                    <span className="text-slate-400">
                      {" "}
                      / {profile.company.employeeLimit}
                    </span>
                  </span>
                </div>

                {/* Barre de progression des employés */}
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      profile.employeeCount / profile.company.employeeLimit >
                      0.9
                        ? "bg-red-500"
                        : profile.employeeCount /
                              profile.company.employeeLimit >
                            0.7
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (profile.employeeCount / profile.company.employeeLimit) * 100)}%`,
                    }}
                  />
                </div>

                {profile.company.subscriptionStatus === "TRIAL" &&
                  trialDaysRemaining !== null && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                      <p className="text-xs text-amber-700">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {trialDaysRemaining > 0
                          ? `${trialDaysRemaining} jour${trialDaysRemaining > 1 ? "s" : ""} restant${trialDaysRemaining > 1 ? "s" : ""} d'essai`
                          : "Période d'essai expirée"}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne droite : formulaires */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-[#173B56]" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Modifiez votre nom et adresse email
                  </CardDescription>
                </div>
                {!editingInfo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingInfo(true);
                      setInfoError("");
                      setInfoSuccess("");
                    }}
                    className="gap-2"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Modifier
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {infoSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {infoSuccess}
                </div>
              )}
              {infoError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {infoError}
                </div>
              )}

              {editingInfo ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#173B56]/20 focus:border-[#173B56]"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#173B56]/20 focus:border-[#173B56]"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSaveInfo}
                      disabled={
                        savingInfo || !editName.trim() || !editEmail.trim()
                      }
                      className="bg-[#173B56] hover:bg-[#1e4a6b] text-white gap-2"
                      size="sm"
                    >
                      {savingInfo ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Enregistrer
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingInfo(false);
                        setEditName(profile.name);
                        setEditEmail(profile.email);
                        setInfoError("");
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <User className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Nom</p>
                      <p className="text-sm font-medium text-[#173B56]">
                        {profile.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm font-medium text-[#173B56]">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Rôle</p>
                      <div className="mt-0.5">{getRoleBadge(profile.role)}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Changement de mot de passe */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#173B56]" />
                    Sécurité
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Modifiez votre mot de passe pour sécuriser votre compte
                  </CardDescription>
                </div>
                {!editingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPassword(true);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    className="gap-2"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Changer le mot de passe
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {passwordError}
                </div>
              )}

              {editingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#173B56]/20 focus:border-[#173B56]"
                        placeholder="Votre mot de passe actuel"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#173B56]/20 focus:border-[#173B56]"
                        placeholder="Minimum 8 caractères"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 8 && (
                      <p className="text-xs text-red-500 mt-1">
                        Minimum 8 caractères requis
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#173B56]/20 focus:border-[#173B56]"
                      placeholder="Confirmez le mot de passe"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        Les mots de passe ne correspondent pas
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        savingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        newPassword.length < 8 ||
                        newPassword !== confirmPassword
                      }
                      className="bg-[#173B56] hover:bg-[#1e4a6b] text-white gap-2"
                      size="sm"
                    >
                      {savingPassword ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Changer le mot de passe
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError("");
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">
                      Mot de passe défini
                    </p>
                    <p className="text-xs text-slate-400">
                      Dernière mise à jour :{" "}
                      {new Date(profile.updatedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations entreprise */}
          {profile.company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#173B56]" />
                  Entreprise
                </CardTitle>
                <CardDescription>
                  Informations sur votre organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Nom</p>
                      <p className="text-sm font-medium text-[#173B56]">
                        {profile.company.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Employés actifs</p>
                      <p className="text-sm font-medium text-[#173B56]">
                        {profile.employeeCount} /{" "}
                        {profile.company.employeeLimit}
                      </p>
                    </div>
                  </div>
                  {profile.company.adminEmail && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">
                          Email administrateur
                        </p>
                        <p className="text-sm font-medium text-[#173B56]">
                          {profile.company.adminEmail}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Offre</p>
                      <p className="text-sm font-medium text-[#173B56]">
                        {getPlanLabel(profile.company.subscriptionPlan)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
