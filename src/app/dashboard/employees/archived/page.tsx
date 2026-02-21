"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Loader2,
  RotateCcw,
  Trash2,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface ArchivedEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  employeeId: string;
  position: string;
  department: string;
  updatedAt: string;
  _count: {
    certificates: number;
  };
  certificates: {
    id: string;
    obtainedDate: string;
    expiryDate: string | null;
    isArchived: boolean;
    formationType: {
      name: string;
    };
  }[];
}

export default function ArchivedEmployeesPage() {
  const [employees, setEmployees] = useState<ArchivedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    confirmText: "",
    variant: "info",
    onConfirm: () => {},
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees/archived");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleRestore = async (
    employeeId: string,
    name: string,
    withCertificates: boolean,
  ) => {
    setConfirmDialog({
      open: true,
      title: withCertificates
        ? "Réintégrer avec certificats"
        : "Réintégrer sans certificats",
      message: withCertificates
        ? `Réintégrer ${name} et restaurer tous ses certificats archivés ? Les certificats expirés seront également restaurés — pensez à vérifier leur validité.`
        : `Réintégrer ${name} sans restaurer ses certificats ? L'employé sera actif mais démarrera avec un passeport formation vierge.`,
      confirmText: "Réintégrer",
      variant: withCertificates ? "info" : "warning",
      onConfirm: async () => {
        try {
          setActionLoading(employeeId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));

          const res = await fetch("/api/employees/archived", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId,
              restoreCertificates: withCertificates,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            setMessage({ type: "success", text: data.message });
            fetchEmployees();
          } else {
            setMessage({ type: "error", text: data.error });
          }
        } catch {
          setMessage({
            type: "error",
            text: "Erreur lors de la réintégration",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handlePermanentDelete = async (employeeId: string, name: string) => {
    setConfirmDialog({
      open: true,
      title: "Suppression définitive",
      message: `Supprimer définitivement ${name} et tout son historique (certificats, formations, signatures) ? Cette action est irréversible.`,
      confirmText: "Supprimer définitivement",
      variant: "danger",
      onConfirm: async () => {
        try {
          setActionLoading(employeeId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));

          const res = await fetch(`/api/employees/archived?id=${employeeId}`, {
            method: "DELETE",
          });

          const data = await res.json();
          if (res.ok) {
            setMessage({ type: "success", text: data.message });
            fetchEmployees();
          } else {
            setMessage({ type: "error", text: data.error });
          }
        } catch {
          setMessage({
            type: "error",
            text: "Erreur lors de la suppression",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employees">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Employés archivés
            </h1>
            <p className="text-gray-600">
              Consultez et gérez les employés archivés de votre entreprise
            </p>
          </div>
        </div>
        <Badge className="bg-gray-100 text-gray-600 border border-gray-300">
          <Archive className="mr-1 h-3 w-3" />
          {employees.length} archivé{employees.length > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : null}
            {message.text}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : employees.length === 0 ? (
        /* Empty state */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserX className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Aucun employé archivé
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Les employés archivés depuis la fiche employé apparaîtront ici.
              Vous pourrez les réintégrer ou les supprimer définitivement.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Liste des employés archivés */
        <div className="space-y-4">
          {employees.map((emp) => {
            const isLoading = actionLoading === emp.id;
            const archivedCerts = emp.certificates.filter((c) => c.isArchived);
            const totalCerts = emp._count.certificates;

            return (
              <Card
                key={emp.id}
                className={`transition-opacity ${isLoading ? "opacity-50" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 font-semibold text-lg">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {emp.firstName} {emp.lastName}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{emp.position}</span>
                          <span>·</span>
                          <span>{emp.department}</span>
                          <span>·</span>
                          <span className="font-mono text-xs">
                            {emp.employeeId}
                          </span>
                        </div>
                        {emp.email && (
                          <p className="text-sm text-gray-400">{emp.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-400">
                      <p>Archivé le</p>
                      <p className="font-medium text-gray-500">
                        {formatDate(emp.updatedAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Info certificats */}
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <FileCheck className="h-4 w-4" />
                    <span>
                      {totalCerts} certificat{totalCerts > 1 ? "s" : ""} au
                      total
                      {archivedCerts.length > 0 && (
                        <span className="text-gray-400">
                          {" "}
                          ({archivedCerts.length} archivé
                          {archivedCerts.length > 1 ? "s" : ""})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleRestore(
                          emp.id,
                          `${emp.firstName} ${emp.lastName}`,
                          true,
                        )
                      }
                      disabled={isLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="mr-2 h-4 w-4" />
                      )}
                      Réintégrer avec certificats
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleRestore(
                          emp.id,
                          `${emp.firstName} ${emp.lastName}`,
                          false,
                        )
                      }
                      disabled={isLoading}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Réintégrer sans certificats
                    </Button>

                    <div className="ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          handlePermanentDelete(
                            emp.id,
                            `${emp.firstName} ${emp.lastName}`,
                          )
                        }
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer définitivement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </div>
  );
}
