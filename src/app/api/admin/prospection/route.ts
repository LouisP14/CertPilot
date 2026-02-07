import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "CertPilot <contact@certpilot.eu>";

interface ProspectEmail {
  to: string;
  firstName: string;
  company: string;
  sector: string;
}

function getEmailContent(prospect: ProspectEmail) {
  const sectorExamples: Record<string, string> = {
    "aero-defense":
      "habilitations électriques, CACES, travaux en hauteur ou formations sûreté",
    energie:
      "habilitations électriques, ATEX, radioprotection ou formations sécurité",
    industrie:
      "habilitations électriques, CACES, formations machines ou travaux en hauteur",
    chimie:
      "habilitations ATEX, risques chimiques, formations sécurité ou premiers secours",
    btp: "habilitations électriques, CACES, travaux en hauteur ou SST",
    transport: "FIMO/FCO, ADR, CACES ou formations sécurité transport",
    it: "formations certifiantes, habilitations techniques ou mises à jour réglementaires",
    retail:
      "formations hygiène, SST, sécurité incendie ou habilitations spécifiques",
    autre:
      "habilitations réglementaires, SST, formations obligatoires ou certifications",
  };

  const examples = sectorExamples[prospect.sector] || sectorExamples["autre"];

  const subject = `${prospect.company} — vos habilitations sont-elles toutes à jour ?`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1a1a1a; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 0 auto; padding: 30px 20px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
        .signature a { color: #10b981; text-decoration: none; }
        .cta { display: inline-block; margin: 20px 0; padding: 12px 28px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
        .unsub { margin-top: 25px; font-size: 11px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Bonjour ${prospect.firstName},</p>

        <p>Je me permets de vous contacter car chez <strong>${prospect.company}</strong>, vous gérez probablement le suivi de ${examples}.</p>

        <p>Beaucoup d'entreprises de votre secteur utilisent encore Excel pour suivre tout ça. Le résultat : des échéances oubliées, des non-conformités découvertes en audit, et des heures perdues à générer des convocations.</p>

        <p><strong>CertPilot</strong> est une plateforme en ligne qui automatise tout le suivi des formations et habilitations :</p>

        <ul style="padding-left: 20px;">
          <li>📊 <strong>Tableau de bord</strong> — conformité de chaque équipe en temps réel</li>
          <li>🔔 <strong>Alertes automatiques</strong> — plus jamais d'habilitation expirée par oubli</li>
          <li>📧 <strong>Convocations par email</strong> — générées et envoyées en 2 clics</li>
          <li>✍️ <strong>Signature électronique</strong> — attestations signées sur tablette</li>
          <li>📄 <strong>Passeport formation PDF</strong> — un document complet par collaborateur</li>
          <li>🔒 <strong>Audit trail</strong> — traçabilité totale pour vos audits</li>
        </ul>

        <p>Seriez-vous disponible pour un échange de 15 minutes cette semaine ?</p>

        <a href="https://www.certpilot.eu/contact" class="cta">Demander une démo gratuite</a>

        <div class="signature">
          <p>
            <strong>Louis Poulain</strong><br>
            Fondateur — CertPilot<br>
            <a href="https://www.certpilot.eu">www.certpilot.eu</a> | <a href="mailto:contact@certpilot.eu">contact@certpilot.eu</a>
          </p>
        </div>

        <p class="unsub">Si ce sujet ne vous concerne pas, je m'excuse pour le dérangement. Répondez simplement "stop" et vous ne recevrez plus de message de ma part.</p>
      </div>
    </body>
    </html>
  `;

  const text = `Bonjour ${prospect.firstName},

Je me permets de vous contacter car chez ${prospect.company}, vous gérez probablement le suivi de ${examples}.

Beaucoup d'entreprises de votre secteur utilisent encore Excel pour suivre tout ça. Le résultat : des échéances oubliées, des non-conformités découvertes en audit, et des heures perdues à générer des convocations.

CertPilot est une plateforme en ligne qui automatise tout le suivi des formations et habilitations :
- Tableau de bord — conformité de chaque équipe en temps réel
- Alertes automatiques — plus jamais d'habilitation expirée par oubli
- Convocations par email — générées et envoyées en 2 clics
- Signature électronique — attestations signées sur tablette
- Passeport formation PDF — un document complet par collaborateur
- Audit trail — traçabilité totale pour vos audits

Seriez-vous disponible pour un échange de 15 minutes cette semaine ?

👉 Demander une démo : https://www.certpilot.eu/contact

Louis Poulain
Fondateur — CertPilot
https://www.certpilot.eu | contact@certpilot.eu

---
Si ce sujet ne vous concerne pas, répondez "stop" et vous ne recevrez plus de message.`;

  return { subject, html, text };
}

// POST - Envoyer des emails de prospection (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Resend non configuré" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { prospects } = body as { prospects: ProspectEmail[] };

    if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
      return NextResponse.json(
        { error: "Liste de prospects requise" },
        { status: 400 },
      );
    }

    const results: { email: string; status: string; error?: string }[] = [];

    for (const prospect of prospects) {
      try {
        const { subject, html, text } = getEmailContent(prospect);

        await resend.emails.send({
          from: FROM_EMAIL,
          to: prospect.to,
          subject,
          html,
          text,
          replyTo: "contact@certpilot.eu",
        });

        results.push({ email: prospect.to, status: "sent" });

        // Pause 2s entre chaque email pour éviter le rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Erreur envoi à ${prospect.to}:`, error);
        results.push({
          email: prospect.to,
          status: "error",
          error: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: `${sent} email(s) envoyé(s), ${failed} erreur(s)`,
      results,
    });
  } catch (error) {
    console.error("Erreur prospection:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi" },
      { status: 500 },
    );
  }
}
