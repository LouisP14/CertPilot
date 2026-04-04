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

    // Sécurité : empêcher la traversée de répertoire
    const sanitized = path.basename(filename);
    if (sanitized !== filename) {
      return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
    }

    const uploadDir =
      process.env.UPLOADS_DIR ||
      path.join(process.cwd(), "public", "uploads", "photos");

    const filePath = path.join(uploadDir, sanitized);

    const fileBuffer = await readFile(filePath);

    // Déterminer le content-type
    const ext = filename.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
