"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportFormationCoverageToPDF } from "@/lib/pdf-export";
import { Building2, Download, Search, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";

interface FormationCoverageItem {
  id: string;
  name: string;
  category: string | null;
  service: string | null;
  trainedCount: number;
  totalEmployees: number;
  percentage: number;
}

interface FormationCoverageProps {
  formations: FormationCoverageItem[];
}

export function FormationCoverage({ formations }: FormationCoverageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Get unique services from formations (gère les services multiples séparés par virgule)
  const services = useMemo(() => {
    const uniqueServices = new Set<string>();
    formations.forEach((f) => {
      if (f.service) {
        // Séparer les services multiples
        f.service
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => {
            // Exclure "Tous" car c'est le bouton de filtre général
            if (s.toLowerCase() !== "tous") {
              uniqueServices.add(s);
            }
          });
      }
    });
    return Array.from(uniqueServices).sort();
  }, [formations]);

  // Filter formations based on search and service
  const filteredFormations = useMemo(() => {
    return formations.filter((formation) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        formation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (formation.category &&
          formation.category.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by service (gère les services multiples)
      const matchesService =
        selectedService === null ||
        (formation.service &&
          formation.service
            .split(",")
            .map((s) => s.trim())
            .includes(selectedService));

      return matchesSearch && matchesService;
    });
  }, [formations, searchQuery, selectedService]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedService(null);
  };

  const hasActiveFilters = searchQuery !== "" || selectedService !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Couverture par formation ({filteredFormations.length}
            {hasActiveFilters && `/${formations.length}`})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportFormationCoverageToPDF(filteredFormations, {
                search: searchQuery,
                service: selectedService,
              })
            }
            disabled={filteredFormations.length === 0}
            title="Exporter en PDF"
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </CardTitle>
        {/* Filters */}
        <div className="flex flex-col gap-2 mt-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Service filter pills */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedService(null)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedService === null
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Building2 className="h-3 w-3" />
                Tous
              </button>
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() =>
                    setSelectedService(
                      selectedService === service ? null : service,
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedService === service
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          )}

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 self-start flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredFormations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {hasActiveFilters ? (
              <p className="text-sm">
                Aucune formation ne correspond aux filtres
              </p>
            ) : (
              <p className="text-sm">Aucune formation configurée</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {filteredFormations.map((formation) => (
              <div key={formation.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm gap-2">
                  <div className="min-w-0 flex-1">
                    <span
                      className="font-medium text-gray-700 truncate block"
                      title={formation.name}
                    >
                      {formation.name}
                    </span>
                    {formation.service && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {formation.service
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-500 shrink-0 text-right">
                    {formation.trainedCount}/{formation.totalEmployees} (
                    {formation.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      formation.percentage >= 80
                        ? "bg-green-500"
                        : formation.percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${formation.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
