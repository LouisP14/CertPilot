"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  FileSignature,
  Loader2,
  Mail,
  Send,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SignatureStatusProps {
  employeeId: string;
  employeeEmail: string | null;
  employeeName: string;
  managerEmail?: string | null;
  managerName?: string | null;
}

interface SignatureData {
  id: string;
  status: string;
  employeeSignedAt: string | null;
  employeeSignatureName: string | null;
  managerSignedAt: string | null;
  managerSignatureName: string | null;
  siteManagerEmail: string | null;
  siteManagerName: string | null;
  initiatedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  employeeToken: string;
  managerToken: string;
}

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "Brouillon",
    color: "bg-gray-100 text-gray-700",
    icon: <FileSignature className="h-4 w-4" />,
  },
  PENDING_EMPLOYEE: {
    label: "En attente signature employé",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock className="h-4 w-4" />,
  },
  PENDING_MANAGER: {
    label: "En attente validation responsable",
    color: "bg-blue-100 text-blue-700",
    icon: <Clock className="h-4 w-4" />,
  },
  COMPLETED: {
    label: "Validé ✓",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  REJECTED: {
    label: "Rejeté",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="h-4 w-4" />,
  },
};

export function SignatureStatus({
  employeeId,
  employeeEmail,
  employeeName,
  managerEmail,
  managerName,
}: SignatureStatusProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [siteManagerEmail, setSiteManagerEmail] = useState(managerEmail || "");
  const [siteManagerName, setSiteManagerName] = useState(managerName || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await fetch(`/api/signature?employeeId=${employeeId}`);
        const data = await response.json();
        if (data && data.id) {
          setSignature(data);
        } else {
          setSignature(null);
        }
      } catch (err) {
        console.error("Error fetching signature:", err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial
    fetchSignature();

    // Polling toutes les 3 secondes pour détecter les changements
    // (invalidation de signature, signature effectuée, etc.)
    const interval = setInterval(fetchSignature, 3000);

    return () => clearInterval(interval);
  }, [employeeId]);

  const handleSendForSignature = async () => {
    if (!siteManagerEmail) {
      setError("Email du responsable requis");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          siteManagerEmail,
          siteManagerName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Demande de signature envoyée ! L'employé recevra un email.");
      setShowModal(false);
      router.refresh();

      // Refresh signature data
      const sigResponse = await fetch(
        `/api/signature?employeeId=${employeeId}`,
      );
      const sigData = await sigResponse.json();
      if (sigData && sigData.id) {
        setSignature(sigData);
      }
    } catch {
      setError("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  const statusInfo = signature
    ? STATUS_LABELS[signature.status] || STATUS_LABELS.DRAFT
    : null;

  return (
    <div className="space-y-4">
      {/* Current Status */}
      {signature && statusInfo && (
        <div className="space-y-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </div>

          {/* Details based on status */}
          {signature.status === "PENDING_EMPLOYEE" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
              <p className="text-amber-800">
                📧 Lien de signature envoyé à <strong>{employeeEmail}</strong>
              </p>
              <p className="text-amber-600 mt-1 text-xs">
                Le lien expire après 7 jours
              </p>
            </div>
          )}

          {signature.status === "PENDING_MANAGER" && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Signé par l'employé :{" "}
                  <strong>{signature.employeeSignatureName}</strong>
                </span>
              </div>
              <p className="text-blue-800">
                📧 En attente de validation par{" "}
                <strong>
                  {signature.siteManagerName || signature.siteManagerEmail}
                </strong>
              </p>
            </div>
          )}

          {signature.status === "COMPLETED" && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Signé par l'employé :{" "}
                  <strong>{signature.employeeSignatureName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Validé par : <strong>{signature.managerSignatureName}</strong>
                </span>
              </div>
              {signature.completedAt && (
                <p className="text-green-600 text-xs mt-2">
                  Passeport validé le{" "}
                  {new Date(signature.completedAt).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          )}

          {signature.status === "REJECTED" && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm">
              <p className="text-red-800 font-medium">Passeport rejeté</p>
              {signature.rejectionReason && (
                <p className="text-red-600 mt-1">
                  Raison : {signature.rejectionReason}
                </p>
              )}
              <Button
                onClick={() => setShowModal(true)}
                size="sm"
                className="mt-3"
              >
                <Send className="mr-2 h-4 w-4" />
                Renvoyer à signer
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Send for signature button */}
      {(!signature ||
        signature.status === "DRAFT" ||
        signature.status === "REJECTED") && (
        <>
          {!employeeEmail ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
              <p className="text-amber-700">
                ⚠️ L'employé doit avoir une adresse email pour recevoir la
                demande de signature.
              </p>
            </div>
          ) : (
            <Button onClick={() => setShowModal(true)} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Envoyer à signer
            </Button>
          )}
        </>
      )}

      {/* Success message */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Envoyer à signer
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Le passeport de <strong>{employeeName}</strong> sera envoyé pour
              signature électronique.
            </p>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Mail className="h-4 w-4" />
                  <span>
                    1. L'employé recevra un lien à :{" "}
                    <strong>{employeeEmail}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du responsable *
                </label>
                <input
                  type="email"
                  value={siteManagerEmail}
                  onChange={(e) => setSiteManagerEmail(e.target.value)}
                  placeholder="responsable@entreprise.fr"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du responsable (optionnel)
                </label>
                <input
                  type="text"
                  value={siteManagerName}
                  onChange={(e) => setSiteManagerName(e.target.value)}
                  placeholder="Jean DUPONT"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSendForSignature}
                disabled={sending || !siteManagerEmail}
                className="flex-1"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
