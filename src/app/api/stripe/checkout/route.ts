import { getPlanConfig, stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

// POST - Créer une session de paiement Stripe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, contactRequestId, customerEmail, companyName, contactName } = body;

    // Vérifier le plan
    const planConfig = getPlanConfig(plan);
    if (!planConfig) {
      return NextResponse.json(
        { error: "Plan invalide" },
        { status: 400 }
      );
    }

    // URLs de redirection
    const baseUrl = process.env.NEXTAUTH_URL || "https://certpilot-production.up.railway.app";
    
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

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Erreur création session Stripe:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
