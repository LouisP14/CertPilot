import { auth } from "@/lib/auth";
import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { filename } = await params;

    // Prevent path traversal
    const sanitized = path.basename(filename);
    if (sanitized !== filename || !filename.endsWith(".pdf")) {
      return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads", "certificates", sanitized);

    const buffer = await readFile(filePath).catch(() => null);
    if (!buffer) {
      return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${sanitized}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Serve certificate PDF error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la lecture du fichier" },
      { status: 500 },
    );
  }
}
