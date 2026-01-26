import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le certificat existe
    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificat non trouvé" },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    // Vérifier le type de fichier
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Seuls les fichiers PDF sont acceptés" },
        { status: 400 },
      );
    }

    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier ne doit pas dépasser 10 Mo" },
        { status: 400 },
      );
    }

    // Créer le dossier uploads/certificates s'il n'existe pas
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "certificates",
    );
    await mkdir(uploadDir, { recursive: true });

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileName = `cert_${id}_${timestamp}_${randomStr}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Mettre à jour le certificat avec l'URL du fichier
    const attachmentUrl = `/uploads/certificates/${fileName}`;
    await prisma.certificate.update({
      where: { id },
      data: { attachmentUrl },
    });

    return NextResponse.json({
      success: true,
      attachmentUrl,
    });
  } catch (error) {
    console.error("Upload certificate PDF error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Supprimer l'URL du fichier du certificat
    await prisma.certificate.update({
      where: { id },
      data: { attachmentUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete certificate PDF error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 },
    );
  }
}
