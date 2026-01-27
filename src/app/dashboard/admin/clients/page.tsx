"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Key, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ClientsForm() {
  const searchParams = useSearchParams();
  
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
    }
  }, [searchParams]);

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
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Créer un compte client
        </h1>
        <p className="text-gray-600">
          Configurez un nouvel accès pour votre client
        </p>
      </div>

      {/* Message de succès/erreur */}
      {message && (
        <div
          className={`rounded-xl p-4 ${
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-[#173B56]" />
              Informations entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">
                Nom de l&apos;entreprise <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
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
                  setFormData({ ...formData, contactName: e.target.value })
                }
                placeholder="Jean Dupont"
              />
            </div>
          </CardContent>
        </Card>

        {/* Connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-[#173B56]" />
              Informations de connexion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                Mot de passe temporaire <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
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
                Le client devra changer ce mot de passe à la première connexion
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-[#173B56]" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeLimit">Limite employés</Label>
                <Input
                  id="employeeLimit"
                  type="number"
                  min="1"
                  value={formData.employeeLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeLimit: parseInt(e.target.value),
                    })
                  }
                />
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
          </CardContent>
        </Card>

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
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Création en cours...
            </>
          ) : (
            "Créer le compte client"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ClientsAdminPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>}>
      <ClientsForm />
    </Suspense>
  );
}
