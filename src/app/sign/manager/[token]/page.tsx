"use client";

import { SignaturePad } from "@/components/ui/signature-pad";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Certificate {
  id: string;
  name: string;
  category: string | null;
  obtainedDate: string;
  expiryDate: string | null;
  attachmentUrl: string | null;
}

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position: string;
  department: string;
  photo: string | null;
}

interface EmployeeSignature {
  signedAt: string;
  name: string;
}

interface SignatureData {
  employee: EmployeeData;
  certificates: Certificate[];
  employeeSignature: EmployeeSignature;
  siteManagerName: string | null;
  status: string;
}

export default function ManagerSignPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [data, setData] = useState<SignatureData | null>(null);

  const [signatureName, setSignatureName] = useState("");
  const [signatureTitle, setSignatureTitle] = useState("Responsable");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Pour le rejet
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/signature/manager/${token}`);
        const result = await response.json();

        if (!response.ok) {
          if (result.alreadySigned) {
            setAlreadySigned(true);
          }
          setError(result.error);
          return;
        }

        setData(result);
        if (result.siteManagerName) {
          setSignatureName(result.siteManagerName);
        }
      } catch {
        setError("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSign = async () => {
    if (!signatureImage || !signatureName || !acceptTerms) return;

    setSigning(true);
    try {
      const response = await fetch(`/api/signature/manager/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureImage,
          signatureName,
          signatureTitle,
          action: "APPROVE",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erreur lors de la signature");
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    setSigning(true);
    try {
      const response = await fetch(`/api/signature/manager/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return;
      }

      setRejected(true);
      setShowRejectModal(false);
    } catch {
      setError("Erreur lors du rejet");
    } finally {
      setSigning(false);
    }
  };

  // États d'erreur
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Chargement du passeport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
          {alreadySigned ? (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Déjà validé
              </h1>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Lien invalide
              </h1>
            </>
          )}
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Passeport validé !
          </h1>
          <p className="mt-2 text-gray-600">
            Le passeport formation de {data?.employee.firstName}{" "}
            {data?.employee.lastName} est maintenant officiel.
          </p>
          <div className="mt-6 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">
              L'employé a été notifié de la validation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Passeport rejeté
          </h1>
          <p className="mt-2 text-gray-600">
            Le passeport a été rejeté. L'employé et le service RH seront
            notifiés.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      className="notranslate min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8"
      translate="no"
    >
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Validation responsable
                </h1>
                <p className="text-sm text-indigo-100">
                  Contre-signature du passeport formation
                </p>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {data.employee.photo ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-indigo-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.employee.photo}
                    alt={`${data.employee.firstName} ${data.employee.lastName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                  {data.employee.firstName[0]}
                  {data.employee.lastName[0]}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {data.employee.lastName.toUpperCase()}{" "}
                  {data.employee.firstName}
                </h2>
                <p className="text-gray-600">{data.employee.employeeId}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {data.employee.position}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span>{data.employee.department}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Employee signature info */}
            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  Signé par l'employé le{" "}
                  {formatDate(new Date(data.employeeSignature.signedAt))}
                </span>
              </div>
              <p className="mt-1 text-sm text-green-600">
                Signature : {data.employeeSignature.name}
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                Vérifiez les formations avant de valider
              </p>
              <p className="text-sm text-amber-700 mt-1">
                En tant que responsable, vous certifiez que cet employé est
                autorisé à exercer les activités liées aux formations listées.
              </p>
            </div>
          </div>
        </div>

        {/* Formations */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="border-b bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">
                Formations à valider ({data.certificates.length})
              </h3>
            </div>
          </div>
          <div className="divide-y">
            {data.certificates.map((cert) => (
              <div key={cert.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{cert.name}</p>
                    {cert.category && (
                      <p className="text-sm text-gray-500">{cert.category}</p>
                    )}
                    {cert.attachmentUrl && (
                      <a
                        href={cert.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        Voir le justificatif
                      </a>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">
                      Formation : {formatDate(new Date(cert.obtainedDate))}
                    </p>
                    {cert.expiryDate && (
                      <p className="text-gray-600">
                        Validité : {formatDate(new Date(cert.expiryDate))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Section */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="border-b bg-gray-50 px-6 py-4">
            <h3 className="font-semibold text-gray-900">
              Votre signature (Responsable)
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Nom et titre */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Jean DUPONT"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonction
                </label>
                <input
                  type="text"
                  value={signatureTitle}
                  onChange={(e) => setSignatureTitle(e.target.value)}
                  placeholder="Responsable"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Signature Pad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dessinez votre signature
              </label>
              <SignaturePad
                onSave={(sig) => setSignatureImage(sig)}
                onClear={() => setSignatureImage(null)}
              />
            </div>

            {/* Conditions */}
            <div className="rounded-lg bg-gray-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  En tant que responsable, je certifie avoir vérifié les
                  habilitations et formations de cet employé. Je l'autorise à
                  exercer les activités correspondantes sur le site dont j'ai la
                  responsabilité. Cette signature électronique a valeur
                  juridique.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 rounded-lg border border-red-200 bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
              >
                Rejeter
              </button>
              <button
                onClick={handleSign}
                disabled={
                  !signatureImage || !signatureName || !acceptTerms || signing
                }
                className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {signing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Validation...
                  </span>
                ) : (
                  "Valider le passeport"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Signature électronique sécurisée - CertPilot
        </p>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Rejeter le passeport
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Veuillez indiquer la raison du rejet. L'employé et le service RH
              seront notifiés.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              rows={3}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={signing}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:bg-gray-300"
              >
                {signing ? "..." : "Confirmer le rejet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
