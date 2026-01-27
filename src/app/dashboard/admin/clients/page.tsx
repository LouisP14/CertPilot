"use client";

import { Building2, Key, Mail, User, UserPlus, Users } from "lucide-react";
import { useState } from "react";

export default function ClientsAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    employeeLimit: 50,
    subscriptionMonths: 12,
  });

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
          text: `✅ Client créé avec succès !\n📧 Email: ${formData.email}\n🔑 Mot de passe: ${formData.password}`,
        });
        // Reset form
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          password: "",
          employeeLimit: 50,
          subscriptionMonths: 12,
        });
      } else {
        setMessage({ type: "error", text: data.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Créer un compte client
            </h1>
            <p className="text-sm text-gray-700">
              Configurez un nouvel accès pour votre client
            </p>
          </div>
        </div>
      </div>

      {/* Message de succès/erreur */}
      {message && (
        <div
          className={`mb-6 rounded-xl p-4 shadow-sm ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`whitespace-pre-line text-sm font-medium ${
              message.type === "success" ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100"
      >
        {/* Informations entreprise */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Building2 className="h-5 w-5 text-emerald-500" />
            Informations entreprise
          </h3>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
              <Building2 className="h-4 w-4" />
              Nom de l&apos;entreprise *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
              placeholder="Acme Industries"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
              <User className="h-4 w-4" />
              Nom du contact *
            </label>
            <input
              type="text"
              required
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
              placeholder="Jean Dupont"
            />
          </div>
        </div>

        {/* Connexion */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Key className="h-5 w-5 text-emerald-500" />
            Informations de connexion
          </h3>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
              <Mail className="h-4 w-4" />
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
              placeholder="contact@entreprise.fr"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
              <Key className="h-4 w-4" />
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
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none font-mono"
                placeholder="Générez un mot de passe"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all hover:from-emerald-600 hover:to-teal-700"
              >
                <Key className="h-4 w-4" />
                Générer
              </button>
            </div>
            <p className="mt-2 flex items-start gap-2 text-xs text-gray-700">
              <span className="text-amber-500">ℹ️</span>
              Le client devra changer ce mot de passe à la première connexion
            </p>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-emerald-500" />
            Configuration
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Limite employés
              </label>
              <input
                type="number"
                min="1"
                value={formData.employeeLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employeeLimit: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Durée abonnement (mois)
              </label>
              <input
                type="number"
                min="1"
                value={formData.subscriptionMonths}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subscriptionMonths: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Création en cours...
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              Créer le compte client
            </>
          )}
        </button>
      </form>
    </div>
  );
}
