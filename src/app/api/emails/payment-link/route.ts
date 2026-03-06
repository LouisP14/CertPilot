import { sendPaymentLink } from "@/lib/email";
import { parseBody, paymentLinkSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// POST - Envoyer l'email avec le lien de paiement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(paymentLinkSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { to, contactName, companyName, plan, billing, paymentUrl } = parsed.data;

    console.log("Envoi email paiement à:", to);
    console.log("SMTP config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
    });

    await sendPaymentLink({
      to,
      contactName,
      companyName,
      plan,
      billing: (billing as "monthly" | "annual") ?? "monthly",
      paymentUrl,
    });

    console.log("Email envoyé avec succès à:", to);
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
