import Stripe from "stripe";

// Initialisation du client Stripe - seulement si la clé est présente
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

// Helper pour vérifier si Stripe est configuré
export function isStripeEnabled() {
  return stripe !== null;
}

// Configuration des plans CertPilot avec structure tranche-aware
// Les price IDs sont dans les variables d'environnement (STRIPE_PRICE_*)
export type PlanKey = "starter" | "pro" | "business";
export type Tranche = "1-50" | "51-150" | "151-300";

export const STRIPE_PLANS: Record<
  PlanKey,
  {
    name: string;
    tranches: Record<
      Tranche,
      {
        employeeLimit: number;
        monthly: { price: number; priceId: string };
        annual: { price: number; priceId: string };
      }
    >;
  }
> = {
  starter: {
    name: "Starter",
    tranches: {
      "1-50": {
        employeeLimit: 50,
        monthly: {
          price: 69,
          priceId: process.env.STRIPE_PRICE_STARTER_50_MONTHLY ?? "",
        },
        annual: {
          price: 57,
          priceId: process.env.STRIPE_PRICE_STARTER_50_ANNUAL ?? "",
        },
      },
      "51-150": {
        employeeLimit: 150,
        monthly: {
          price: 109,
          priceId: process.env.STRIPE_PRICE_STARTER_150_MONTHLY ?? "",
        },
        annual: {
          price: 91,
          priceId: process.env.STRIPE_PRICE_STARTER_150_ANNUAL ?? "",
        },
      },
      "151-300": {
        employeeLimit: 300,
        monthly: {
          price: 149,
          priceId: process.env.STRIPE_PRICE_STARTER_300_MONTHLY ?? "",
        },
        annual: {
          price: 124,
          priceId: process.env.STRIPE_PRICE_STARTER_300_ANNUAL ?? "",
        },
      },
    },
  },
  pro: {
    name: "Pro",
    tranches: {
      "1-50": {
        employeeLimit: 50,
        monthly: {
          price: 149,
          priceId: process.env.STRIPE_PRICE_PRO_50_MONTHLY ?? "",
        },
        annual: {
          price: 124,
          priceId: process.env.STRIPE_PRICE_PRO_50_ANNUAL ?? "",
        },
      },
      "51-150": {
        employeeLimit: 150,
        monthly: {
          price: 229,
          priceId: process.env.STRIPE_PRICE_PRO_150_MONTHLY ?? "",
        },
        annual: {
          price: 190,
          priceId: process.env.STRIPE_PRICE_PRO_150_ANNUAL ?? "",
        },
      },
      "151-300": {
        employeeLimit: 300,
        monthly: {
          price: 329,
          priceId: process.env.STRIPE_PRICE_PRO_300_MONTHLY ?? "",
        },
        annual: {
          price: 273,
          priceId: process.env.STRIPE_PRICE_PRO_300_ANNUAL ?? "",
        },
      },
    },
  },
  business: {
    name: "Business",
    tranches: {
      "1-50": {
        employeeLimit: 50,
        monthly: {
          price: 349,
          priceId: process.env.STRIPE_PRICE_BUSINESS_50_MONTHLY ?? "",
        },
        annual: {
          price: 290,
          priceId: process.env.STRIPE_PRICE_BUSINESS_50_ANNUAL ?? "",
        },
      },
      "51-150": {
        employeeLimit: 150,
        monthly: {
          price: 499,
          priceId: process.env.STRIPE_PRICE_BUSINESS_150_MONTHLY ?? "",
        },
        annual: {
          price: 414,
          priceId: process.env.STRIPE_PRICE_BUSINESS_150_ANNUAL ?? "",
        },
      },
      "151-300": {
        employeeLimit: 300,
        monthly: {
          price: 699,
          priceId: process.env.STRIPE_PRICE_BUSINESS_300_MONTHLY ?? "",
        },
        annual: {
          price: 580,
          priceId: process.env.STRIPE_PRICE_BUSINESS_300_ANNUAL ?? "",
        },
      },
    },
  },
};

// Vérifier si un plan est valide
export function isValidPlan(plan: string): plan is PlanKey {
  return plan in STRIPE_PLANS;
}

// Obtenir la configuration d'un plan
export function getPlanConfig(plan: string) {
  if (isValidPlan(plan)) {
    return STRIPE_PLANS[plan];
  }
  return null;
}

// Obtenir un price ID spécifique pour un plan, une tranche et un mode de facturation
export function getPriceId(
  plan: PlanKey,
  tranche: Tranche,
  billing: "monthly" | "annual"
): string {
  return STRIPE_PLANS[plan].tranches[tranche][billing].priceId;
}
