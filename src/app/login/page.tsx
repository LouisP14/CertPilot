"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initStatus, setInitStatus] = useState<string | null>(null);

  // Initialiser la base de données au chargement (pour Vercel)
  useEffect(() => {
    const initDb = async () => {
      try {
        const res = await fetch("/api/init");
        const data = await res.json();
        if (data.status === "seeded") {
          setInitStatus(
            "Base initialisée ! Utilisez demo@certpilot.fr / demo123!",
          );
          setEmail("demo@certpilot.fr");
          setPassword("demo123!");
        }
      } catch (e) {
        console.log("Init check:", e);
      }
    };
    initDb();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Panneau gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#173B56] via-[#1e4a6b] to-[#0f2a3d] relative overflow-hidden">
        {/* Motifs décoratifs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center px-16 text-white text-center">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Shield className="h-7 w-7 text-emerald-400" />
              </div>
              <span className="text-3xl font-black tracking-tight">
                CertPilot
              </span>
            </div>
            <p className="text-white/60 text-sm ml-15">
              Gestion des habilitations
            </p>
          </div>

          {/* Message principal */}
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Gérez vos formations
            <br />
            <span className="text-emerald-400">en toute confiance</span>
          </h1>

          <p className="text-lg text-white/70 mb-10 max-w-md">
            Centralisez, suivez et anticipez les échéances de vos habilitations
            professionnelles.
          </p>

          {/* Points forts */}
          <div className="space-y-4">
            {[
              "Alertes automatiques avant expiration",
              "Génération des convocations",
              "Export PDF pour les audits",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B56]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-[#173B56]">
                CertPilot
              </span>
            </div>
          </div>

          {/* En-tête */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Bienvenue
            </h2>
            <p className="text-slate-500">
              Connectez-vous à votre espace de gestion
            </p>
          </div>

          {/* Message d'initialisation démo */}
          {initStatus && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-700 font-medium">
                🎉 {initStatus}
              </p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="vous@entreprise.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#173B56] focus:ring-2 focus:ring-[#173B56]/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#173B56] focus:ring-2 focus:ring-[#173B56]/10 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <span className="text-red-500 text-lg">!</span>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#173B56] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#173B56]/20 transition-all hover:bg-[#1e4a6b] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#173B56] focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Lien retour */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#173B56] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              © 2026 CertPilot. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
