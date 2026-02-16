"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { exportFullReportToPDF } from "@/lib/pdf-export";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Stats {
  totalEmployees: number;
  totalCertificates: number;
  expiringThisMonth: number;
  expired: number;
}

const excelExportLabels: Record<string, string> = {
  all: "Tous les employés et formations",
  expiring: "Formations expirant dans 90 jours",
  expired: "Formations expirées",
  employees: "Liste des employés uniquement",
};

const excelExportFileNames: Record<string, string> = {
  all: "passeport-formation-all",
  expiring: "passeport-formation-expiring",
  expired: "passeport-formation-expired",
  employees: "passeport-formation-employees",
};

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/export/excel?type=${exportType}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const datePart = new Date().toISOString().split("T")[0];
        const fileBaseName =
          excelExportFileNames[exportType] || "passeport-formation-all";
        a.download = `${fileBaseName}-${datePart}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoadingPdf(true);
    try {
      const response = await fetch("/api/export/pdf-data");
      if (response.ok) {
        const data = await response.json();
        exportFullReportToPDF(
          data.employees,
          stats || {
            totalEmployees: 0,
            totalCertificates: 0,
            expiringThisMonth: 0,
            expired: 0,
          },
          data.companyName || undefined,
        );
      }
    } catch (error) {
      console.error("PDF Export error:", error);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export</h1>
        <p className="text-gray-500">
          Exportez les données des passeports formation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Excel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Export Excel
            </CardTitle>
            <CardDescription>
              Téléchargez un fichier Excel (.xlsx) selon le type choisi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d&apos;export</label>
              <Select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
              >
                <option value="all">{excelExportLabels.all}</option>
                <option value="expiring">{excelExportLabels.expiring}</option>
                <option value="expired">{excelExportLabels.expired}</option>
                <option value="employees">{excelExportLabels.employees}</option>
              </Select>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p>
                Vous allez télécharger : <strong>{excelExportLabels[exportType]}</strong>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Nom du fichier :
                {` ${excelExportFileNames[exportType] || "passeport-formation-all"}-AAAA-MM-JJ.xlsx`}
              </p>
            </div>
            <Button
              onClick={handleExportExcel}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le fichier Excel (.xlsx)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              Export PDF
            </CardTitle>
            <CardDescription>Générez un rapport PDF imprimable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              <p>
                Génère un rapport PDF complet avec les statistiques et la liste
                de tous les employés avec leurs formations.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={loadingPdf || loadingStats}
              className="w-full"
            >
              {loadingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le rapport PDF
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Pour un passeport individuel, utilisez le QR code de
              l&apos;employé
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

