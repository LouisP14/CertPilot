"use client";

import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

interface Alert {
  id: string;
  employeeId: string;
  employeeName: string;
  formationName: string;
  expiryDate: string;
  daysLeft: number;
  status: "expired" | "expiring";
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position: string;
  department: string;
}

export function Header({ user }: HeaderProps) {
  // Utiliser useSession pour un nom/email réactif (mis à jour après édition profil)
  const { data: sessionData } = useSession();
  const displayName = sessionData?.user?.name || user?.name || "Administrateur";
  const displayEmail = sessionData?.user?.email || user?.email || "";

  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    }
  };

  // Search employees
  const searchEmployees = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/employees/search?q=${encodeURIComponent(query)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchEmployees(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchNotifications();

    // Polling pour les alertes et notifications toutes les 10 secondes
    const interval = setInterval(() => {
      fetchAlerts();
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Badge rouge (gauche) : alertes formations + passeports rejetés
  const rejectedNotifs = unreadNotifications.filter(
    (n) => n.type === "SIGNATURE_REJECTED",
  );
  const redBadgeCount = alerts.length + rejectedNotifs.length;

  // Badge bleu (droite) : passeports validés
  const validatedNotifs = unreadNotifications.filter(
    (n) => n.type === "SIGNATURE_COMPLETED",
  );
  const blueBadgeCount = validatedNotifs.length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            type="search"
            placeholder="Rechercher un employé..."
            className="w-80 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() =>
              searchQuery.length >= 2 && setShowSearchResults(true)
            }
          />

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
              {searchLoading ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  Recherche...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  Aucun employé trouvé
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((employee) => (
                    <Link
                      key={employee.id}
                      href={`/dashboard/employees/${employee.id}`}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B56]/10 font-semibold text-[#173B56] text-sm">
                        {employee.firstName[0]}
                        {employee.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">
                          {employee.lastName} {employee.firstName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {employee.position} • {employee.department}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                        {employee.employeeId}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {/* Badge rouge (gauche) - Alertes + Rejets */}
            {redBadgeCount > 0 && (
              <span className="absolute left-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {redBadgeCount > 9 ? "9+" : redBadgeCount}
              </span>
            )}
            {/* Badge bleu (droite) - Validations */}
            {blueBadgeCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">
                {blueBadgeCount > 9 ? "9+" : blueBadgeCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              {/* Panel */}
              <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                  <h3 className="font-semibold text-[#173B56]">
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={async () => {
                          await fetch("/api/notifications", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ markAllRead: true }),
                          });
                          fetchNotifications();
                        }}
                        className="text-xs text-[#173B56] hover:text-[#1e4a6b] flex items-center gap-1 font-medium"
                        title="Marquer tout comme lu"
                      >
                        <Check className="h-3 w-3" />
                        Tout lu
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-slate-500">
                      Chargement...
                    </div>
                  ) : unreadNotifications.length === 0 &&
                    alerts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p>Aucune notification</p>
                      <p className="text-xs">Tout est à jour</p>
                    </div>
                  ) : (
                    <div>
                      {/* Notifications de signature */}
                      {unreadNotifications.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Signatures ({unreadNotifications.length})
                          </div>
                          <div className="divide-y">
                            {unreadNotifications.map((notif) => (
                              <Link
                                key={`notif-${notif.id}`}
                                href={notif.link || "/dashboard"}
                                onClick={async () => {
                                  setShowNotifications(false);
                                  // Marquer comme lue
                                  await fetch("/api/notifications", {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: notif.id }),
                                  });
                                  fetchNotifications();
                                }}
                                className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors bg-blue-50/50"
                              >
                                <div
                                  className={`mt-0.5 rounded-full p-1 ${
                                    notif.type === "SIGNATURE_REJECTED"
                                      ? "bg-red-100"
                                      : "bg-green-100"
                                  }`}
                                >
                                  {notif.type === "SIGNATURE_REJECTED" ? (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 text-sm">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleString(
                                      "fr-FR",
                                    )}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alertes de formation - section informative */}
                      {alerts.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-amber-50 text-xs font-semibold text-amber-700 uppercase tracking-wide">
                            Formations à renouveler ({alerts.length})
                          </div>
                          <div className="divide-y divide-slate-100">
                            {alerts.slice(0, 5).map((alert) => (
                              <Link
                                key={`alert-${alert.id}`}
                                href={`/dashboard/employees/${alert.employeeId}`}
                                onClick={() => setShowNotifications(false)}
                                className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
                              >
                                <div
                                  className={`mt-0.5 rounded-full p-1.5 ${
                                    alert.status === "expired"
                                      ? "bg-red-100"
                                      : "bg-amber-100"
                                  }`}
                                >
                                  {alert.status === "expired" ? (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 text-sm">
                                    {alert.formationName}
                                  </p>
                                  <p className="text-xs text-slate-600 truncate">
                                    {alert.employeeName}
                                  </p>
                                  <p
                                    className={`text-xs font-medium mt-1 ${
                                      alert.status === "expired"
                                        ? "text-red-600"
                                        : "text-amber-600"
                                    }`}
                                  >
                                    {alert.status === "expired"
                                      ? `Expiré depuis ${Math.abs(alert.daysLeft)} jours`
                                      : `Expire dans ${alert.daysLeft} jours`}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {(unreadNotifications.length > 0 || alerts.length > 0) && (
                  <div className="border-t border-slate-100 p-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowNotifications(false)}
                      className="block text-center text-sm font-medium text-[#173B56] hover:text-[#1e4a6b] transition-colors"
                    >
                      Voir le tableau de bord
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173B56]/10">
            <User className="h-4 w-4 text-[#173B56]" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-[#173B56]">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">{displayEmail}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
