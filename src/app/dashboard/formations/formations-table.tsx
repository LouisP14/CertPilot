"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FormationActions } from "./formation-actions";

interface FormationType {
  id: string;
  name: string;
  category: string | null;
  service: string | null;
  defaultValidityMonths: number | null;
  certificateCount: number;
}

interface FormationsTableProps {
  formations: FormationType[];
}

type SortField =
  | "name"
  | "category"
  | "service"
  | "defaultValidityMonths"
  | "certificateCount";
type SortDirection = "asc" | "desc";

// Couleurs par service
const serviceColors: Record<string, string> = {
  Maintenance: "border-blue-300 bg-blue-100 text-blue-800",
  Production: "border-green-300 bg-green-100 text-green-800",
  Logistique: "border-purple-300 bg-purple-100 text-purple-800",
  Qualité: "border-yellow-300 bg-yellow-100 text-yellow-800",
  HSE: "border-orange-300 bg-orange-100 text-orange-800",
  Administratif: "border-pink-300 bg-pink-100 text-pink-800",
};

function getServiceColor(service: string | null): string {
  if (!service) return "";
  return serviceColors[service] || "border-gray-300 bg-gray-100 text-gray-800";
}

export function FormationsTable({ formations }: FormationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Extraire les services uniques
  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    formations.forEach((f) => {
      if (f.service) services.add(f.service);
    });
    return Array.from(services).sort();
  }, [formations]);

  // Filtrer et trier les formations
  const filteredFormations = useMemo(() => {
    let result = [...formations];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.category?.toLowerCase().includes(term) ||
          f.service?.toLowerCase().includes(term),
      );
    }

    // Filtre par service
    if (serviceFilter) {
      if (serviceFilter === "tous") {
        result = result.filter((f) => !f.service);
      } else {
        result = result.filter((f) => f.service === serviceFilter);
      }
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "");
          break;
        case "service":
          comparison = (a.service || "zzz").localeCompare(b.service || "zzz");
          break;
        case "defaultValidityMonths":
          const aVal = a.defaultValidityMonths ?? 9999;
          const bVal = b.defaultValidityMonths ?? 9999;
          comparison = aVal - bVal;
          break;
        case "certificateCount":
          comparison = a.certificateCount - b.certificateCount;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [formations, searchTerm, serviceFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
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
    setServiceFilter("");
  };

  const hasActiveFilters = searchTerm || serviceFilter;

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
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
          className={showFilters ? "bg-blue-50 border-blue-300" : ""}
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
                Service
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="">Tous les services</option>
                <option value="tous">Non assigné (Tous)</option>
                {uniqueServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Compteur de résultats */}
      <div className="text-sm text-gray-500">
        {filteredFormations.length} formation
        {filteredFormations.length > 1 ? "s" : ""} trouvée
        {filteredFormations.length > 1 ? "s" : ""}
        {hasActiveFilters && ` (sur ${formations.length} au total)`}
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
                  Nom de la formation
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("category")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Catégorie
                  <SortIcon field="category" />
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("service")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Service
                  <SortIcon field="service" />
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("defaultValidityMonths")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Validité par défaut
                  <SortIcon field="defaultValidityMonths" />
                </button>
              </th>
              <th className="pb-3">
                <button
                  onClick={() => handleSort("certificateCount")}
                  className="flex items-center font-medium hover:text-gray-900"
                >
                  Utilisations
                  <SortIcon field="certificateCount" />
                </button>
              </th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFormations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Aucune formation ne correspond aux critères de recherche.
                </td>
              </tr>
            ) : (
              filteredFormations.map((ft) => (
                <tr
                  key={ft.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 font-medium">{ft.name}</td>
                  <td className="py-3">
                    {ft.category ? (
                      <Badge variant="secondary">{ft.category}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    {ft.service ? (
                      <Badge
                        variant="outline"
                        className={getServiceColor(ft.service)}
                      >
                        {ft.service}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Tous</span>
                    )}
                  </td>
                  <td className="py-3">
                    {ft.defaultValidityMonths ? (
                      <span>
                        {ft.defaultValidityMonths} mois
                        {ft.defaultValidityMonths >= 12 && (
                          <span className="text-gray-500">
                            {" "}
                            ({Math.floor(ft.defaultValidityMonths / 12)} an
                            {Math.floor(ft.defaultValidityMonths / 12) > 1
                              ? "s"
                              : ""}
                            )
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400">Sans expiration</span>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge variant="secondary">
                      {ft.certificateCount} certificat
                      {ft.certificateCount > 1 ? "s" : ""}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <FormationActions formation={ft} />
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

