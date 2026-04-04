import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateSecret } from "otplib";
import QRCode from "qrcode";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
    }

    const secret = generateSecret();
    const uri = `otpauth://totp/CertPilot:${encodeURIComponent(session.user.email)}?secret=${secret}&issuer=CertPilot`;
    const qrCode = await QRCode.toDataURL(uri);

    // Ne pas stocker en DB ici — seulement retourner pour confirmation
    return NextResponse.json({ secret, qrCode });
  } catch (error) {
    console.error("POST totp/setup error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
