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
import {
  exportAlertsToPDF,
  exportCalendarToPDF,
  exportFormationCoverageToPDF,
  exportFullReportToPDF,
  exportServiceCoverageToPDF,
} from "@/lib/pdf-export";
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

interface ImportWarning {
  sheet: string;
  row: number;
  column: string;
  message: string;
  refType: string;
  refValue: string;
}

interface ReferenceToCreate {
  type: string;
  value: string;
}

interface ImportSummary {
  employeesToCreate: number;
  employeesToUpdate: number;
  formationsToCreate: number;
  formationsToUpdate: number;
  certificatesToCreate: number;
  referencesToCreate: number;
  totalErrors: number;
  totalWarnings: number;
}

interface ValidationResult {
  errors: ImportError[];
  warnings: ImportWarning[];
  referencesToCreate: ReferenceToCreate[];
  summary: ImportSummary;
}

interface ImportStats {
  employeesCreated: number;
  employeesUpdated: number;
  formationsCreated: number;
  formationsUpdated: number;
  certificatesCreated: number;
  referencesCreated: number;
}

const excelExportLabels: Record<string, string> = {
  all: "Tous les employés et formations",
  expiring: "Formations expirant dans 90 jours",
  expired: "Formations expirées",
  employees: "Liste des employés uniquement",
  services: "Synthese par service",
  formations: "Synthese par type de formation",
};

const excelExportFileNames: Record<string, string> = {
  all: "passeport-formation-all",
  expiring: "passeport-formation-expiring",
  expired: "passeport-formation-expired",
  employees: "passeport-formation-employees",
  services: "synthese-services",
  formations: "synthese-formations",
};

type PdfExportType = "full_report" | "alerts" | "calendar" | "coverage_formations" | "coverage_services";

const pdfExportLabels: Record<PdfExportType, string> = {
  full_report: "Rapport complet",
  alerts: "Alertes expirations",
  calendar: "Calendrier des echeances",
  coverage_formations: "Couverture par formation",
  coverage_services: "Conformite par service",
};

type ImportStep =
  | "idle"
  | "validating"
  | "preview"
  | "importing"
  | "done"
  | "error";

