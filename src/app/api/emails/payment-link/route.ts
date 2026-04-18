import { auth } from "@/lib/auth";
import { sendPaymentLink } from "@/lib/email";
import { parseBody, paymentLinkSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// POST - Envoyer l'email avec le lien de paiement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = parseBody(paymentLinkSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { to, contactName, companyName, plan, billing, tranche, paymentUrl } = parsed.data;

    await sendPaymentLink({
      to,
      contactName,
      companyName,
      plan,
      billing: (billing as "monthly" | "annual") ?? "monthly",
      tranche: tranche ?? "1-50",
      paymentUrl,
    });

    console.log("[payment-link] Email envoyé à:", to);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur envoi email paiement:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur lors de l'envoi de l'email: ${errorMessage}` },
      { status: 500 },
    );
  }
}
