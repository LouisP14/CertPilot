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
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Stats {
  totalEmployees: number;
  totalCertificates: number;
  expiringThisMonth: number;
  expired: number;
}

interface ImportError {
  sheet: string;
  row: number;
  column: string;
  message: string;
}

interface ImportSummary {
  employeesToCreate: number;
  employeesToUpdate: number;
  formationsToCreate: number;
  formationsToUpdate: number;
  certificatesToCreate: number;
  totalErrors: number;
}

interface ValidationResult {
  errors: ImportError[];
  summary: ImportSummary;
}

interface ImportStats {
  employeesCreated: number;
  employeesUpdated: number;
  formationsCreated: number;
  formationsUpdated: number;
  certificatesCreated: number;
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

type ImportStep = "idle" | "validating" | "preview" | "importing" | "done" | "error";

export default function ExportPage() {
  // ── Export state ──
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Import state ──
  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ── Export handlers ──

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

  // ── Import handlers ──

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await fetch("/api/import/template");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certpilot-template-import-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error("Template download error:", error);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      setImportFile(file);
      setImportStep("validating");
      setImportError(null);
      setValidationResult(null);
      setImportStats(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/import/validate?mode=validate", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setImportStep("error");
          setImportError(data.error || "Erreur lors de la validation");
          return;
        }

        setValidationResult(data);
        setImportStep("preview");
      } catch (error) {
        console.error("Validation error:", error);
        setImportStep("error");
        setImportError("Erreur de connexion lors de la validation");
      }
    },
    [],
  );

  const handleConfirmImport = async () => {
    if (!importFile) return;

    setImportStep("importing");
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await fetch("/api/import/validate?mode=confirm", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setImportStep("error");
        setImportError(data.error || "Erreur lors de l'import");
        return;
      }

      setImportStats(data.stats);
      setImportStep("done");
    } catch (error) {
      console.error("Import error:", error);
      setImportStep("error");
      setImportError("Erreur de connexion lors de l'import");
    }
  };

  const handleReset = () => {
    setImportStep("idle");
    setImportFile(null);
    setValidationResult(null);
    setImportStats(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasSomethingToImport = validationResult
    ? validationResult.summary.employeesToCreate > 0 ||
      validationResult.summary.employeesToUpdate > 0 ||
      validationResult.summary.formationsToCreate > 0 ||
      validationResult.summary.formationsToUpdate > 0 ||
      validationResult.summary.certificatesToCreate > 0
    : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-gray-500">
          Importez ou exportez les données de vos passeports formation
        </p>
      </div>

      {/* ══════════════ SECTION IMPORT ══════════════ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Import Excel
        </h2>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Importer depuis un fichier Excel
            </CardTitle>
            <CardDescription>
              Importez vos employés, formations et certificats en masse depuis un
              fichier Excel au format CertPilot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Étape 1 : Télécharger le template */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 space-y-3">
              <p className="text-sm font-medium text-blue-900">
                Étape 1 : Téléchargez le template CertPilot
              </p>
              <p className="text-xs text-blue-700">
                Ce fichier Excel contient 3 onglets pré-formatés (Employés,
                Formations, Certificats) avec les colonnes attendues et un
                exemple. Remplissez-le puis importez-le ci-dessous.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                {downloadingTemplate ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Télécharger le template
              </Button>
            </div>

            {/* Étape 2 : Upload du fichier */}
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Étape 2 : Importez votre fichier rempli
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:rounded-lg file:border-0
                  file:bg-blue-50 file:px-4 file:py-2
                  file:text-sm file:font-semibold file:text-blue-700
                  hover:file:bg-blue-100 file:cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                disabled={importStep === "validating" || importStep === "importing"}
              />
            </div>

            {/* État : validation en cours */}
            {importStep === "validating" && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyse du fichier en cours...</span>
              </div>
            )}

            {/* État : erreur */}
            {importStep === "error" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                  <XCircle className="h-5 w-5" />
                  Erreur
                </div>
                <p className="text-sm text-red-700">{importError}</p>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Recommencer
                </Button>
              </div>
            )}

            {/* État : preview / résultat de validation */}
            {importStep === "preview" && validationResult && (
              <div className="space-y-4">
                {/* Résumé */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Résultat de la validation
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {validationResult.summary.employeesToCreate}
                      </p>
                      <p className="text-xs text-green-600">Employés à créer</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {validationResult.summary.employeesToUpdate}
                      </p>
                      <p className="text-xs text-blue-600">Employés à mettre à jour</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {validationResult.summary.formationsToCreate}
                      </p>
                      <p className="text-xs text-green-600">Formations à créer</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {validationResult.summary.formationsToUpdate}
                      </p>
                      <p className="text-xs text-blue-600">Formations à mettre à jour</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3 text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {validationResult.summary.certificatesToCreate}
                      </p>
                      <p className="text-xs text-purple-600">Certificats à créer</p>
                    </div>
                    <div
                      className={`rounded-lg p-3 text-center ${
                        validationResult.summary.totalErrors > 0
                          ? "bg-red-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold ${
                          validationResult.summary.totalErrors > 0
                            ? "text-red-700"
                            : "text-gray-400"
                        }`}
                      >
                        {validationResult.summary.totalErrors}
                      </p>
                      <p
                        className={`text-xs ${
                          validationResult.summary.totalErrors > 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        Erreur(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liste des erreurs */}
                {validationResult.errors.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      {validationResult.errors.length} erreur(s) détectée(s) —
                      corrigez le fichier et réimportez
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {validationResult.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-red-700 py-1 border-b border-red-100 last:border-0"
                        >
                          <span className="font-medium">
                            [{err.sheet}] Ligne {err.row}, {err.column}
                          </span>
                          {" : "}
                          {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {validationResult.errors.length === 0 && hasSomethingToImport ? (
                    <Button onClick={handleConfirmImport} className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmer l&apos;import
                    </Button>
                  ) : validationResult.errors.length === 0 && !hasSomethingToImport ? (
                    <p className="text-sm text-gray-500">
                      Le fichier ne contient aucune donnée à importer.
                    </p>
                  ) : null}
                  <Button variant="outline" onClick={handleReset}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* État : import en cours */}
            {importStep === "importing" && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Import en cours... Ne fermez pas cette page.</span>
              </div>
            )}

            {/* État : import terminé */}
            {importStep === "done" && importStats && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Import terminé avec succès !
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-sm text-green-700">
                  {importStats.employeesCreated > 0 && (
                    <p>{importStats.employeesCreated} employé(s) créé(s)</p>
                  )}
                  {importStats.employeesUpdated > 0 && (
                    <p>{importStats.employeesUpdated} employé(s) mis à jour</p>
                  )}
                  {importStats.formationsCreated > 0 && (
                    <p>{importStats.formationsCreated} formation(s) créée(s)</p>
                  )}
                  {importStats.formationsUpdated > 0 && (
                    <p>
                      {importStats.formationsUpdated} formation(s) mise(s) à jour
                    </p>
                  )}
                  {importStats.certificatesCreated > 0 && (
                    <p>
                      {importStats.certificatesCreated} certificat(s) créé(s)
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Nouvel import
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══════════════ SECTION EXPORT ══════════════ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-green-600" />
          Export
        </h2>

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
                  Vous allez télécharger :{" "}
                  <strong>{excelExportLabels[exportType]}</strong>
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
              <CardDescription>
                Générez un rapport PDF imprimable
              </CardDescription>
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
    </div>
  );
}