export default function ExportPage() {
  // ── Export state ──
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [pdfType, setPdfType] = useState<PdfExportType>("full_report");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Import state ──
  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
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
      const response = await fetch(`/api/export/pdf-data?type=${pdfType}`);
      if (!response.ok) return;
      const data = await response.json();

      const statsData = stats ?? { totalEmployees: 0, totalCertificates: 0, expiringThisMonth: 0, expired: 0 };

      switch (pdfType) {
        case "full_report":
          exportFullReportToPDF(data.employees, statsData, data.companyName ?? undefined);
          break;
        case "alerts":
          exportAlertsToPDF(data.certificates);
          break;
        case "calendar":
          exportCalendarToPDF(data.groupedCertificates);
          break;
        case "coverage_formations":
          exportFormationCoverageToPDF(data.formations);
          break;
        case "coverage_services":
          exportServiceCoverageToPDF(data.services);
          break;
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

  const handleFileSelect = useCallback(async (file: File) => {
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
  }, []);

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
              Importez vos employés, formations et certificats en masse depuis
              un fichier Excel au format CertPilot.
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
              <p className="text-xs text-gray-500">
                Format .xlsx uniquement — 10 Mo maximum
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
                disabled={
                  importStep === "validating" || importStep === "importing"
                }
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
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                      <p className="text-xs text-blue-600">
                        Employés à mettre à jour
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {validationResult.summary.formationsToCreate}
                      </p>
                      <p className="text-xs text-green-600">
                        Formations à créer
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {validationResult.summary.formationsToUpdate}
                      </p>
                      <p className="text-xs text-blue-600">
                        Formations à mettre à jour
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3 text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {validationResult.summary.certificatesToCreate}
                      </p>
                      <p className="text-xs text-purple-600">
                        Certificats à créer
                      </p>
                    </div>
                    <div
                      className={`rounded-lg p-3 text-center ${
                        validationResult.summary.referencesToCreate > 0
                          ? "bg-amber-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold ${
                          validationResult.summary.referencesToCreate > 0
                            ? "text-amber-700"
                            : "text-gray-400"
                        }`}
                      >
                        {validationResult.summary.referencesToCreate}
                      </p>
                      <p
                        className={`text-xs ${
                          validationResult.summary.referencesToCreate > 0
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        Référentiel(s) à créer
                      </p>
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

                {/* Références à auto-créer (warnings) */}
                {validationResult.referencesToCreate &&
                  validationResult.referencesToCreate.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                        <AlertTriangle className="h-4 w-4" />
                        {validationResult.referencesToCreate.length}{" "}
                        référentiel(s) seront créés automatiquement dans vos
                        Paramètres
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {validationResult.referencesToCreate.map((ref, idx) => {
                          const typeLabel: Record<string, string> = {
                            FUNCTION: "Fonction",
                            SERVICE: "Service",
                            SITE: "Site",
                            TEAM: "Équipe",
                          };
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                            >
                              {typeLabel[ref.type] || ref.type} : {ref.value}
                            </span>
                          );
                        })}
                      </div>
                      <p className="text-xs text-amber-700">
                        Ces valeurs seront ajoutées à vos référentiels
                        (Paramètres &gt; Services, Fonctions, Sites, Équipes)
                        lors de la confirmation.
                      </p>
                    </div>
                  )}

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
                  {validationResult.errors.length === 0 &&
                  hasSomethingToImport ? (
                    <Button
                      onClick={handleConfirmImport}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmer l&apos;import
                    </Button>
                  ) : validationResult.errors.length === 0 &&
                    !hasSomethingToImport ? (
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
                      {importStats.formationsUpdated} formation(s) mise(s) à
                      jour
                    </p>
                  )}
                  {importStats.certificatesCreated > 0 && (
                    <p>
                      {importStats.certificatesCreated} certificat(s) créé(s)
                    </p>
                  )}
                  {importStats.referencesCreated > 0 && (
                    <p>
                      {importStats.referencesCreated} référentiel(s) créé(s)
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
                <label className="text-sm font-medium">
                  Type d&apos;export
                </label>
                <Select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                >
                  <option value="all">{excelExportLabels.all}</option>
                  <option value="expiring">{excelExportLabels.expiring}</option>
                  <option value="expired">{excelExportLabels.expired}</option>
                  <option value="employees">
                    {excelExportLabels.employees}
                  </option>
                  <option value="services">{excelExportLabels.services}</option>
                  <option value="formations">{excelExportLabels.formations}</option>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de rapport</label>
                <Select
                  value={pdfType}
                  onChange={(e) => setPdfType(e.target.value as PdfExportType)}
                >
                  {(Object.entries(pdfExportLabels) as [PdfExportType, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <p>
                  Vous allez générer :{" "}
                  <strong>{pdfExportLabels[pdfType]}</strong>
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

        {/* Passeport de Prévention */}
        <PasseportPreventionExport />
      </div>
    </div>
  );
}

// ============================================================
// PASSEPORT DE PRÉVENTION — Export CSV au format officiel État
// Spec : Caisse des Dépôts, ADF v. 27/02/2026
// Obligation employeur : 16 mars 2026 → pleine au 1er oct 2026
// ============================================================

interface PPStats {
  totalConcerned: number;
  exportable: number;
  skipped: number;
  alreadyDeclared: number;
  employeesWithoutNir: number;
}

interface PPBatch {
  declarationRef: string;
  declaredAt: string;
  count: number;
  certificates: Array<{
    id: string;
    employeeName: string;
    employeeMatricule: string;
    formationName: string;
  }>;
}

function PasseportPreventionExport() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(String(currentYear));
  const [trimestre, setTrimestre] = useState<string>("");
  const [ppStats, setPpStats] = useState<PPStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  // État post-download : déclenche le modal de confirmation
  const [pendingDeclaration, setPendingDeclaration] = useState<{
    declarationRef: string;
    count: number;
    period: { year: string; trimestre: string };
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Historique
  const [history, setHistory] = useState<PPBatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const params = new URLSearchParams({ stats: "1" });
      if (year) params.set("year", year);
      if (trimestre) params.set("trimestre", trimestre);
      const res = await fetch(
        `/api/export/passeport-prevention?${params.toString()}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPpStats(data);
      }
    } catch (err) {
      console.error("PP stats error:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [year, trimestre]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/export/passeport-prevention/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.batches || []);
      }
    } catch (err) {
      console.error("PP history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory, fetchHistory]);

  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const params = new URLSearchParams();
      if (year) params.set("year", year);
      if (trimestre) params.set("trimestre", trimestre);
      const res = await fetch(
        `/api/export/passeport-prevention?${params.toString()}`,
      );
      if (!res.ok) {
        throw new Error("Erreur lors de la génération du CSV");
      }

      const declarationRef = res.headers.get("X-PP-Declaration-Ref") || "";
      const exportableCount = parseInt(
        res.headers.get("X-PP-Exportable") || "0",
        10,
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const datePart = new Date().toISOString().split("T")[0];
      const periodPart = year ? `_${year}${trimestre ? `_${trimestre}` : ""}` : "";
      a.download = `passeport-prevention-adf${periodPart}_${datePart}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      // Déclenche le modal de confirmation si des déclarations ont été générées
      if (declarationRef && exportableCount > 0) {
        setPendingDeclaration({
          declarationRef,
          count: exportableCount,
          period: { year, trimestre },
        });
      }
    } catch (err) {
      console.error("Export PP error:", err);
    } finally {
      setLoadingExport(false);
    }
  };

  const handleConfirmDeposit = async () => {
    if (!pendingDeclaration) return;
    setConfirming(true);
    try {
      const res = await fetch(
        "/api/export/passeport-prevention/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            declarationRef: pendingDeclaration.declarationRef,
            year: pendingDeclaration.period.year || null,
            trimestre: pendingDeclaration.period.trimestre || null,
          }),
        },
      );
      if (!res.ok) {
        throw new Error("Erreur lors de la confirmation");
      }
      setPendingDeclaration(null);
      await fetchStats();
      if (showHistory) await fetchHistory();
    } catch (err) {
      console.error("Confirm PP error:", err);
    } finally {
      setConfirming(false);
    }
  };

  const handleUndoBatch = async (declarationRef: string) => {
    if (
      !window.confirm(
        "Annuler cette déclaration ? Les formations redeviendront 'à déclarer'.",
      )
    )
      return;
    try {
      const res = await fetch("/api/export/passeport-prevention/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationRef }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'annulation");
      await Promise.all([fetchStats(), fetchHistory()]);
    } catch (err) {
      console.error("Undo PP error:", err);
    }
  };

  const hasNoData = ppStats !== null && ppStats.totalConcerned === 0;
  const canExport =
    ppStats !== null && ppStats.exportable > 0 && !loadingExport;

  return (
    <>
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Nouveau — obligation 1er octobre 2026
                </span>
              </div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Passeport de Prévention
              </CardTitle>
              <CardDescription className="mt-2">
                Générez le fichier CSV au format officiel de la Caisse des
                Dépôts pour l&apos;import en masse des attestations de
                formation (ADF). Déclaration obligatoire en santé-sécurité
                au travail (décret n° 2025-748).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Année
              </label>
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value={String(currentYear)}>{currentYear}</option>
                <option value={String(currentYear - 1)}>
                  {currentYear - 1}
                </option>
                <option value={String(currentYear - 2)}>
                  {currentYear - 2}
                </option>
                <option value="">Toutes les années</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Trimestre (optionnel)
              </label>
              <Select
                value={trimestre}
                onChange={(e) => setTrimestre(e.target.value)}
              >
                <option value="">Année complète</option>
                <option value="Q1">T1 (janv. - mars)</option>
                <option value="Q2">T2 (avril - juin)</option>
                <option value="Q3">T3 (juil. - sept.)</option>
                <option value="Q4">T4 (oct. - déc.)</option>
              </Select>
            </div>
          </div>

          {/* Stats */}
          {loadingStats ? (
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calcul des certificats à déclarer...
            </div>
          ) : ppStats ? (
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-xs font-semibold text-emerald-700">
                    À déclarer (prêtes)
                  </div>
                  <div className="mt-1 text-2xl font-bold text-emerald-900">
                    {ppStats.exportable}
                  </div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="text-xs font-semibold text-blue-700">
                    Déjà déclarées
                  </div>
                  <div className="mt-1 text-2xl font-bold text-blue-900">
                    {ppStats.alreadyDeclared}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="text-xs font-semibold text-amber-700">
                    En attente (NIR manquant)
                  </div>
                  <div className="mt-1 text-2xl font-bold text-amber-900">
                    {ppStats.skipped}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-600">
                    Total concernées
                  </div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">
                    {ppStats.totalConcerned}
                  </div>
                </div>
              </div>
              {ppStats.employeesWithoutNir > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <strong>{ppStats.employeesWithoutNir}</strong>{" "}
                    employé(s) ont des formations concernées non-déclarées
                    mais n&apos;ont pas de NIR renseigné. Leurs formations
                    ne seront pas exportées. Complétez leur fiche employé.
                  </div>
                </div>
              )}
              {hasNoData && (
                <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    Aucune formation concernée par le Passeport de
                    Prévention sur cette période. Cochez la case
                    &laquo;&nbsp;Concernée par le Passeport de
                    Prévention&nbsp;&raquo; dans le catalogue des formations.
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <Button
            onClick={handleExport}
            disabled={!canExport}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {loadingExport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération du CSV...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Télécharger le CSV Passeport Prévention
              </>
            )}
          </Button>
          <p className="text-center text-xs text-gray-500">
            Format : séparateur <code>|</code>, UTF-8 — à déposer sur
            prevention.moncompteformation.gouv.fr (dépôt de fichier
            disponible à partir du 9 juillet 2026)
          </p>

          {/* Historique */}
          <div className="border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 hover:text-[#173B56]"
            >
              <span>Historique des déclarations</span>
              <span className="text-xs text-gray-500">
                {showHistory ? "▲ Masquer" : "▼ Afficher"}
              </span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {loadingHistory ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement...
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aucune déclaration confirmée pour l&apos;instant.
                  </p>
                ) : (
                  history.map((batch) => (
                    <div
                      key={batch.declarationRef}
                      className="rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#173B56]">
                              {new Date(batch.declaredAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              {batch.count} déclaration(s)
                            </span>
                          </div>
                          <p className="mt-0.5 font-mono text-xs text-gray-400">
                            {batch.declarationRef}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUndoBatch(batch.declarationRef)}
                          className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal post-download : demande confirmation du dépôt */}
      {pendingDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#173B56]">
              ✅ CSV téléchargé
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Vous venez de télécharger{" "}
              <strong>
                {pendingDeclaration.count} déclaration(s)
              </strong>{" "}
              au format Passeport de Prévention.
            </p>

            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p className="font-semibold text-emerald-800">
                Prochaine étape :
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-emerald-800">
                <li>
                  Connectez-vous sur{" "}
                  <a
                    href="https://prevention.moncompteformation.gouv.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-emerald-900"
                  >
                    prevention.moncompteformation.gouv.fr
                  </a>
                </li>
                <li>Espace Employeur → Import en masse</li>
                <li>Déposez le fichier CSV téléchargé</li>
              </ol>
            </div>

            <p className="mt-4 text-sm text-gray-700">
              Une fois le dépôt effectué sur la plateforme officielle,
              cliquez sur <strong>&laquo;&nbsp;Marquer comme
              déclarées&nbsp;&raquo;</strong> pour retirer ces formations de
              votre liste &laquo;&nbsp;à déclarer&nbsp;&raquo;.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setPendingDeclaration(null)}
                disabled={confirming}
              >
                Pas encore déposé
              </Button>
              <Button
                onClick={handleConfirmDeposit}
                disabled={confirming}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {confirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marquer comme déclarées
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
