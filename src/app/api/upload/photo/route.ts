import { auth } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier les photos" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const employeeId = formData.get("employeeId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    if (!employeeId) {
      return NextResponse.json({ error: "ID employé requis" }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format de fichier non supporté. Utilisez JPG, PNG ou WebP." },
        { status: 400 },
      );
    }

    // Limiter la taille à 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 5MB)" },
        { status: 400 },
      );
    }

    // Générer un nom de fichier unique
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${employeeId}-${Date.now()}.${extension}`;

    // Stockage local (prévu pour Railway avec volume)
    const uploadDir =
      process.env.UPLOADS_DIR ||
      path.join(process.cwd(), "public", "uploads", "photos");

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Utiliser l'API route pour servir les images (fonctionne en prod)
    const photoUrl = `/api/uploads/photos/${fileName}`;
    return NextResponse.json({ url: photoUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de la photo" },
      { status: 500 },
    );
  }
}
