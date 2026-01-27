"use client";

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
          text: `Client créé ! Email: ${formData.email} / Mot de passe: ${formData.password}`,
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
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Créer un compte client</h1>

      {message && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg bg-white p-6 shadow"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nom de l&apos;entreprise *
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Acme Industries"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nom du contact *
          </label>
          <input
            type="text"
            required
            value={formData.contactName}
            onChange={(e) =>
              setFormData({ ...formData, contactName: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="contact@entreprise.fr"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
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
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Mot de passe"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Générer
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Le client devra changer ce mot de passe à la première connexion
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer le compte client"}
        </button>
      </form>
    </div>
  );
}
