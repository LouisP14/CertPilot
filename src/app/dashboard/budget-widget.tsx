"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportBudgetToPDF } from "@/lib/pdf-export";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Euro,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MonthData {
  month: number;
  name: string;
  spent: number;
  sessions: number;
}

interface QuarterData {
  quarter: number;
  name: string;
  spent: number;
  sessions: number;
}

interface SessionData {
  name: string;
  date: string;
  cost: number;
  participants: number;
  status: string;
}

interface BudgetData {
  year: number;
  currentMonth: number;
  constraints: {
    monthlyBudget: number | null;
    quarterlyBudget: number | null;
    annualBudget: number | null;
  } | null;
  monthly: MonthData[];
  quarterly: QuarterData[];
  annual: {
    spent: number;
    sessions: number;
  };
  sessions?: SessionData[];
}

export function BudgetWidget() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllMonths, setShowAllMonths] = useState(false);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const response = await fetch("/api/stats/budget");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Erreur chargement budget:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBudget();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-emerald-600" />
            Suivi du Budget Formation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-gray-400">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.constraints) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-emerald-600" />
            Suivi du Budget Formation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Aucun budget configuré.{" "}
            <a
              href="/dashboard/settings"
              className="text-blue-600 hover:underline"
            >
              Configurer les contraintes de planification
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    constraints,
    monthly,
    quarterly,
    annual,
    currentMonth,
    year,
    sessions,
  } = data;

  const handleExportPDF = () => {
    if (!data || !data.constraints) return;
    exportBudgetToPDF({
      year: data.year,
      constraints: data.constraints,
      monthly: data.monthly,
      quarterly: data.quarterly,
      annual: data.annual,
      sessions: data.sessions,
    });
  };

  const getPercentage = (spent: number, budget: number | null) => {
    if (!budget || budget === 0) return null;
    return Math.round((spent / budget) * 100);
  };

  const getStatusColor = (percentage: number | null) => {
    if (percentage === null) return "gray";
    if (percentage >= 100) return "red";
    if (percentage >= 80) return "orange";
    return "green";
  };

  const getStatusBg = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-100";
    if (percentage >= 100) return "bg-red-50";
    if (percentage >= 80) return "bg-orange-50";
    return "bg-green-50";
  };

  const getStatusIcon = (percentage: number | null) => {
    if (percentage === null) return null;
    if (percentage >= 100)
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    if (percentage >= 80)
      return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  };

  // Filtrer les mois avec des dépenses ou le mois courant
  const monthsWithActivity = monthly.filter(
    (m) => m.spent > 0 || m.month === currentMonth,
  );
  const displayedMonths = showAllMonths ? monthly : monthsWithActivity;

  const hasMonthlyBudget =
    constraints.monthlyBudget && constraints.monthlyBudget > 0;
  const hasQuarterlyBudget =
    constraints.quarterlyBudget && constraints.quarterlyBudget > 0;
  const hasAnnualBudget =
    constraints.annualBudget && constraints.annualBudget > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-emerald-600" />
            Suivi du Budget Formation {year}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-normal text-gray-500">
              {annual.sessions} session{annual.sessions > 1 ? "s" : ""}{" "}
              planifiée
              {annual.sessions > 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget annuel */}
        {hasAnnualBudget && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Budget Annuel
              </span>
              <div className="text-right">
                <span className="font-bold text-gray-900">
                  {annual.spent.toLocaleString("fr-FR")} €
                </span>
                <span className="text-gray-400"> / </span>
                <span className="text-gray-600">
                  {constraints.annualBudget!.toLocaleString("fr-FR")} €
                </span>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  getStatusColor(
                    getPercentage(annual.spent, constraints.annualBudget),
                  ) === "red"
                    ? "bg-red-500"
                    : getStatusColor(
                          getPercentage(annual.spent, constraints.annualBudget),
                        ) === "orange"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(getPercentage(annual.spent, constraints.annualBudget) || 0, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {getPercentage(annual.spent, constraints.annualBudget)}% utilisé
              </span>
              <span>
                Reste:{" "}
                {(constraints.annualBudget! - annual.spent).toLocaleString(
                  "fr-FR",
                )}{" "}
                €
              </span>
            </div>
          </div>
        )}

        {/* Budget mensuel par mois */}
        {hasMonthlyBudget && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Budget mensuel (
                {constraints.monthlyBudget!.toLocaleString("fr-FR")} € / mois)
              </span>
              <button
                onClick={() => setShowAllMonths(!showAllMonths)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                {showAllMonths ? (
                  <>
                    Réduire <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Voir tous les mois <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {displayedMonths.map((monthData) => {
                const percentage = getPercentage(
                  monthData.spent,
                  constraints.monthlyBudget,
                );
                const statusColor = getStatusColor(percentage);
                const isCurrentMonth = monthData.month === currentMonth;

                return (
                  <div
                    key={monthData.month}
                    className={`p-2 rounded-lg border ${
                      isCurrentMonth
                        ? "border-blue-300 bg-blue-50"
                        : getStatusBg(percentage)
                    } ${statusColor === "red" ? "border-red-200" : statusColor === "orange" ? "border-orange-200" : "border-gray-200"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium ${isCurrentMonth ? "text-blue-700" : "text-gray-600"}`}
                      >
                        {monthData.name.slice(0, 3)}
                        {isCurrentMonth && " •"}
                      </span>
                      {getStatusIcon(percentage)}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {monthData.spent.toLocaleString("fr-FR")} €
                    </div>
                    {monthData.sessions > 0 && (
                      <div className="text-xs text-gray-400">
                        {monthData.sessions} session
                        {monthData.sessions > 1 ? "s" : ""}
                      </div>
                    )}
                    {/* Mini progress bar */}
                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          statusColor === "red"
                            ? "bg-red-500"
                            : statusColor === "orange"
                              ? "bg-orange-500"
                              : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(percentage || 0, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Budget trimestriel */}
        {hasQuarterlyBudget && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">
              Budget trimestriel (
              {constraints.quarterlyBudget!.toLocaleString("fr-FR")} € /
              trimestre)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quarterly.map((q) => {
                const percentage = getPercentage(
                  q.spent,
                  constraints.quarterlyBudget,
                );
                const statusColor = getStatusColor(percentage);
                const isCurrentQuarter =
                  Math.floor(currentMonth / 3) + 1 === q.quarter;

                return (
                  <div
                    key={q.quarter}
                    className={`p-2 rounded-lg border ${
                      isCurrentQuarter
                        ? "border-blue-300 bg-blue-50"
                        : getStatusBg(percentage)
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium ${isCurrentQuarter ? "text-blue-700" : "text-gray-600"}`}
                      >
                        T{q.quarter}
                      </span>
                      {getStatusIcon(percentage)}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {q.spent.toLocaleString("fr-FR")} €
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          statusColor === "red"
                            ? "bg-red-500"
                            : statusColor === "orange"
                              ? "bg-orange-500"
                              : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(percentage || 0, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lien vers les sessions */}
        <div className="pt-2 border-t">
          <a
            href="/dashboard/sessions"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <TrendingUp className="h-4 w-4" />
            Voir toutes les sessions
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
