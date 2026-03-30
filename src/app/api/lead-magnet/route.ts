import prisma from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().default("checklist"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`lead:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Trop de tentatives." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 },
      );
    }

    const { email, name, source } = parsed.data;

    await prisma.leadCapture.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source,
      },
    });

    return NextResponse.json({
      success: true,
      downloadUrl: "/documents/checklist-conformite-habilitations-2026.pdf",
    });
  } catch (error) {
    console.error("Lead magnet error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 },
    );
  }
}
