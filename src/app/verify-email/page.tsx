"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error);
          return;
        }

        setStatus("success");
        setMessage(data.message);
      } catch {
        setStatus("error");
        setMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-white p-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-black text-[#173B56]">
          CertPilot
        </Link>

        <div className="mt-8">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
              <h1 className="mt-4 text-xl font-bold text-[#173B56]">
                Vérification en cours...
              </h1>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-[#173B56]">
                Email confirmé !
              </h1>
              <p className="mt-3 text-slate-600">{message}</p>
              <p className="mt-2 text-sm text-slate-500">
                Votre essai gratuit de 14 jours est maintenant actif.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
              >
                Se connecter
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-[#173B56]">
                Vérification échouée
              </h1>
              <p className="mt-3 text-slate-600">{message}</p>
              <Link
                href="/register"
                className="mt-6 inline-block text-sm font-medium text-emerald-600 hover:underline"
              >
                Créer un nouveau compte
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
