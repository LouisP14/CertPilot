import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileCheck,
  GraduationCap,
  PenTool,
  Send,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { AlertsTable } from "./alerts-table";
import { BudgetWidget } from "./budget-widget";
import { FormationCoverage } from "./formation-coverage";
import { ServiceCoverage } from "./service-coverage";

async function getStats() {
  const session = await auth();

  // Créer le filtre par companyId
  // IMPORTANT: Si pas de companyId et pas SUPER_ADMIN, utiliser un ID impossible pour ne rien retourner
  const companyFilter: { companyId?: string } = {};
  if (session?.user?.role === "SUPER_ADMIN") {
    // Super admin voit tout - pas de filtre
  } else if (session?.user?.companyId) {
    // Utilisateur normal avec une company
    companyFilter.companyId = session.user.companyId;
  } else {
    // Utilisateur sans company - ne devrait rien voir
    companyFilter.companyId = "no-company-access";
  }

  const [employeeCount, certificateCount, formationTypeCount] =
    await Promise.all([
      prisma.employee.count({ where: { isActive: true, ...companyFilter } }),
      prisma.certificate.count({
        where: { isArchived: false, employee: companyFilter },
      }),
      prisma.formationType.count({
        where: { isActive: true, ...companyFilter },
      }),
    ]);

  // Get certificates expiring soon
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Compter TOUS les certificats expirés et expirant (sans limite) - Employés et formations actifs uniquement
  const [expiredCount, expiringCount] = await Promise.all([
    prisma.certificate.count({
      where: {
        isArchived: false,
        expiryDate: {
          not: null,
          lt: now,
        },
        employee: {
          isActive: true,
          ...companyFilter,
        },
        formationType: {
          isActive: true,
          ...companyFilter,
        },
      },
    }),
    prisma.certificate.count({
      where: {
        isArchived: false,
        expiryDate: {
          not: null,
          gte: now,
          lte: in90Days,
        },
        employee: {
          isActive: true,
          ...companyFilter,
        },
        formationType: {
          isActive: true,
          ...companyFilter,
        },
      },
    }),
  ]);

  // Récupérer tous les certificats expirant pour la table d'alertes avec pagination
  const expiringCertificates = await prisma.certificate.findMany({
    where: {
      isArchived: false,
      expiryDate: {
        not: null,
        lte: in90Days,
      },
      employee: {
        isActive: true,
        ...companyFilter,
      },
      formationType: {
        isActive: true,
        ...companyFilter,
      },
    },
    include: {
      employee: true,
      formationType: true,
    },
    orderBy: {
      expiryDate: "asc",
    },
  });

  // Statistiques des signatures - utilisation de count pour éviter les problèmes de types
  const [
    pendingEmployee,
    pendingManager,
    completedSignatures,
    rejectedSignatures,
    toSendCount,
  ] = await Promise.all([
    prisma.passportSignature.count({
      where: { status: "PENDING_EMPLOYEE", employee: companyFilter },
    }),
    prisma.passportSignature.count({
      where: { status: "PENDING_MANAGER", employee: companyFilter },
    }),
    prisma.passportSignature.count({
      where: { status: "COMPLETED", employee: companyFilter },
    }),
    prisma.passportSignature.count({
      where: { status: "REJECTED", employee: companyFilter },
    }),
    // Employés sans signature initiée ou en brouillon
    prisma.employee.count({
      where: {
        isActive: true,
        ...companyFilter,
        OR: [
          { passportSignature: null },
          { passportSignature: { status: "DRAFT" } },
        ],
      },
    }),
  ]);

  // Couverture par type de formation
  const formationTypes = await prisma.formationType.findMany({
    where: { isActive: true, ...companyFilter },
    select: {
      id: true,
      name: true,
      category: true,
      service: true,
      certificates: {
        where: { isArchived: false },
        select: { employeeId: true },
      },
    },
  });

  const formationCoverage = formationTypes
    .map((ft) => ({
      id: ft.id,
      name: ft.name,
      category: ft.category,
      service: ft.service,
      trainedCount: new Set(ft.certificates.map((c) => c.employeeId)).size,
      totalEmployees: employeeCount,
      percentage:
        employeeCount > 0
          ? Math.round(
              (new Set(ft.certificates.map((c) => c.employeeId)).size /
                employeeCount) *
                100,
            )
          : 0,
    }))
    .sort((a, b) => b.trainedCount - a.trainedCount);

  // Conformité par service : les employés ont-ils les formations requises pour leur service ?
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      certificates: {
        where: { isArchived: false },
        select: {
          formationTypeId: true,
          formationType: {
            select: { name: true, service: true },
          },
        },
      },
    },
  });

  // Récupérer les formations requises par service (gère les services multiples séparés par virgule)
  const formationsParService: Record<string, { id: string; name: string }[]> =
    {};

  // Récupérer la liste de tous les services existants (départements des employés)
  const allServices = [
    ...new Set(employees.map((e) => e.department).filter(Boolean)),
  ] as string[];

  // Formations applicables à "Tous" les services
  const formationsTous: { id: string; name: string }[] = [];

  formationTypes.forEach((ft) => {
    if (ft.service) {
      const serviceValue = ft.service.trim().toLowerCase();

      // Si le service est "Tous", on l'applique à tous les services
      if (serviceValue === "tous" || serviceValue === "all") {
        formationsTous.push({ id: ft.id, name: ft.name });
      } else {
        // Séparer les services multiples (ex: "Maintenance,Production")
        const services = ft.service
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        services.forEach((serviceName) => {
          if (!formationsParService[serviceName]) {
            formationsParService[serviceName] = [];
          }
          formationsParService[serviceName].push({ id: ft.id, name: ft.name });
        });
      }
    }
  });

  // Ajouter les formations "Tous" à chaque service
  if (formationsTous.length > 0) {
    allServices.forEach((serviceName) => {
      if (!formationsParService[serviceName]) {
        formationsParService[serviceName] = [];
      }
      formationsTous.forEach((ft) => {
        // Éviter les doublons
        if (!formationsParService[serviceName].some((f) => f.id === ft.id)) {
          formationsParService[serviceName].push(ft);
        }
      });
    });
  }

  // Calculer la conformité par service
  const serviceCoverage = Object.entries(formationsParService)
    .map(([serviceName, requiredFormations]) => {
      // Employés de ce service
      const serviceEmployees = employees.filter(
        (e) => e.department === serviceName,
      );
      const totalEmployees = serviceEmployees.length;

      if (totalEmployees === 0) {
        return {
          name: serviceName,
          totalEmployees: 0,
          formations: requiredFormations.map((f) => ({
            name: f.name,
            employeesWithFormation: 0,
            totalEmployees: 0,
            percentage: 0,
          })),
          globalPercentage: 0,
        };
      }

      // Pour chaque formation requise, combien d'employés l'ont ?
      const formationsStats = requiredFormations.map((formation) => {
        const employeesWithFormation = serviceEmployees.filter((emp) =>
          emp.certificates.some((c) => c.formationTypeId === formation.id),
        ).length;

        return {
          name: formation.name,
          employeesWithFormation,
          totalEmployees,
          percentage: Math.round(
            (employeesWithFormation / totalEmployees) * 100,
          ),
        };
      });

      // Pourcentage global = moyenne des pourcentages de chaque formation
      const globalPercentage =
        formationsStats.length > 0
          ? Math.round(
              formationsStats.reduce((sum, f) => sum + f.percentage, 0) /
                formationsStats.length,
            )
          : 0;

      return {
        name: serviceName,
        totalEmployees,
        formations: formationsStats,
        globalPercentage,
      };
    })
    .sort((a, b) => b.totalEmployees - a.totalEmployees);

  return {
    employeeCount,
    certificateCount,
    formationTypeCount,
    expiringCertificates,
    expiredCount,
    expiringCount,
    pendingEmployee,
    pendingManager,
    completedSignatures,
    rejectedSignatures,
    toSendCount,
    formationCoverage,
    serviceCoverage,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">
          Vue d&apos;ensemble des passeports formation
        </p>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Employés"
          value={stats.employeeCount}
          icon={Users}
          href="/dashboard/employees"
        />
        <StatsCard
          title="Formations actives"
          value={stats.certificateCount}
          icon={GraduationCap}
          href="/dashboard/formations"
        />
        <StatsCard
          title="Expirent bientôt"
          value={stats.expiringCount}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Expirées"
          value={stats.expiredCount}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Stats Cards - Row 2: Signatures */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="À envoyer"
          value={stats.toSendCount}
          total={stats.employeeCount}
          icon={Send}
          color="blue"
          subtitle="Passeports"
          href="/dashboard/employees"
        />
        <StatsCard
          title="En attente employé"
          value={stats.pendingEmployee}
          total={stats.employeeCount}
          icon={Clock}
          color="yellow"
          subtitle="Signatures"
        />
        <StatsCard
          title="En attente responsable"
          value={stats.pendingManager}
          total={stats.employeeCount}
          icon={PenTool}
          color="yellow"
          subtitle="Signatures"
        />
        <StatsCard
          title="Passeports validés"
          value={stats.completedSignatures}
          total={stats.employeeCount}
          icon={FileCheck}
          color="green"
          subtitle="Signatures"
        />
        <StatsCard
          title="Passeports rejetés"
          value={stats.rejectedSignatures}
          total={stats.employeeCount}
          icon={XCircle}
          color="red"
          subtitle="À reprendre"
        />
      </div>

      {/* Two columns layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coverage by Formation Type */}
        <FormationCoverage formations={stats.formationCoverage} />

        {/* Coverage by Service - Conformité */}
        <ServiceCoverage services={stats.serviceCoverage} />
      </div>

      {/* Budget Widget */}
      <BudgetWidget />

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertes - Formations à renouveler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.expiringCertificates.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>
                Aucune formation n&apos;expire dans les 90 prochains jours
              </span>
            </div>
          ) : (
            <AlertsTable certificates={stats.expiringCertificates} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  total,
  icon: Icon,
  color = "blue",
  href,
  subtitle,
}: {
  title: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "blue" | "green" | "yellow" | "red";
  href?: string;
  subtitle?: string;
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  const content = (
    <Card
      className={href ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
    >
      <CardContent className="flex items-center gap-4 p-6 h-24">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          {subtitle && (
            <p className="text-xs text-gray-400 leading-tight">{subtitle}</p>
          )}
          <p className="text-sm text-gray-500 leading-tight">{title}</p>
          <p className="text-2xl font-bold">
            {value}
            {total !== undefined && (
              <span className="text-lg font-normal text-gray-400">
                /{total}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
