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

// Configuration des plans CertPilot
// Les price IDs sont dans les variables d'environnement (STRIPE_PRICE_*)
export const STRIPE_PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL || "",
    price: 49,
    annualPrice: 490,
    employees: "1-20",
    employeeLimit: 20,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
    price: 149,
    annualPrice: 1490,
    employees: "21-100",
    employeeLimit: 100,
  },
  business: {
    name: "Business",
    priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_BUSINESS_ANNUAL || "",
    price: 349,
    annualPrice: 3490,
    employees: "101-300",
    employeeLimit: 300,
  },
};

export type PlanKey = keyof typeof STRIPE_PLANS;

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
