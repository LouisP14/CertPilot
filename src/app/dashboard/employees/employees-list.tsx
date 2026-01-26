"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileCheck,
  FileClock,
  FileX,
  Plus,
  QrCode,
  Search,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  photo: string | null;
  employeeId: string;
  position: string;
  department: string;
  qrToken: string;
  passportSignature: { status: string } | null;
  statusCounts: {
    valid: number;
    expiring: number;
    expired: number;
  };
  certificateCount: number;
}

type SortColumn =
  | "name"
  | "employeeId"
  | "position"
  | "department"
  | "formations"
  | "passport";
type SortDirection = "asc" | "desc";

interface EmployeesListProps {
  employees: Employee[];
}

export function EmployeesList({ employees }: EmployeesListProps) {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterPassport, setFilterPassport] = useState<string>("");

  // Extraire les départements uniques
  const departments = useMemo(() => {
    const depts = new Set(employees.map((e) => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [employees]);

  // Statuts de passeport disponibles
  const passportStatuses = [
    { value: "DRAFT", label: "Non envoyé" },
    { value: "PENDING_EMPLOYEE", label: "Attente employé" },
    { value: "PENDING_MANAGER", label: "Attente manager" },
    { value: "COMPLETED", label: "Validé" },
    { value: "REJECTED", label: "Rejeté" },
  ];

  // Filtrage et tri
  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    // Recherche textuelle
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.firstName.toLowerCase().includes(searchLower) ||
          e.lastName.toLowerCase().includes(searchLower) ||
          e.employeeId.toLowerCase().includes(searchLower) ||
          e.position.toLowerCase().includes(searchLower) ||
          e.department.toLowerCase().includes(searchLower) ||
          (e.email && e.email.toLowerCase().includes(searchLower)),
      );
    }

    // Filtre par département
    if (filterDepartment) {
      result = result.filter((e) => e.department === filterDepartment);
    }

    // Filtre par statut passeport
    if (filterPassport) {
      if (filterPassport === "DRAFT") {
        result = result.filter(
          (e) => !e.passportSignature || e.passportSignature.status === "DRAFT",
        );
      } else {
        result = result.filter(
          (e) => e.passportSignature?.status === filterPassport,
        );
      }
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "name":
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`,
          );
          break;
        case "employeeId":
          comparison = a.employeeId.localeCompare(b.employeeId);
          break;
        case "position":
          comparison = a.position.localeCompare(b.position);
          break;
        case "department":
          comparison = a.department.localeCompare(b.department);
          break;
        case "formations":
          comparison = a.certificateCount - b.certificateCount;
          break;
        case "passport":
          const statusOrder: Record<string, number> = {
            COMPLETED: 1,
            PENDING_MANAGER: 2,
            PENDING_EMPLOYEE: 3,
            REJECTED: 4,
            DRAFT: 5,
          };
          const aStatus = a.passportSignature?.status || "DRAFT";
          const bStatus = b.passportSignature?.status || "DRAFT";
          comparison =
            (statusOrder[aStatus] || 5) - (statusOrder[bStatus] || 5);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    employees,
    search,
    filterDepartment,
    filterPassport,
    sortColumn,
    sortDirection,
  ]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-blue-600" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-blue-600" />
    );
  };

  const hasFilters = search || filterDepartment || filterPassport;

  const clearFilters = () => {
    setSearch("");
    setFilterDepartment("");
    setFilterPassport("");
  };

  return (
    <>
      {/* Recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom, matricule, email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filtre par service */}
            <div className="w-full md:w-48">
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">Tous les services</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </div>

            {/* Filtre par statut passeport */}
            <div className="w-full md:w-48">
              <Select
                value={filterPassport}
                onChange={(e) => setFilterPassport(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {passportStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Bouton reset filtres */}
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="shrink-0"
              >
                <X className="mr-1 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des employés */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des employés ({filteredAndSortedEmployees.length}
            {hasFilters && ` / ${employees.length}`})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>Aucun employé pour le moment.</p>
              <Link href="/dashboard/employees/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le premier employé
                </Button>
              </Link>
            </div>
          ) : filteredAndSortedEmployees.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>Aucun employé ne correspond aux filtres.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-700">
                    <th className="pb-3 font-semibold">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Employé
                        <SortIcon column="name" />
                      </button>
                    </th>
                    <th className="pb-3 font-semibold">
                      <button
                        onClick={() => handleSort("employeeId")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Matricule
                        <SortIcon column="employeeId" />
                      </button>
                    </th>
                    <th className="pb-3 font-semibold">
                      <button
                        onClick={() => handleSort("position")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Fonction
                        <SortIcon column="position" />
                      </button>
                    </th>
                    <th className="pb-3 font-semibold">
                      <button
                        onClick={() => handleSort("department")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Service
                        <SortIcon column="department" />
                      </button>
                    </th>
                    <th className="pb-3 font-semibold">
                      <button
                        onClick={() => handleSort("formations")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Formations
                        <SortIcon column="formations" />
                      </button>
                    </th>
                    <th className="pb-3 font-semibold">
                      <button
                        onClick={() => handleSort("passport")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Passeport
                        <SortIcon column="passport" />
                      </button>
                    </th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {employee.photo ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={employee.photo}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {employee.lastName} {employee.firstName}
                            </p>
                            {employee.email && (
                              <p className="text-xs text-gray-500">
                                {employee.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">{employee.employeeId}</Badge>
                      </td>
                      <td className="py-4">{employee.position}</td>
                      <td className="py-4">{employee.department}</td>
                      <td className="py-4">
                        {employee.certificateCount === 0 ? (
                          <span className="text-sm text-gray-400">Aucune</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            {employee.statusCounts.valid > 0 && (
                              <div
                                className="flex items-center gap-1"
                                title="Formations valides"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-700">
                                  {employee.statusCounts.valid}
                                </span>
                              </div>
                            )}
                            {employee.statusCounts.expiring > 0 && (
                              <div
                                className="flex items-center gap-1"
                                title="Formations expirant bientôt"
                              >
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium text-amber-700">
                                  {employee.statusCounts.expiring}
                                </span>
                              </div>
                            )}
                            {employee.statusCounts.expired > 0 && (
                              <div
                                className="flex items-center gap-1"
                                title="Formations expirées"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700">
                                  {employee.statusCounts.expired}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <SignatureStatusBadge
                          status={employee.passportSignature?.status}
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/p/${employee.qrToken}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Voir le passeport"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/employees/${employee.id}`}>
                            <Button variant="ghost" size="icon" title="Voir">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/employees/${employee.id}/edit`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function SignatureStatusBadge({ status }: { status?: string | null }) {
  if (!status || status === "DRAFT") {
    return (
      <div
        className="flex items-center gap-1.5 text-gray-500"
        title="Non envoyé"
      >
        <FileClock className="h-4 w-4" />
        <span className="text-xs">Non envoyé</span>
      </div>
    );
  }

  switch (status) {
    case "PENDING_EMPLOYEE":
      return (
        <div
          className="flex items-center gap-1.5 text-blue-600"
          title="En attente de signature employé"
        >
          <Clock className="h-4 w-4" />
          <span className="text-xs">Attente employé</span>
        </div>
      );
    case "PENDING_MANAGER":
      return (
        <div
          className="flex items-center gap-1.5 text-amber-600"
          title="En attente de validation manager"
        >
          <Clock className="h-4 w-4" />
          <span className="text-xs">Attente manager</span>
        </div>
      );
    case "COMPLETED":
      return (
        <div
          className="flex items-center gap-1.5 text-green-600"
          title="Passeport validé"
        >
          <FileCheck className="h-4 w-4" />
          <span className="text-xs">Validé</span>
        </div>
      );
    case "REJECTED":
      return (
        <div
          className="flex items-center gap-1.5 text-red-600"
          title="Passeport rejeté"
        >
          <FileX className="h-4 w-4" />
          <span className="text-xs">Rejeté</span>
        </div>
      );
    default:
      return null;
  }
}
