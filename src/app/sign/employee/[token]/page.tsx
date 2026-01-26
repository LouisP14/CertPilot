"use client";

import { SignaturePad } from "@/components/ui/signature-pad";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
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
  email: string;
  photo: string | null;
}

interface SignatureData {
  employee: EmployeeData;
  certificates: Certificate[];
  status: string;
  initiatedAt: string;
}

export default function EmployeeSignPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<SignatureData | null>(null);

  const [signatureName, setSignatureName] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/signature/employee/${token}`);
        const result = await response.json();

        if (!response.ok) {
          if (result.alreadySigned) {
            setAlreadySigned(true);
          }
          setError(result.error);
          return;
        }

        setData(result);
        setSignatureName(
          `${result.employee.firstName} ${result.employee.lastName}`,
        );
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
      const response = await fetch(`/api/signature/employee/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureImage,
          signatureName,
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
                Déjà signé
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
            Signature enregistrée !
          </h1>
          <p className="mt-2 text-gray-600">
            Votre passeport formation a été signé avec succès.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Le responsable va recevoir une notification pour valider votre
            passeport.
          </p>
          <div className="mt-6 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Vous recevrez un email de confirmation une fois le passeport
              validé.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Signature électronique
                </h1>
                <p className="text-sm text-blue-100">
                  Passeport Formation Réglementaire
                </p>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {data.employee.photo ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-100">
                  <Image
                    src={data.employee.photo}
                    alt={`${data.employee.firstName} ${data.employee.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
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
          </div>
        </div>

        {/* Warning */}
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                Vérifiez attentivement les informations
              </p>
              <p className="text-sm text-amber-700 mt-1">
                En signant ce document, vous certifiez que les formations
                listées ci-dessous correspondent à votre situation actuelle.
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
            <h3 className="font-semibold text-gray-900">Votre signature</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet (tel qu'il apparaîtra sur le document)
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
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
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Je certifie sur l'honneur que les informations présentées dans
                  ce passeport formation sont exactes et correspondent à ma
                  situation actuelle. Je comprends que cette signature
                  électronique a la même valeur juridique qu'une signature
                  manuscrite.
                </span>
              </label>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                Demande initiée le {formatDate(new Date(data.initiatedAt))}
              </span>
            </div>

            {/* Submit */}
            <button
              onClick={handleSign}
              disabled={
                !signatureImage || !signatureName || !acceptTerms || signing
              }
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {signing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signature en cours...
                </span>
              ) : (
                "Signer mon passeport"
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Signature électronique sécurisée - CertPilot
        </p>
      </div>
    </div>
  );
}
