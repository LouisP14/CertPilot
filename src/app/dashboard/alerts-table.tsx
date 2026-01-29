"use client";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { exportAlertsToPDF } from "@/lib/pdf-export";
import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Filter,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Certificate {
  id: string;
  expiryDate: Date | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
  };
  formationType: {
    name: string;
    category: string | null;
  };
}

type SortField =
  | "employee"
  | "formation"
  | "expiryDate"
  | "daysLeft"
  | "status";
type SortDirection = "asc" | "desc";

export function AlertsTable({ certificates }: { certificates: Certificate[] }) {
  const [sortField, setSortField] = useState<SortField>("daysLeft");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "expired" | "expiring"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedCertificates = useMemo(() => {
    let filtered = [...certificates];

    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cert) =>
          cert.employee.firstName.toLowerCase().includes(search) ||
          cert.employee.lastName.toLowerCase().includes(search) ||
          cert.employee.position.toLowerCase().includes(search) ||
          cert.formationType.name.toLowerCase().includes(search) ||
          (cert.formationType.category?.toLowerCase().includes(search) ??
            false),
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((cert) => {
        const status = getCertificateStatus(cert.expiryDate);
        return statusFilter === "expired"
          ? status === "expired"
          : status === "expiring";
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "employee":
          comparison =
            `${a.employee.lastName} ${a.employee.firstName}`.localeCompare(
              `${b.employee.lastName} ${b.employee.firstName}`,
            );
          break;
        case "formation":
          comparison = a.formationType.name.localeCompare(b.formationType.name);
          break;
        case "expiryDate":
          const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
          const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "daysLeft":
          const daysA = getDaysUntilExpiry(a.expiryDate) ?? -9999;
          const daysB = getDaysUntilExpiry(b.expiryDate) ?? -9999;
          comparison = daysA - daysB;
          break;
        case "status":
          const statusOrder: Record<string, number> = {
            expired: 0,
            expiring: 1,
            valid: 2,
            "no-expiry": 3,
          };
          const statusA = getCertificateStatus(a.expiryDate);
          const statusB = getCertificateStatus(b.expiryDate);
          comparison =
            (statusOrder[statusA] ?? 3) - (statusOrder[statusB] ?? 3);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [certificates, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedCertificates.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertificates = filteredAndSortedCertificates.slice(
    startIndex,
    endIndex,
  );

  // Réinitialiser la page lors du changement de filtres
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-blue-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-600" />
    );
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <th
      className="pb-3 font-semibold cursor-pointer hover:text-blue-600 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher employé, formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="w-44"
          >
            <option value="all">Tous les statuts</option>
            <option value="expired">Expirées uniquement</option>
            <option value="expiring">Expire bientôt</option>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportAlertsToPDF(filteredAndSortedCertificates, {
                search: searchTerm,
                status: statusFilter,
              })
            }
            disabled={filteredAndSortedCertificates.length === 0}
            title="Exporter en PDF"
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Résultats */}
      {filteredAndSortedCertificates.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {searchTerm || statusFilter !== "all"
            ? "Aucun résultat ne correspond à vos critères"
            : "Aucune alerte"}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredAndSortedCertificates.length} résultat(s)
              {(searchTerm || statusFilter !== "all") && " filtré(s)"}
              {totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-700">
                  <SortableHeader field="employee">Employé</SortableHeader>
                  <SortableHeader field="formation">Formation</SortableHeader>
                  <SortableHeader field="expiryDate">
                    Fin de validité
                  </SortableHeader>
                  <SortableHeader field="daysLeft">
                    Jours restants
                  </SortableHeader>
                  <SortableHeader field="status">Statut</SortableHeader>
                </tr>
              </thead>
              <tbody>
                {paginatedCertificates.map((cert) => {
                  const status = getCertificateStatus(cert.expiryDate);
                  const daysLeft = getDaysUntilExpiry(cert.expiryDate);

                  return (
                    <tr
                      key={cert.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3">
                        <Link
                          href={`/dashboard/employees/${cert.employee.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {cert.employee.lastName} {cert.employee.firstName}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {cert.employee.position}
                        </p>
                      </td>
                      <td className="py-3">
                        <span className="font-medium">
                          {cert.formationType.name}
                        </span>
                        {cert.formationType.category && (
                          <p className="text-xs text-gray-500">
                            {cert.formationType.category}
                          </p>
                        )}
                      </td>
                      <td className="py-3">{formatDate(cert.expiryDate)}</td>
                      <td className="py-3">
                        <span
                          className={
                            daysLeft !== null && daysLeft < 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {daysLeft !== null
                            ? daysLeft < 0
                              ? `${Math.abs(daysLeft)} jours de retard`
                              : `${daysLeft} jours`
                            : "-"}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Afficher max 7 boutons : 1 ... 4 5 6 ... 10
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    if (page === 2 && currentPage <= 3) return true;
                    if (
                      page === totalPages - 1 &&
                      currentPage >= totalPages - 2
                    )
                      return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[2.5rem]"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

