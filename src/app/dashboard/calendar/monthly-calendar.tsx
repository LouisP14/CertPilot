"use client";

import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  MapPin,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  type: "session" | "expiration" | "blacklisted";
  date: string;
  endDate?: string;
  title: string;
  subtitle?: string;
  status?: string;
  color: string;
  data: Record<string, unknown>;
}

interface CalendarData {
  year: number;
  month: number | null;
  events: CalendarEvent[];
  stats: {
    totalSessions: number;
    totalParticipants: number;
    totalExpirations: number;
    expiredCount: number;
    upcomingExpirations: number;
    blacklistedDays: number;
  };
  constraints: {
    blacklistedDates: string[];
    allowedTrainingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    maxAbsentPerTeam: number;
    maxAbsentPerSite: number;
  };
}

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function MonthlyCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar?year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
    setSelectedEvent(null);
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
    setSelectedEvent(null);
  };

  const goToToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDay(null);
    setSelectedEvent(null);
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // Jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, ...)
    // On veut commencer par Lundi, donc on ajuste
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: Array<{
      date: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
      isBlocked: boolean;
      events: CalendarEvent[];
    }> = [];

    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month - 1 === 0 ? 12 : month - 1;
      const prevYear = month - 1 === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: false,
        isBlocked: false,
        events: [],
      });
    }

    // Jours du mois actuel
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Vérifier si le jour est bloqué
      const isBlocked =
        calendarData?.constraints.blacklistedDates.includes(dateStr) || false;

      // Vérifier si le jour de la semaine est autorisé pour les formations
      let isDayNotAllowed = false;
      if (calendarData?.constraints.allowedTrainingDays) {
        const dayMapping: Record<
          number,
          keyof typeof calendarData.constraints.allowedTrainingDays
        > = {
          1: "monday",
          2: "tuesday",
          3: "wednesday",
          4: "thursday",
          5: "friday",
          6: "saturday",
          0: "sunday",
        };
        isDayNotAllowed =
          !calendarData.constraints.allowedTrainingDays[dayMapping[dayOfWeek]];
      }

      // Événements du jour
      const dayEvents =
        calendarData?.events.filter((e) => e.date === dateStr) || [];

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend,
        isBlocked: isBlocked || isDayNotAllowed,
        events: dayEvents,
      });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines max
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month + 1 > 12 ? 1 : month + 1;
      const nextYear = month + 1 > 12 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: false,
        isBlocked: false,
        events: [],
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedDayEvents =
    calendarDays.find((d) => d.date === selectedDay)?.events || [];

  const getEventColor = (event: CalendarEvent) => {
    switch (event.type) {
      case "session":
        return event.color === "purple" ? "bg-purple-500" : "bg-[#173B56]";
      case "expiration":
        if (event.color === "red") return "bg-red-500";
        if (event.color === "amber") return "bg-amber-500";
        return "bg-slate-400";
      case "blacklisted":
        return "bg-slate-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="rounded-xl p-2 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-[#173B56] min-w-[180px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            onClick={goToNextMonth}
            className="rounded-xl p-2 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={goToToday}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#173B56] hover:bg-slate-50 transition-colors shadow-sm"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#173B56]" />
            <span className="text-slate-600">Session INTER</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-slate-600">Session INTRA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-slate-600">Expiration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-slate-600">Expiré</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-slate-300" />
            <span className="text-slate-600">Jour bloqué</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {calendarData && (
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173B56]/10">
                <GraduationCap className="h-4 w-4 text-[#173B56]" />
              </div>
              <span className="text-2xl font-bold text-[#173B56]">
                {calendarData.stats.totalSessions}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Sessions planifiées</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {calendarData.stats.totalParticipants}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Participants</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {calendarData.stats.upcomingExpirations}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Expirations &lt; 30j</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-red-600">
                {calendarData.stats.expiredCount}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Expirées</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <XCircle className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-2xl font-bold text-slate-600">
                {calendarData.stats.blacklistedDays}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Jours bloqués</p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Calendrier */}
        <div className="flex-1">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {DAY_NAMES.map((day, i) => (
                <div
                  key={day}
                  className={`py-3 text-center text-sm font-semibold ${
                    i >= 5 ? "text-gray-500" : "text-gray-800"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((dayInfo, index) => {
                  const hasEvents = dayInfo.events.length > 0;
                  const isSelected = selectedDay === dayInfo.date;

                  return (
                    <div
                      key={`${dayInfo.date}-${index}`}
                      onClick={() => {
                        if (dayInfo.isCurrentMonth) {
                          setSelectedDay(isSelected ? null : dayInfo.date);
                          setSelectedEvent(null);
                        }
                      }}
                      className={`
                        min-h-[100px] border-b border-r p-1 cursor-pointer transition-colors
                        ${!dayInfo.isCurrentMonth ? "bg-gray-50 text-gray-300" : ""}
                        ${dayInfo.isWeekend && dayInfo.isCurrentMonth ? "bg-gray-50/50" : ""}
                        ${dayInfo.isBlocked && dayInfo.isCurrentMonth ? "bg-gray-100" : ""}
                        ${dayInfo.isToday ? "bg-emerald-50" : ""}
                        ${isSelected ? "ring-2 ring-inset ring-emerald-500" : ""}
                        ${dayInfo.isCurrentMonth && !isSelected ? "hover:bg-gray-50" : ""}
                      `}
                    >
                      {/* Numéro du jour */}
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={`
                            inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium
                            ${dayInfo.isToday ? "bg-emerald-600 font-bold text-white" : ""}
                            ${!dayInfo.isCurrentMonth ? "text-gray-400" : "text-gray-900"}
                          `}
                        >
                          {dayInfo.day}
                        </span>
                        {dayInfo.isBlocked && dayInfo.isCurrentMonth && (
                          <XCircle className="h-4 w-4 text-gray-500" />
                        )}
                      </div>

                      {/* Événements */}
                      {hasEvents && dayInfo.isCurrentMonth && (
                        <div className="space-y-0.5">
                          {dayInfo.events.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                                setSelectedDay(dayInfo.date);
                              }}
                              className={`
                                truncate rounded px-1 py-0.5 text-xs text-white cursor-pointer
                                ${getEventColor(event)}
                                hover:opacity-80
                              `}
                              title={event.title}
                            >
                              {event.type === "session" && (
                                <GraduationCap className="mr-1 inline h-3 w-3" />
                              )}
                              {event.type === "expiration" && (
                                <Clock className="mr-1 inline h-3 w-3" />
                              )}
                              {event.title}
                            </div>
                          ))}
                          {dayInfo.events.length > 3 && (
                            <div className="text-xs text-gray-700 font-medium px-1">
                              +{dayInfo.events.length - 3} autres
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panneau latéral - Détails du jour sélectionné */}
        {selectedDay && (
          <div className="w-80 rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString(
                  "fr-FR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  },
                )}
              </h3>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedEvent(null);
                }}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun événement ce jour</p>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`
                      rounded-lg border p-3 cursor-pointer transition-colors
                      ${selectedEvent?.id === event.id ? "border-emerald-500 bg-emerald-50" : "hover:bg-gray-50"}
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 h-3 w-3 rounded-full ${getEventColor(event)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        {event.subtitle && (
                          <p className="text-sm text-gray-500 truncate">
                            {event.subtitle}
                          </p>
                        )}
                        {event.type === "session" && (
                          <Badge
                            className={`mt-1 ${
                              event.color === "purple"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {event.color === "purple" ? "INTRA" : "INTER"}
                          </Badge>
                        )}
                        {event.type === "expiration" && (
                          <Badge
                            className={`mt-1 ${
                              event.color === "red"
                                ? "bg-red-100 text-red-700"
                                : event.color === "amber"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {event.color === "red"
                              ? "Expiré"
                              : `Expire dans ${(event.data as { daysUntil: number }).daysUntil}j`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Détails de l'événement sélectionné */}
            {selectedEvent && (
              <div className="mt-4 border-t pt-4">
                <h4 className="mb-2 font-semibold text-gray-900">Détails</h4>

                {selectedEvent.type === "session" && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {(
                          selectedEvent.data as {
                            trainingCenter?: { name: string; city: string };
                          }
                        ).trainingCenter?.name || "Lieu à définir"}
                        {(
                          selectedEvent.data as {
                            trainingCenter?: { city: string };
                          }
                        ).trainingCenter?.city &&
                          ` • ${(selectedEvent.data as { trainingCenter: { city: string } }).trainingCenter.city}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {
                          (
                            (selectedEvent.data as { attendees?: unknown[] })
                              .attendees || []
                          ).length
                        }{" "}
                        participant(s)
                      </span>
                    </div>
                    {(selectedEvent.data as { totalCost?: number })
                      .totalCost && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Coût total :</span>
                        <span className="text-emerald-600 font-semibold">
                          {(
                            selectedEvent.data as { totalCost: number }
                          ).totalCost.toLocaleString("fr-FR")}{" "}
                          €
                        </span>
                      </div>
                    )}
                    <Link
                      href="/dashboard/sessions"
                      className="mt-2 block rounded-lg bg-emerald-600 px-3 py-2 text-center text-white hover:bg-emerald-700"
                    >
                      Voir la session
                    </Link>
                  </div>
                )}

                {selectedEvent.type === "expiration" && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="h-4 w-4" />
                      <span>
                        {
                          (
                            selectedEvent.data as {
                              formationType?: { name: string };
                            }
                          ).formationType?.name
                        }
                      </span>
                    </div>
                    {(selectedEvent.data as { department?: string })
                      .department && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>
                          Service :{" "}
                          {
                            (selectedEvent.data as { department: string })
                              .department
                          }
                        </span>
                      </div>
                    )}
                    <Link
                      href={`/dashboard/employees/${(selectedEvent.data as { employeeId: string }).employeeId}`}
                      className="mt-2 block rounded-lg bg-emerald-600 px-3 py-2 text-center text-white hover:bg-emerald-700"
                    >
                      Voir l'employé
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

