"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { exportCalendarToPDF } from "@/lib/pdf-export";
import { formatDate, getDaysUntilExpiry } from "@/lib/utils";
import { Calendar, FileDown, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Certificate {
  id: string;
  expiryDate: Date | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department: string | null;
  };
  formationType: {
    name: string;
    category: string | null;
  };
}

interface CalendarViewProps {
  groupedCertificates: Record<string, Certificate[]>;
  services: string[];
}

function getMonthName(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function isCurrentMonth(key: string): boolean {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return key === currentKey;
}

function isPastMonth(key: string): boolean {
  const now = new Date();
  const [year, month] = key.split("-");
  const keyDate = new Date(parseInt(year), parseInt(month) - 1);
  const currentDate = new Date(now.getFullYear(), now.getMonth());
  return keyDate < currentDate;
}

export function CalendarListView({
  groupedCertificates,
  services,
}: CalendarViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");

  // Filtrer les certificats
  const filteredGroupedCertificates = useMemo(() => {
    const result: Record<string, Certificate[]> = {};

    Object.entries(groupedCertificates).forEach(([monthKey, certificates]) => {
      const filtered = certificates.filter((cert) => {
        // Filtre par nom
        const fullName =
          `${cert.employee.firstName} ${cert.employee.lastName}`.toLowerCase();
        const matchesSearch =
          searchTerm === "" || fullName.includes(searchTerm.toLowerCase());

        // Filtre par service
        const matchesService =
          selectedService === "" ||
          cert.employee.department === selectedService;

        return matchesSearch && matchesService;
      });

      if (filtered.length > 0) {
        result[monthKey] = filtered;
      }
    });

    return result;
  }, [groupedCertificates, searchTerm, selectedService]);

  const months = Object.keys(filteredGroupedCertificates).sort();

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-[200px]">
              <Select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Tous les services</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                exportCalendarToPDF(filteredGroupedCertificates, {
                  search: searchTerm || undefined,
                  service: selectedService || undefined,
                })
              }
              disabled={months.length === 0}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
          {(searchTerm || selectedService) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span>
                {months.reduce(
                  (acc, key) => acc + filteredGroupedCertificates[key].length,
                  0,
                )}{" "}
                résultat(s)
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedService("");
                }}
                className="text-blue-600 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendrier */}
      {months.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>Aucune formation correspondant aux critères.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {months.map((monthKey) => {
            const certificates = filteredGroupedCertificates[monthKey];
            const isPast = isPastMonth(monthKey);
            const isCurrent = isCurrentMonth(monthKey);

            return (
              <Card
                key={monthKey}
                className={
                  isPast
                    ? "border-red-200 bg-red-50/50"
                    : isCurrent
                      ? "border-yellow-200 bg-yellow-50/50"
                      : ""
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Calendar
                      className={`h-5 w-5 ${
                        isPast
                          ? "text-red-500"
                          : isCurrent
                            ? "text-yellow-500"
                            : "text-blue-500"
                      }`}
                    />
                    {getMonthName(monthKey)}
                    <Badge
                      variant={
                        isPast ? "danger" : isCurrent ? "warning" : "secondary"
                      }
                    >
                      {certificates.length} expiration
                      {certificates.length > 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm table-fixed">
                      <thead>
                        <tr className="border-b text-left text-gray-700">
                          <th className="pb-2 font-semibold w-[100px]">Date</th>
                          <th className="pb-2 font-semibold w-[180px]">
                            Employé
                          </th>
                          <th className="pb-2 font-semibold w-[120px]">
                            Service
                          </th>
                          <th className="pb-2 font-semibold">Formation</th>
                          <th className="pb-2 font-semibold w-[120px]">
                            Catégorie
                          </th>
                          <th className="pb-2 font-semibold w-[100px] text-right">
                            Jours
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificates.map((cert) => {
                          const daysLeft = getDaysUntilExpiry(cert.expiryDate);

                          return (
                            <tr
                              key={cert.id}
                              className="border-b last:border-0"
                            >
                              <td className="py-2 font-medium text-gray-700">
                                {formatDate(cert.expiryDate)}
                              </td>
                              <td className="py-2">
                                <Link
                                  href={`/dashboard/employees/${cert.employee.id}`}
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  {cert.employee.lastName.toUpperCase()}{" "}
                                  {cert.employee.firstName}
                                </Link>
                              </td>
                              <td className="py-2">
                                <Link
                                  href={`/dashboard/employees?service=${encodeURIComponent(cert.employee.department || "")}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {cert.employee.department || "-"}
                                </Link>
                              </td>
                              <td className="py-2 text-gray-800">
                                {cert.formationType.name}
                              </td>
                              <td className="py-2">
                                {cert.formationType.category ? (
                                  <Badge variant="secondary">
                                    {cert.formationType.category}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-2 text-right">
                                <span
                                  className={
                                    daysLeft !== null && daysLeft < 0
                                      ? "font-semibold text-red-600"
                                      : daysLeft !== null && daysLeft <= 30
                                        ? "font-semibold text-amber-600"
                                        : "text-gray-600"
                                  }
                                >
                                  {daysLeft !== null
                                    ? daysLeft < 0
                                      ? `${Math.abs(daysLeft)}j de retard`
                                      : `${daysLeft}j`
                                    : "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
