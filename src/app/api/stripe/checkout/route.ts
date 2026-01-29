import { getPlanConfig } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// POST - Créer une session de paiement Stripe
export async function POST(request: NextRequest) {
  try {
    // Vérifier que STRIPE_SECRET_KEY est définie
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY non définie");
      return NextResponse.json(
        { error: "Configuration Stripe manquante" },
        { status: 500 },
      );
    }

    // Initialiser Stripe avec la clé
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-18.acacia",
    });

    const body = await request.json();
    const { plan, contactRequestId, customerEmail, companyName, contactName } =
      body;

    console.log("Création session Stripe pour:", {
      plan,
      customerEmail,
      companyName,
    });

    // Vérifier le plan
    const planConfig = getPlanConfig(plan);
    if (!planConfig) {
      console.error("Plan invalide:", plan);
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    console.log("Plan config:", planConfig);

    // URLs de redirection
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.certpilot.eu";

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        contactRequestId: contactRequestId || "",
        plan: plan,
        companyName: companyName || "",
        contactName: contactName || "",
        employeeLimit: planConfig.employeeLimit.toString(),
      },
      subscription_data: {
        metadata: {
          contactRequestId: contactRequestId || "",
          plan: plan,
          companyName: companyName || "",
          contactName: contactName || "",
          employeeLimit: planConfig.employeeLimit.toString(),
        },
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      locale: "fr",
      allow_promotion_codes: true,
    });

    console.log("Session Stripe créée:", session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Erreur création session Stripe:", error);

    // Retourner plus de détails sur l'erreur
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur Stripe: ${errorMessage}` },
      { status: 500 },
    );
  }
}
