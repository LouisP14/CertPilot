"use client";

import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Filter,
  Mail,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CertificatePdfUpload } from "./certificate-pdf-upload";
import { DeleteCertificateButton } from "./delete-certificate-button";
import { RenewCertificateButton } from "./renew-certificate-button";

interface Certificate {
  id: string;
  obtainedDate: Date;
  expiryDate: Date | null;
  details: string | null;
  attachmentUrl: string | null;
  formationType: {
    id: string;
    name: string;
    category: string | null;
    defaultValidityMonths: number | null;
  };
}

interface CertificatesTableProps {
  certificates: Certificate[];
  employeeId: string;
}

type SortField =
  | "name"
  | "category"
  | "obtainedDate"
  | "expiryDate"
  | "daysLeft"
  | "status";
type SortDirection = "asc" | "desc";

export function CertificatesTable({
  certificates,
  employeeId,
}: CertificatesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("expiryDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Transformer les certificats avec les données calculées
  const enrichedCertificates = useMemo(() => {
    return certificates.map((cert) => ({
      ...cert,
      status: getCertificateStatus(cert.expiryDate),
      daysLeft: getDaysUntilExpiry(cert.expiryDate),
    }));
  }, [certificates]);

  // Filtrer et trier
  const filteredCertificates = useMemo(() => {
    let result = [...enrichedCertificates];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.formationType.name.toLowerCase().includes(term) ||
          c.formationType.category?.toLowerCase().includes(term) ||
          c.details?.toLowerCase().includes(term),
      );
    }

    // Filtre par statut
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.formationType.name.localeCompare(b.formationType.name);
          break;
        case "category":
          comparison = (a.formationType.category || "").localeCompare(
            b.formationType.category || "",
          );
          break;
        case "obtainedDate":
          comparison =
            new Date(a.obtainedDate).getTime() -
            new Date(b.obtainedDate).getTime();
          break;
        case "expiryDate":
          const aExp = a.expiryDate
            ? new Date(a.expiryDate).getTime()
            : Infinity;
          const bExp = b.expiryDate
            ? new Date(b.expiryDate).getTime()
            : Infinity;
          comparison = aExp - bExp;
          break;
        case "daysLeft":
          const aDays = a.daysLeft ?? 9999;
          const bDays = b.daysLeft ?? 9999;
          comparison = aDays - bDays;
          break;
        case "status":
          const statusOrder = { expired: 0, expiring: 1, valid: 2 };
          comparison =
            (statusOrder[a.status as keyof typeof statusOrder] || 0) -
            (statusOrder[b.status as keyof typeof statusOrder] || 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    enrichedCertificates,
    searchTerm,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const hasActiveFilters = searchTerm || statusFilter;

  // Compter les statuts
  const statusCounts = useMemo(() => {
    const counts = { valid: 0, expiring: 0, expired: 0 };
    enrichedCertificates.forEach((c) => {
      if (c.status === "valid") counts.valid++;
      else if (c.status === "expiring") counts.expiring++;
      else if (c.status === "expired") counts.expired++;
    });
    return counts;
  }, [enrichedCertificates]);

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-blue-300 bg-blue-50" : ""}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Filtres dépliables */}
      {showFilters && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="">Tous les statuts</option>
                <option value="valid">✅ Valide ({statusCounts.valid})</option>
                <option value="expiring">
                  ⚠️ Expire bientôt ({statusCounts.expiring})
                </option>
                <option value="expired">
                  ❌ Expiré ({statusCounts.expired})
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Compteur de résultats */}
      <div className="text-sm text-gray-500">
        {filteredCertificates.length} formation
        {filteredCertificates.length > 1 ? "s" : ""} trouvée
        {filteredCertificates.length > 1 ? "s" : ""}
        {hasActiveFilters && ` (sur ${certificates.length} au total)`}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="pb-3">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Formation
                  {renderSortIcon("name")}
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("category")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Catégorie
                  {renderSortIcon("category")}
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("obtainedDate")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Date obtention
                  {renderSortIcon("obtainedDate")}
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("expiryDate")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Fin validité
                  {renderSortIcon("expiryDate")}
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("daysLeft")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Jours restants
                  {renderSortIcon("daysLeft")}
                </button>
              </th>
              <th className="pb-3 font-medium">Détails</th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Statut
                  {renderSortIcon("status")}
                </button>
              </th>
              <th className="pb-3 font-medium">PDF</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Aucune formation ne correspond aux critères de recherche.
                </td>
              </tr>
            ) : (
              filteredCertificates.map((cert) => (
                <tr
                  key={cert.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 font-medium">
                    {cert.formationType.name}
                  </td>
                  <td className="py-3">
                    {cert.formationType.category ? (
                      <Badge variant="secondary">
                        {cert.formationType.category}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3">{formatDate(cert.obtainedDate)}</td>
                  <td className="py-3">{formatDate(cert.expiryDate)}</td>
                  <td className="py-3">
                    {cert.daysLeft !== null ? (
                      <span
                        className={
                          cert.daysLeft < 0
                            ? "font-medium text-red-600"
                            : cert.daysLeft <= 30
                              ? "font-medium text-yellow-600"
                              : ""
                        }
                      >
                        {cert.daysLeft < 0
                          ? `${Math.abs(cert.daysLeft)}j de retard`
                          : `${cert.daysLeft}j`}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {cert.details || "-"}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={cert.status} />
                  </td>
                  <td className="py-3">
                    <CertificatePdfUpload
                      certificateId={cert.id}
                      attachmentUrl={cert.attachmentUrl}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/convocations?formation=${encodeURIComponent(cert.formationType.id)}&employee=${encodeURIComponent(employeeId)}`}
                        title="Créer une convocation"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                      <RenewCertificateButton
                        certificate={{
                          id: cert.id,
                          formationType: {
                            id: cert.formationType.id,
                            name: cert.formationType.name,
                            defaultValidityMonths:
                              cert.formationType.defaultValidityMonths,
                          },
                          details: cert.details,
                        }}
                        employeeId={employeeId}
                      />
                      <DeleteCertificateButton certificateId={cert.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
