"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TotpSettingsProps {
  totpEnabled: boolean;
}

export function TotpSettings({ totpEnabled: initialEnabled }: TotpSettingsProps) {
  const router = useRouter();
  const [totpEnabled, setTotpEnabled] = useState(initialEnabled);
  const [phase, setPhase] = useState<"idle" | "setup" | "confirm-disable">("idle");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);

  // ---- Activation ----
  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/totp/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setPhase("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimited) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/totp/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, code }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateLimited(true);
        setError(data.error);
        setTimeout(() => setRateLimited(false), 5 * 60 * 1000);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Code invalide");
      setTotpEnabled(true);
      setPhase("idle");
      setCode("");
      setSecret("");
      setQrCode("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // ---- Désactivation ----
  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimited) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/totp/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateLimited(true);
        setError(data.error);
        setTimeout(() => setRateLimited(false), 5 * 60 * 1000);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Code invalide");
      setTotpEnabled(false);
      setPhase("idle");
      setCode("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Statut :</span>
        {totpEnabled ? (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Actif
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            <ShieldOff className="h-3.5 w-3.5 mr-1" />
            Désactivé
          </Badge>
        )}
      </div>

      {/* Phase: idle + not enabled → show activate button */}
      {phase === "idle" && !totpEnabled && (
        <Button
          onClick={handleSetup}
          disabled={loading}
          variant="outline"
          className="border-[#173B56] text-[#173B56] hover:bg-[#173B56]/5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Activer la double authentification
        </Button>
      )}

      {/* Phase: idle + enabled → show disable button */}
      {phase === "idle" && totpEnabled && (
        <Button
          onClick={() => { setPhase("confirm-disable"); setError(""); }}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Désactiver
        </Button>
      )}

      {/* Phase: setup → show QR + secret + code input */}
      {phase === "setup" && (
        <form onSubmit={handleEnable} className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Scannez ce QR code avec votre application d&apos;authentification (Google Authenticator, Authy…)
            </p>
            {qrCode && (
              <div className="flex justify-center">
                <Image src={qrCode} alt="QR code TOTP" width={180} height={180} className="rounded-lg border border-slate-200" />
              </div>
            )}
            <div>
              <Label className="text-xs text-slate-500">Ou saisissez le secret manuellement :</Label>
              <code className="block mt-1 rounded bg-slate-100 px-3 py-2 text-xs font-mono text-slate-700 break-all select-all">
                {secret}
              </code>
            </div>
          </div>

          <div>
            <Label htmlFor="totp-enable-code">Code de vérification (6 chiffres)</Label>
            <Input
              id="totp-enable-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-1 text-center tracking-widest text-lg"
              autoFocus
              required
            />
          </div>

          {error && (
            rateLimited ? (
              <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">{error}</p>
              </div>
            ) : (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || code.length !== 6 || rateLimited}
              className="bg-[#173B56] hover:bg-[#1e4a6b] text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer l&apos;activation
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setPhase("idle"); setError(""); setCode(""); setSecret(""); setQrCode(""); }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      {/* Phase: confirm-disable → show code input */}
      {phase === "confirm-disable" && (
        <form onSubmit={handleDisable} className="space-y-4">
          <p className="text-sm text-slate-600">
            Saisissez votre code TOTP actuel pour confirmer la désactivation.
          </p>
          <div>
            <Label htmlFor="totp-disable-code">Code de vérification (6 chiffres)</Label>
            <Input
              id="totp-disable-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-1 text-center tracking-widest text-lg"
              autoFocus
              required
            />
          </div>

          {error && (
            rateLimited ? (
              <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">{error}</p>
              </div>
            ) : (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || code.length !== 6 || rateLimited}
              variant="destructive"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer la désactivation
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setPhase("idle"); setError(""); setCode(""); }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
