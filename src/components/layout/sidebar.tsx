"use client";

import { cn } from "@/lib/utils";
import {
  Award,
  Building2,
  Calendar,
  CalendarCheck,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Shield,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Employés", href: "/dashboard/employees", icon: Users },
  { name: "Formations", href: "/dashboard/formations", icon: Award },
  { name: "Besoins", href: "/dashboard/training-needs", icon: Target },
  { name: "Sessions", href: "/dashboard/sessions", icon: CalendarCheck },
  { name: "Centres", href: "/dashboard/training-centers", icon: Building2 },
  { name: "Convocations", href: "/dashboard/convocations", icon: Mail },
  { name: "Vue Calendaire", href: "/dashboard/calendar", icon: Calendar },
  { name: "Import / Export", href: "/dashboard/export", icon: FileText },
  { name: "Audit Trail", href: "/dashboard/audit", icon: History },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  // Afficher "Administration" uniquement pour les SUPER_ADMIN
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  return (
    <div className="flex h-full w-64 flex-col bg-linear-to-b from-[#173B56] via-[#1e4a6b] to-[#0f2a3d] relative overflow-hidden">
      {/* Motifs décoratifs subtils */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -right-20 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10 border-b border-white/10 px-4 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            CertPilot
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "text-emerald-400")}
              />
              {item.name}
            </Link>
          );
        })}

        {/* Lien Administration pour SUPER_ADMIN uniquement */}
        {isSuperAdmin && (
          <>
            <div className="my-4 border-t border-white/10" />
            <Link
              href="/dashboard/admin/demandes"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard/admin/demandes"
                  ? "bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                  : "text-purple-300/70 hover:bg-white/5 hover:text-purple-300",
              )}
            >
              <Mail className="h-5 w-5" />
              Demandes
            </Link>
            <Link
              href="/dashboard/admin/clients"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === "/dashboard/admin/clients"
                  ? "bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                  : "text-purple-300/70 hover:bg-white/5 hover:text-purple-300",
              )}
            >
              <ShieldCheck className="h-5 w-5" />
              Gestion Clients
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
