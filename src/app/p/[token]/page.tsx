import { StatusBadge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { formatDate, getCertificateStatus } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCodeDisplay from "./qr-code";

async function getPassport(token: string) {
  const employee = await prisma.employee.findUnique({
    where: { qrToken: token },
    include: {
      company: {
        select: { name: true },
      },
      manager: {
        select: { firstName: true, lastName: true },
      },
      certificates: {
        where: { isArchived: false },
        include: { formationType: true },
        orderBy: [{ expiryDate: "asc" }],
      },
      passportSignature: {
        select: {
          status: true,
          employeeSignedAt: true,
          employeeSignatureName: true,
          employeeSignatureImg: true,
          managerSignedAt: true,
          managerSignatureName: true,
          managerSignatureTitle: true,
          managerSignatureImg: true,
          completedAt: true,
        },
      },
    },
  });

  if (!employee || !employee.isActive) {
    return null;
  }

  return employee;
}

export default async function PassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const employee = await getPassport(token);

  if (!employee) {
    notFound();
  }

  const validCertificates = employee.certificates.filter(
    (c) => getCertificateStatus(c.expiryDate) !== "expired",
  );
  const expiredCertificates = employee.certificates.filter(
    (c) => getCertificateStatus(c.expiryDate) === "expired",
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header Bar */}
          <div className="bg-linear-to-r from-[#173B56] via-[#1e4a6b] to-[#173B56] px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-wide">
                    PASSEPORT FORMATIONS
                  </h1>
                  <p className="text-sm text-slate-300">
                    Habilitations et autorisations de conduite
                  </p>
                </div>
              </div>
              {employee.company?.name && (
                <div className="text-right">
                  <p className="text-xl font-bold text-white tracking-wide">
                    {employee.company.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bande accent */}
          <div className="h-1 bg-linear-to-r from-emerald-400 via-emerald-500 to-emerald-400"></div>

          {/* Employee Info */}
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Photo & Name */}
              <div className="flex flex-col items-center text-center">
                {employee.photo ? (
                  <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-2xl border-4 border-slate-100 shadow-lg">
                    <Image
                      src={employee.photo}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#173B56] to-[#1e4a6b] text-3xl font-bold text-white shadow-lg">
                    {employee.firstName[0]}
                    {employee.lastName[0]}
                  </div>
                )}
                <h2 className="text-xl font-bold text-[#173B56]">
                  {employee.lastName.toUpperCase()} {employee.firstName}
                </h2>
                <p className="text-slate-500 font-medium">
                  {employee.employeeId}
                </p>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 font-medium">
                      Fonction :{" "}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {employee.position}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <User className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 font-medium">
                      Service :{" "}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {employee.department}
                    </span>
                  </div>
                </div>
                {employee.manager && (
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-medium">
                        Manager :{" "}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {employee.manager.lastName} {employee.manager.firstName}
                      </span>
                    </div>
                  </div>
                )}
                {employee.medicalCheckupDate && (
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-medium">
                        Visite médicale :
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(employee.medicalCheckupDate)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <QRCodeDisplay
                  token={token}
                  employeeName={`${employee.lastName.toUpperCase()} ${employee.firstName}`}
                />
                <p className="mt-2 text-xs text-slate-500 font-medium">
                  Scanner pour vérification
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Valid Certificates */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-[#173B56]">
                Formations valides ({validCertificates.length})
              </h3>
            </div>
          </div>
          <div className="p-6">
            {validCertificates.length === 0 ? (
              <p className="text-center text-slate-500">
                Aucune formation valide enregistrée.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-600">
                      <th className="pb-3 font-semibold">Formation</th>
                      <th className="pb-3 font-semibold">Catégorie</th>
                      <th className="pb-3 font-semibold">Date formation</th>
                      <th className="pb-3 font-semibold">Fin validité</th>
                      <th className="pb-3 font-semibold">Détails</th>
                      <th className="pb-3 font-semibold">Statut</th>
                      <th className="pb-3 font-semibold">Justificatif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validCertificates.map((cert) => {
                      const status = getCertificateStatus(cert.expiryDate);
                      return (
                        <tr
                          key={cert.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-3 font-semibold text-[#173B56]">
                            {cert.formationType.name}
                          </td>
                          <td className="py-3 text-slate-600">
                            {cert.formationType.category || "-"}
                          </td>
                          <td className="py-3 text-slate-600">
                            {formatDate(cert.obtainedDate)}
                          </td>
                          <td className="py-3 text-slate-700 font-medium">
                            {formatDate(cert.expiryDate)}
                          </td>
                          <td className="py-3 text-slate-500">
                            {cert.details || "-"}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={status} />
                          </td>
                          <td className="py-3">
                            {cert.attachmentUrl ? (
                              <a
                                href={cert.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-[#173B56]/10 px-2.5 py-1 text-xs font-medium text-[#173B56] hover:bg-[#173B56]/20 transition-colors"
                              >
                                <FileText className="h-3 w-3" />
                                Voir PDF
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Expired Certificates */}
        {expiredCertificates.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-red-100 bg-red-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <span className="text-red-600 text-lg">✕</span>
                </div>
                <h3 className="font-semibold text-red-800">
                  Formations expirées ({expiredCertificates.length})
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-600">
                      <th className="pb-3 font-semibold">Formation</th>
                      <th className="pb-3 font-semibold">Catégorie</th>
                      <th className="pb-3 font-semibold">Date formation</th>
                      <th className="pb-3 font-semibold">Fin validité</th>
                      <th className="pb-3 font-semibold">Justificatif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredCertificates.map((cert) => (
                      <tr
                        key={cert.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3 font-semibold text-slate-700">
                          {cert.formationType.name}
                        </td>
                        <td className="py-3 text-slate-500">
                          {cert.formationType.category || "-"}
                        </td>
                        <td className="py-3 text-slate-500">
                          {formatDate(cert.obtainedDate)}
                        </td>
                        <td className="py-3 text-red-600 font-semibold">
                          {formatDate(cert.expiryDate)}
                        </td>
                        <td className="py-3">
                          {cert.attachmentUrl ? (
                            <a
                              href={cert.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#173B56]/10 px-2.5 py-1 text-xs font-medium text-[#173B56] hover:bg-[#173B56]/20 transition-colors"
                            >
                              <FileText className="h-3 w-3" />
                              Voir PDF
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Signatures électroniques */}
        {employee.passportSignature?.status === "COMPLETED" && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-emerald-800">
                  Passeport validé électroniquement
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Signature employé */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                    Signature de l'employé
                  </p>
                  <div className="flex flex-col items-center">
                    {employee.passportSignature.employeeSignatureImg && (
                      <img
                        src={employee.passportSignature.employeeSignatureImg}
                        alt="Signature employé"
                        className="h-12 w-auto mb-2"
                      />
                    )}
                    <div className="border-t border-slate-300 pt-2 text-center w-full">
                      <p className="font-semibold text-[#173B56]">
                        {employee.passportSignature.employeeSignatureName}
                      </p>
                      {employee.passportSignature.employeeSignedAt && (
                        <p className="text-xs text-slate-500">
                          Signé le{" "}
                          {formatDate(
                            new Date(
                              employee.passportSignature.employeeSignedAt,
                            ),
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Signature responsable */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                    Validation responsable
                  </p>
                  <div className="flex flex-col items-center">
                    {employee.passportSignature.managerSignatureImg && (
                      <img
                        src={employee.passportSignature.managerSignatureImg}
                        alt="Signature responsable"
                        className="h-12 w-auto mb-2"
                      />
                    )}
                    <div className="border-t border-slate-300 pt-2 text-center w-full">
                      <p className="font-semibold text-[#173B56]">
                        {employee.passportSignature.managerSignatureName}
                      </p>
                      {employee.passportSignature.managerSignatureTitle && (
                        <p className="text-xs text-slate-600">
                          {employee.passportSignature.managerSignatureTitle}
                        </p>
                      )}
                      {employee.passportSignature.managerSignedAt && (
                        <p className="text-xs text-slate-500">
                          Validé le{" "}
                          {formatDate(
                            new Date(
                              employee.passportSignature.managerSignedAt,
                            ),
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sceau de validation */}
              {employee.passportSignature.completedAt && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 py-3 text-sm text-emerald-700 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Document certifié le{" "}
                    {formatDate(
                      new Date(employee.passportSignature.completedAt),
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passeport non signé */}
        {(!employee.passportSignature ||
          employee.passportSignature.status !== "COMPLETED") && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-lg">
            <div className="p-5 text-center">
              <p className="text-amber-700 font-semibold">
                ⚠️ Ce passeport n'a pas encore été validé électroniquement
              </p>
              <p className="text-sm text-amber-600 mt-1">
                Les signatures de l'employé et du responsable sont requises pour
                la validation officielle.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 shadow-lg">
            <Shield className="h-5 w-5 text-emerald-500" />
            <span className="font-bold text-[#173B56]">CertPilot</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 font-medium">
            Document généré le {formatDate(new Date())}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ce document est une version numérique du passeport formation.
          </p>
        </div>
      </div>
    </div>
  );
}
