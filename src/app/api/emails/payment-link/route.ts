import { sendPaymentLink } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

// POST - Envoyer l'email avec le lien de paiement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, contactName, companyName, plan, paymentUrl } = body;

    if (!to || !contactName || !companyName || !plan || !paymentUrl) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 },
      );
    }

    await sendPaymentLink({
      to,
      contactName,
      companyName,
      plan,
      paymentUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur envoi email paiement:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 },
    );
  }
}
