"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, List, Loader2 } from "lucide-react";
import { Suspense, useState } from "react";
import MonthlyCalendar from "./monthly-calendar";

// Import dynamique pour l'ancienne vue liste
import dynamic from "next/dynamic";
const CalendarListView = dynamic(
  () => import("./calendar-list-view").then((mod) => mod.CalendarListView),
  {
    loading: () => (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    ),
  },
);

type ViewMode = "calendar" | "list";

interface CalendarPageClientProps {
  groupedCertificates: Record<
    string,
    Array<{
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
    }>
  >;
  services: string[];
}

export default function CalendarPageClient({
  groupedCertificates,
  services,
}: CalendarPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  return (
    <div className="space-y-6">
      {/* Header avec switch de vue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#173B56]">
            Planning & Calendrier
          </h1>
          <p className="text-slate-500">
            Visualisez les sessions planifiées et les échéances des formations
          </p>
        </div>

        {/* Toggle vue */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              viewMode === "calendar"
                ? "bg-[#173B56] text-white shadow-md"
                : "text-slate-600 hover:text-[#173B56] hover:bg-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Calendrier
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              viewMode === "list"
                ? "bg-[#173B56] text-white shadow-md"
                : "text-slate-600 hover:text-[#173B56] hover:bg-white"
            }`}
          >
            <List className="h-4 w-4" />
            Liste
          </button>
        </div>
      </div>

      {/* Contenu */}
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </CardContent>
          </Card>
        }
      >
        {viewMode === "calendar" ? (
          <MonthlyCalendar />
        ) : (
          <CalendarListView
            groupedCertificates={groupedCertificates}
            services={services}
          />
        )}
      </Suspense>
    </div>
  );
}

