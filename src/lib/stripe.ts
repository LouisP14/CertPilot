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
export const STRIPE_PLANS = {
  starter: {
    name: "Starter",
    priceId: "price_1SuGItQA2DyQeZPKh9Bl4dMT",
    price: 199,
    employees: "1-50",
    employeeLimit: 50,
  },
  business: {
    name: "Business",
    priceId: "price_1SuGJKQA2DyQeZPKSTegNlTS",
    price: 349,
    employees: "51-100",
    employeeLimit: 100,
  },
  enterprise: {
    name: "Enterprise",
    priceId: "price_1SuGJoQA2DyQeZPKQiVn6X8o",
    price: 599,
    employees: "101-200",
    employeeLimit: 200,
  },
  corporate: {
    name: "Corporate",
    priceId: "price_1SuGKLQA2DyQeZPKr8ABEMEy",
    price: 1199,
    employees: "201-500",
    employeeLimit: 500,
  },
} as const;

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
