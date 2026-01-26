"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportServiceCoverageToPDF } from "@/lib/pdf-export";
import { Building2, CheckCircle, Download } from "lucide-react";

interface ServiceCoverageItem {
  name: string;
  totalEmployees: number;
  formations: {
    name: string;
    employeesWithFormation: number;
    totalEmployees: number;
    percentage: number;
  }[];
  globalPercentage: number;
}

interface ServiceCoverageProps {
  services: ServiceCoverageItem[];
}

export function ServiceCoverage({ services }: ServiceCoverageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-500" />
            Conformité par service
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportServiceCoverageToPDF(services)}
            disabled={services.length === 0}
            title="Exporter en PDF"
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aucun service configuré avec des formations
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {services.map((service) => (
              <div
                key={service.name}
                className="border rounded-lg overflow-hidden"
              >
                {/* En-tête du service */}
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      {service.totalEmployees} employé
                      {service.totalEmployees > 1 ? "s" : ""} •{" "}
                      {service.formations.length} formation
                      {service.formations.length > 1 ? "s" : ""} requise
                      {service.formations.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.globalPercentage === 100
                          ? "bg-green-100 text-green-700"
                          : service.globalPercentage >= 80
                            ? "bg-blue-100 text-blue-700"
                            : service.globalPercentage >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {service.globalPercentage}%
                    </div>
                    {service.globalPercentage === 100 && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Détail des formations */}
                {service.totalEmployees > 0 && (
                  <div className="p-3 space-y-2">
                    {service.formations.map((formation, formationIndex) => (
                      <div
                        key={`${service.name}-${formation.name}-${formationIndex}`}
                        className="flex items-center gap-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 truncate">
                              {formation.name}
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                formation.percentage === 100
                                  ? "text-green-600"
                                  : formation.percentage >= 80
                                    ? "text-blue-600"
                                    : formation.percentage >= 50
                                      ? "text-yellow-600"
                                      : "text-red-600"
                              }`}
                            >
                              {formation.employeesWithFormation}/
                              {formation.totalEmployees}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                formation.percentage === 100
                                  ? "bg-green-500"
                                  : formation.percentage >= 80
                                    ? "bg-blue-500"
                                    : formation.percentage >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                              }`}
                              style={{ width: `${formation.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
