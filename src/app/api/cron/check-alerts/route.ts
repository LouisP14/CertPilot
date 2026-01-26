import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Cette API doit être appelée quotidiennement (via Vercel CRON, GitHub Actions, ou un service externe)
// GET /api/cron/check-alerts?secret=VOTRE_SECRET_CRON

export async function GET(request: NextRequest) {
  try {
    // Vérification du secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // En production, vérifier le secret
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer la configuration de l'entreprise
    const company = await prisma.company.findFirst();
    if (!company || !company.adminEmail) {
      return NextResponse.json({
        success: false,
        message: "Pas d'email administrateur configuré",
      });
    }

    // Parser les seuils d'alerte configurés
    const thresholds = company.alertThresholds
      .split(",")
      .map((t) => parseInt(t.trim()))
      .filter((t) => !isNaN(t))
      .sort((a, b) => b - a); // Du plus grand au plus petit

    if (thresholds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucun seuil d'alerte configuré",
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Récupérer tous les certificats non archivés avec date d'expiration
    const certificates = await prisma.certificate.findMany({
      where: {
        isArchived: false,
        expiryDate: { not: null },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            site: true,
          },
        },
        formationType: {
          select: {
            name: true,
          },
        },
        alertLogs: {
          select: {
            alertType: true,
            sentAt: true,
          },
        },
      },
    });

    // Grouper les alertes à envoyer par seuil
    const alertsToSend: {
      threshold: number;
      certificateId: string;
      employeeName: string;
      formationName: string;
      expiryDate: Date;
      daysLeft: number;
      department: string;
      site: string | null;
    }[] = [];

    for (const cert of certificates) {
      if (!cert.expiryDate) continue;

      const expiryDate = new Date(cert.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Trouver le seuil applicable (le premier seuil >= daysLeft)
      // Ex: si daysLeft = 58 et seuils = [90, 60, 30, 7], le seuil applicable est 60
      for (const threshold of thresholds) {
        // On vérifie si on est dans la fenêtre du seuil (entre threshold-1 et threshold)
        // Ou si c'est expiré et on a le seuil "0" (ou on envoie pour expired)
        if (
          daysLeft <= threshold &&
          daysLeft >
            (threshold === Math.min(...thresholds)
              ? -999
              : thresholds[thresholds.indexOf(threshold) + 1] || 0)
        ) {
          const alertType = daysLeft < 0 ? "EXPIRED" : `${threshold}_DAYS`;

          // Vérifier si cette alerte a déjà été envoyée
          const alreadySent = cert.alertLogs.some(
            (log) => log.alertType === alertType,
          );

          if (!alreadySent) {
            alertsToSend.push({
              threshold,
              certificateId: cert.id,
              employeeName: `${cert.employee.lastName} ${cert.employee.firstName}`,
              formationName: cert.formationType.name,
              expiryDate: cert.expiryDate,
              daysLeft,
              department: cert.employee.department,
              site: cert.employee.site,
            });
          }
          break; // Un seul seuil par certificat
        }
      }
    }

    // Si aucune alerte à envoyer
    if (alertsToSend.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucune nouvelle alerte à envoyer",
        alertsSent: 0,
      });
    }

    // Vérifier si SMTP est configuré
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASSWORD;

    if (!smtpConfigured) {
      // Enregistrer les alertes même sans envoi d'email (pour le tracking)
      for (const alert of alertsToSend) {
        await prisma.alertLog.create({
          data: {
            certificateId: alert.certificateId,
            alertType:
              alert.daysLeft < 0 ? "EXPIRED" : `${alert.threshold}_DAYS`,
            recipients: company.adminEmail,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "SMTP non configuré - alertes enregistrées sans envoi",
        alertsSent: alertsToSend.length,
      });
    }

    // Configurer le transporteur email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Grouper les alertes par seuil pour un email récapitulatif
    const alertsByThreshold = alertsToSend.reduce(
      (acc, alert) => {
        const key = alert.daysLeft < 0 ? "EXPIRED" : `${alert.threshold}_DAYS`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(alert);
        return acc;
      },
      {} as Record<string, typeof alertsToSend>,
    );

    // Générer le HTML de l'email
    const generateAlertHtml = () => {
      let html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f8fafc;">
          <div style="background: linear-gradient(135deg, #173B56 0%, #1e4a6b 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Alertes Habilitations</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0;">CertPilot - ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
              Bonjour,<br><br>
              Voici le récapitulatif des habilitations nécessitant votre attention :
            </p>
      `;

      // Alertes expirées en premier
      if (alertsByThreshold["EXPIRED"]) {
        html += `
          <div style="margin-bottom: 25px;">
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
              <h3 style="color: #dc2626; margin: 0 0 5px 0;">❌ Expirées (${alertsByThreshold["EXPIRED"].length})</h3>
              <p style="color: #991b1b; margin: 0; font-size: 14px;">Ces habilitations sont déjà expirées !</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #fef2f2;">
                  <th style="padding: 12px; text-align: left; color: #991b1b; font-size: 13px;">Employé</th>
                  <th style="padding: 12px; text-align: left; color: #991b1b; font-size: 13px;">Formation</th>
                  <th style="padding: 12px; text-align: left; color: #991b1b; font-size: 13px;">Service</th>
                  <th style="padding: 12px; text-align: center; color: #991b1b; font-size: 13px;">Expiré depuis</th>
                </tr>
              </thead>
              <tbody>
                ${alertsByThreshold["EXPIRED"]
                  .map(
                    (a) => `
                  <tr style="border-top: 1px solid #fee2e2;">
                    <td style="padding: 12px; color: #1f2937;">${a.employeeName}</td>
                    <td style="padding: 12px; color: #1f2937;">${a.formationName}</td>
                    <td style="padding: 12px; color: #6b7280;">${a.department}${a.site ? ` - ${a.site}` : ""}</td>
                    <td style="padding: 12px; text-align: center;"><span style="background: #dc2626; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px;">${Math.abs(a.daysLeft)} jour(s)</span></td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
      }

      // Alertes par seuil (du plus urgent au moins urgent)
      const sortedThresholds = Object.keys(alertsByThreshold)
        .filter((k) => k !== "EXPIRED")
        .sort((a, b) => parseInt(a) - parseInt(b));

      for (const threshold of sortedThresholds) {
        const alerts = alertsByThreshold[threshold];
        const days = parseInt(threshold);

        let bgColor, borderColor, textColor, badgeColor;
        if (days <= 7) {
          bgColor = "#fef3c7";
          borderColor = "#f59e0b";
          textColor = "#92400e";
          badgeColor = "#f59e0b";
        } else if (days <= 30) {
          bgColor = "#fef9c3";
          borderColor = "#eab308";
          textColor = "#854d0e";
          badgeColor = "#eab308";
        } else if (days <= 60) {
          bgColor = "#ecfdf5";
          borderColor = "#10b981";
          textColor = "#065f46";
          badgeColor = "#10b981";
        } else {
          bgColor = "#eff6ff";
          borderColor = "#3b82f6";
          textColor = "#1e40af";
          badgeColor = "#3b82f6";
        }

        html += `
          <div style="margin-bottom: 25px;">
            <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
              <h3 style="color: ${textColor}; margin: 0 0 5px 0;">⚠️ Expire dans ${days} jours ou moins (${alerts.length})</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 12px; text-align: left; color: #475569; font-size: 13px;">Employé</th>
                  <th style="padding: 12px; text-align: left; color: #475569; font-size: 13px;">Formation</th>
                  <th style="padding: 12px; text-align: left; color: #475569; font-size: 13px;">Service</th>
                  <th style="padding: 12px; text-align: center; color: #475569; font-size: 13px;">Jours restants</th>
                </tr>
              </thead>
              <tbody>
                ${alerts
                  .map(
                    (a) => `
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 12px; color: #1f2937;">${a.employeeName}</td>
                    <td style="padding: 12px; color: #1f2937;">${a.formationName}</td>
                    <td style="padding: 12px; color: #6b7280;">${a.department}${a.site ? ` - ${a.site}` : ""}</td>
                    <td style="padding: 12px; text-align: center;"><span style="background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px;">${a.daysLeft} jour(s)</span></td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
      }

      html += `
            <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; text-align: center;">
              <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">
                Accédez au tableau de bord pour planifier les recyclages
              </p>
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/formations" 
                 style="display: inline-block; background: #173B56; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                📋 Voir le tableau de bord
              </a>
            </div>
          </div>
          
          <div style="background: #173B56; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
              Cet email a été envoyé automatiquement par CertPilot<br>
              ${company.name}
            </p>
          </div>
        </div>
      `;

      return html;
    };

    // Envoyer l'email récapitulatif
    const mailOptions = {
      from: `"CertPilot - ${company.name}" <${process.env.SMTP_USER}>`,
      to: company.adminEmail,
      subject: `🔔 Alertes Habilitations - ${alertsToSend.length} habilitation(s) à surveiller`,
      html: generateAlertHtml(),
    };

    await transporter.sendMail(mailOptions);

    // Enregistrer toutes les alertes envoyées
    for (const alert of alertsToSend) {
      await prisma.alertLog.create({
        data: {
          certificateId: alert.certificateId,
          alertType: alert.daysLeft < 0 ? "EXPIRED" : `${alert.threshold}_DAYS`,
          recipients: company.adminEmail,
        },
      });
    }

    // Créer aussi des notifications dans le système
    await prisma.notification.create({
      data: {
        type: "FORMATION_EXPIRED",
        title: "Alertes habilitations envoyées",
        message: `${alertsToSend.length} alerte(s) envoyée(s) à ${company.adminEmail}`,
        link: "/dashboard/formations",
      },
    });

    // ========================================
    // CLÔTURE AUTOMATIQUE DES CONVOCATIONS
    // ========================================
    // Passer les convocations envoyées en "completed" quand la date de fin est passée
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

    const closedConvocations = await prisma.convocation.updateMany({
      where: {
        status: "sent",
        endDate: { lt: today }, // Date de fin passée
      },
      data: {
        status: "completed",
      },
    });

    if (closedConvocations.count > 0) {
      console.log(
        `${closedConvocations.count} convocation(s) clôturée(s) automatiquement`,
      );
    }

    return NextResponse.json({
      success: true,
      message: `${alertsToSend.length} alerte(s) envoyée(s) à ${company.adminEmail}`,
      alertsSent: alertsToSend.length,
      convocationsClosed: closedConvocations.count,
      details: alertsByThreshold,
    });
  } catch (error) {
    console.error("CRON check-alerts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la vérification des alertes",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
