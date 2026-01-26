import prisma from "./prisma";

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isActive: boolean;
  trialEndsAt: Date | null;
  daysRemaining: number | null;
  plan: string | null;
  employeeLimit: number;
}

/**
 * Vérifie le statut de l'abonnement d'une entreprise
 */
export async function checkSubscription(
  companyId: string | null,
): Promise<SubscriptionInfo> {
  // Si pas de companyId (ancien user sans company), on considère comme actif
  if (!companyId) {
    return {
      status: "ACTIVE",
      isActive: true,
      trialEndsAt: null,
      daysRemaining: null,
      plan: "Legacy",
      employeeLimit: 9999,
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      trialEndsAt: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      employeeLimit: true,
    },
  });

  if (!company) {
    return {
      status: "EXPIRED",
      isActive: false,
      trialEndsAt: null,
      daysRemaining: null,
      plan: null,
      employeeLimit: 0,
    };
  }

  const now = new Date();
  let status = company.subscriptionStatus as SubscriptionStatus;
  let isActive = false;
  let daysRemaining: number | null = null;

  // Si c'est un trial, vérifier s'il est expiré
  if (status === "TRIAL" && company.trialEndsAt) {
    const trialEnd = new Date(company.trialEndsAt);
    daysRemaining = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (trialEnd < now) {
      // Trial expiré
      status = "EXPIRED";
      daysRemaining = 0;

      // Mettre à jour le statut en base
      await prisma.company.update({
        where: { id: companyId },
        data: { subscriptionStatus: "EXPIRED" },
      });
    } else {
      // Trial encore actif
      isActive = true;
    }
  } else if (status === "ACTIVE") {
    isActive = true;
  }

  return {
    status,
    isActive,
    trialEndsAt: company.trialEndsAt,
    daysRemaining,
    plan: company.subscriptionPlan,
    employeeLimit: company.employeeLimit,
  };
}

/**
 * Retourne le nombre de jours restants du trial (pour affichage)
 */
export function formatTrialRemaining(daysRemaining: number | null): string {
  if (daysRemaining === null) return "";
  if (daysRemaining <= 0) return "Essai expiré";
  if (daysRemaining === 1) return "1 jour restant";
  return `${daysRemaining} jours restants`;
}
